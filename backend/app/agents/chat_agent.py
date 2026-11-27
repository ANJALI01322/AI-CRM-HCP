"""AI Analyst: LangGraph tool-calling agent grounded in the caller's CRM data.

agent <-> tools (loop until the model stops calling tools) -> respond (structured answer) -> END
Every tool is bound to the caller's org/role scope, so the model can only see what the user can.
"""

import json
from typing import Annotated, Literal, TypedDict

from langchain_core.messages import AIMessage, AnyMessage, HumanMessage, SystemMessage
from langchain_core.tools import tool
from langgraph.graph import END, StateGraph
from langgraph.graph.message import add_messages
from langgraph.prebuilt import ToolNode, tools_condition
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.agents.crm_agent import get_llm
from app.api.deps import Clock, RequestContext
from app.services import crm_queries as q

MAX_STEPS = 10  # LangGraph recursion limit: bounds the agent/tool loop


class ChatAnswer(BaseModel):
    """Final answer shown to the user as a card."""

    kind: Literal["answer", "no_data", "off_topic"] = Field(
        description="answer: grounded in tool results; no_data: the CRM has no data for the question; "
        "off_topic: not about this CRM's HCPs, interactions, follow-ups or territory"
    )
    title: str = Field(description="Short headline, max 80 characters")
    evidence: str | None = Field(None, description="Facts and numbers taken verbatim from tool results")
    interpretation: str | None = Field(None, description="What the evidence means for the rep, without new facts")
    recommendation: str | None = Field(None, description="One concrete next action based on the evidence")
    message: str | None = Field(None, description="For no_data / off_topic: the polite explanation to show")


class ChatState(TypedDict, total=False):
    messages: Annotated[list[AnyMessage], add_messages]
    answer: dict


SYSTEM_PROMPT = """You are the AI Analyst inside OmniHealth CRM, used by pharmaceutical field teams.
User: {name} ({role}). Data scope: {scope}. Today is {today}.

Rules:
- Answer ONLY questions about this CRM's HCPs, interactions, follow-ups, products discussed and territory,
  or field-sales planning based on that data.
- Always call a tool before stating any CRM fact. Use only facts returned by tools.
- Never invent doctors, numbers, dates, clinical trial results or product claims.
- If the tools return nothing relevant, say plainly that the CRM has no data for it.
- Politely decline anything else (general knowledge, coding, medical advice, other companies)."""

RESPOND_PROMPT = """Write the final answer to the user's last question from the conversation above.
Use only facts present in tool results; do not add outside knowledge.
- kind=answer: fill ALL of
  evidence: readable "- " bullet points with the specific facts used (names, dates, counts, quotes from notes).
            Never paste raw JSON.
  interpretation: 1-3 sentences on what those facts mean for the rep.
  recommendation: 1-2 concrete next actions grounded in the evidence.
- kind=no_data: tools returned nothing relevant; say what is missing in `message`.
- kind=off_topic: the question is outside this CRM's data; decline politely in `message`."""


def build_tools(db: Session, ctx: RequestContext, clock: Clock) -> list:
    def dump(data) -> str:
        return json.dumps(data, default=str)

    @tool
    def get_hcp_profile(name: str) -> str:
        """Profile of one HCP by name: specialty, hospital, tier, priority, last visit, recent interactions
        and open follow-ups."""
        matches = q.find_hcps(db, ctx, name)
        if not matches:
            return dump({"found": False, "message": f"No HCP matching '{name}' in this user's scope."})
        hcp, score = matches[0]
        result = {"found": True, "match_score": score, "profile": q.hcp_profile(db, ctx, clock, hcp)}
        if len(matches) > 1:
            result["other_possible_matches"] = [h.name for h, _ in matches[1:]]
        return dump(result)

    @tool
    def list_recent_interactions(hcp_name: str | None = None, days: int = 30, limit: int = 10) -> str:
        """Most recent logged interactions, newest first. Optionally filter to one HCP by name.
        days: look-back window (1-365). limit: max rows (1-20)."""
        days, limit = max(1, min(days, 365)), max(1, min(limit, 20))
        hcp_id = None
        if hcp_name:
            matches = q.find_hcps(db, ctx, hcp_name, limit=1)
            if not matches:
                return dump({"found": False, "message": f"No HCP matching '{hcp_name}' in this user's scope."})
            hcp_id = matches[0][0].id
        rows = q.recent_interactions(db, ctx, clock, hcp_id=hcp_id, days=days, limit=limit)
        return dump({"days": days, "count": len(rows), "interactions": rows})

    @tool
    def list_overdue_follow_ups() -> str:
        """Open follow-ups whose due date is before today, oldest first."""
        rows = q.open_follow_ups(db, ctx, clock, overdue_only=True)
        return dump({"today": clock.today.isoformat(), "count": len(rows), "follow_ups": rows})

    @tool
    def territory_summary() -> str:
        """Territory overview: HCP count, interactions and sentiment in the last 30 days, top products,
        open and overdue follow-ups, HCPs not contacted in 30+ days."""
        return dump(q.territory_summary(db, ctx, clock))

    return [get_hcp_profile, list_recent_interactions, list_overdue_follow_ups, territory_summary]


def build_graph(tools: list):
    llm = get_llm()
    llm_with_tools = llm.bind_tools(tools)

    def agent(state: ChatState) -> ChatState:
        return {"messages": [llm_with_tools.invoke(state["messages"])]}

    def respond(state: ChatState) -> ChatState:
        answer = llm.with_structured_output(ChatAnswer).invoke(
            state["messages"] + [HumanMessage(RESPOND_PROMPT)]
        )
        if not isinstance(answer, ChatAnswer):
            answer = ChatAnswer.model_validate(answer)
        return {"answer": answer.model_dump()}

    builder = StateGraph(ChatState)
    builder.add_node("agent", agent)
    builder.add_node("tools", ToolNode(tools))
    builder.add_node("respond", respond)
    builder.set_entry_point("agent")
    builder.add_conditional_edges("agent", tools_condition, {"tools": "tools", END: "respond"})
    builder.add_edge("tools", "agent")
    builder.add_edge("respond", END)
    return builder.compile()


def run_chat(
    db: Session, ctx: RequestContext, clock: Clock, user_name: str, message: str, history: list[dict]
) -> tuple[dict, list[str]]:
    """Return (answer, names of tools used)."""
    system = SystemMessage(
        SYSTEM_PROMPT.format(
            name=user_name,
            role=ctx.role,
            scope="whole organization" if ctx.is_manager else "HCPs assigned to this rep and the rep's own activity",
            today=clock.today.isoformat(),
        )
    )
    past = [
        HumanMessage(h["content"]) if h["role"] == "user" else AIMessage(h["content"])
        for h in history
    ]
    graph = build_graph(build_tools(db, ctx, clock))
    result = graph.invoke(
        {"messages": [system, *past, HumanMessage(message)]}, config={"recursion_limit": MAX_STEPS}
    )
    tools_used = sorted(
        {call["name"] for m in result["messages"] for call in (getattr(m, "tool_calls", None) or [])}
    )
    return result["answer"], tools_used
