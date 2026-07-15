
from typing import TypedDict

from langgraph.graph import StateGraph

from app.tools.log_interaction import log_interaction
from app.tools.edit_interaction import edit_interaction
from app.tools.search_hcp import search_hcp
from app.tools.followup import followup
from app.tools.insights import interaction_insights


class CRMState(TypedDict):
    action: str
    input: str
    output: str


def router(state: CRMState):

    action = state["action"]

    if action == "log":
        return {
            "output": log_interaction(state["input"])
        }

    elif action == "edit":
        return {
            "output": edit_interaction(
                state["input"],
                "Update interaction"
            )
        }

    elif action == "search":
        return {
            "output": search_hcp(state["input"])
        }

    elif action == "followup":
        return {
            "output": followup(state["input"])
        }

    elif action == "insights":
        return {
            "output": interaction_insights(state["input"])
        }

    return {
        "output": "Invalid Action"
    }


builder = StateGraph(CRMState)

builder.add_node("router", router)

builder.set_entry_point("router")

builder.set_finish_point("router")
crm_graph = builder.compile()