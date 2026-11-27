"""Interaction extraction graph: extract -> validate -(retry once)-> match_hcp -> END.

The graph never writes to the database: it returns a draft that the rep reviews
and confirms through POST /api/interactions.
"""

import re
from datetime import date
from difflib import SequenceMatcher
from typing import Literal, TypedDict

from langchain_core.exceptions import OutputParserException
from langchain_core.messages import HumanMessage, SystemMessage
from langgraph.graph import END, StateGraph
from pydantic import BaseModel, Field, ValidationError

from app.agents.crm_agent import get_llm

MAX_EXTRACT_ATTEMPTS = 2  # first try + one retry
CONFIDENT_SCORE = 0.8
CONFIDENT_MARGIN = 0.1
MIN_CANDIDATE_SCORE = 0.45


class ExtractedInteraction(BaseModel):
    """Structured facts from a field rep's visit notes."""

    hcp_name: str | None = Field(None, description="Doctor's name as written in the notes, or null if not mentioned")
    hospital: str | None = Field(None, description="Hospital or clinic name, or null if not mentioned")
    products: list[str] = Field(default_factory=list, description="Products discussed, as named in the notes")
    sentiment: Literal["positive", "neutral", "negative"] = Field(
        description="Doctor's overall attitude during the visit"
    )
    objections: list[str] = Field(default_factory=list, description="Concerns or objections the doctor raised")
    follow_up_date: date | None = Field(
        None, description="Agreed next-contact date in YYYY-MM-DD, resolved against today's date; null if none"
    )
    summary: str = Field(description="2-3 sentence factual summary of the visit")


class ExtractState(TypedDict, total=False):
    notes: str
    today: date
    hcps: list[dict]  # caller-scoped HCPs: {id, name, hospital, specialty}
    draft: dict | None
    error: str | None
    attempts: int
    match: dict


SYSTEM_PROMPT = """You extract structured CRM data from a pharmaceutical field rep's visit notes.
Today's date is {today}. Resolve relative dates ("next Tuesday", "in two weeks") against it.
Use only facts stated in the notes. Never invent names, products, objections or dates:
use null or an empty list when something is not mentioned."""


def extract(state: ExtractState) -> ExtractState:
    attempts = state.get("attempts", 0) + 1
    messages = [
        SystemMessage(SYSTEM_PROMPT.format(today=state["today"].isoformat())),
        HumanMessage(state["notes"]),
    ]
    if state.get("error"):
        messages.append(
            HumanMessage(f"Your previous answer was rejected: {state['error']}. Return a corrected answer.")
        )
    try:
        result = get_llm().with_structured_output(ExtractedInteraction).invoke(messages)
        if result is None:
            raise OutputParserException("model returned no structured output")
        if not isinstance(result, ExtractedInteraction):
            result = ExtractedInteraction.model_validate(result)
    except (OutputParserException, ValidationError) as exc:
        return {"draft": None, "error": f"unparseable output ({str(exc).splitlines()[0][:200]})", "attempts": attempts}
    return {"draft": result.model_dump(mode="json"), "error": None, "attempts": attempts}


def validate(state: ExtractState) -> ExtractState:
    if state.get("draft") is None:
        return {}  # extract already recorded the error
    draft = ExtractedInteraction.model_validate(state["draft"])
    problems = []
    if not draft.summary.strip():
        problems.append("summary is empty")
    if draft.follow_up_date and draft.follow_up_date < state["today"]:
        problems.append(
            f"follow_up_date {draft.follow_up_date} is before today ({state['today']})"
        )
    if problems:
        return {"error": "; ".join(problems)}

    def clean(items: list[str]) -> list[str]:
        seen, out = set(), []
        for item in (i.strip() for i in items):
            if item and item.lower() not in seen:
                seen.add(item.lower())
                out.append(item[:120])
        return out[:20]

    draft.products = clean(draft.products)
    draft.objections = clean(draft.objections)
    return {"draft": draft.model_dump(mode="json"), "error": None}


def after_validate(state: ExtractState) -> str:
    if state.get("error"):
        return "extract" if state.get("attempts", 0) < MAX_EXTRACT_ATTEMPTS else END
    return "match_hcp"


_TITLE = re.compile(r"^(dr|doctor|prof)\.?\s+", re.IGNORECASE)


def _norm(name: str) -> str:
    name = _TITLE.sub("", name.strip().lower())
    return re.sub(r"[^a-z0-9 ]+", " ", name).strip()


def name_score(query: str, candidate: str) -> float:
    q, c = _norm(query), _norm(candidate)
    if not q or not c:
        return 0.0
    ratio = SequenceMatcher(None, q, c).ratio()
    q_tokens, c_tokens = set(q.split()), set(c.split())
    overlap = len(q_tokens & c_tokens) / len(q_tokens)
    return max(ratio, overlap * 0.9)


def match_hcp(state: ExtractState) -> ExtractState:
    draft = state["draft"]
    name, hospital = draft.get("hcp_name"), (draft.get("hospital") or "").lower()
    if not name:
        return {"match": {"hcp_id": None, "confident": False, "candidates": []}}

    scored = []
    for hcp in state.get("hcps", []):
        score = name_score(name, hcp["name"])
        if hospital and hcp.get("hospital") and _norm(hospital) in _norm(hcp["hospital"]):
            score = min(1.0, score + 0.05)
        if score >= MIN_CANDIDATE_SCORE:
            scored.append({**hcp, "score": round(score, 3)})
    scored.sort(key=lambda h: h["score"], reverse=True)
    top = scored[:3]

    confident = bool(top) and top[0]["score"] >= CONFIDENT_SCORE and (
        len(top) == 1 or top[0]["score"] - top[1]["score"] >= CONFIDENT_MARGIN
    )
    return {
        "match": {
            "hcp_id": top[0]["id"] if confident else None,
            "confident": confident,
            "candidates": top,
        }
    }


builder = StateGraph(ExtractState)
builder.add_node("extract", extract)
builder.add_node("validate", validate)
builder.add_node("match_hcp", match_hcp)
builder.set_entry_point("extract")
builder.add_edge("extract", "validate")
builder.add_conditional_edges("validate", after_validate, {"extract": "extract", "match_hcp": "match_hcp", END: END})
builder.add_edge("match_hcp", END)

extraction_graph = builder.compile()
