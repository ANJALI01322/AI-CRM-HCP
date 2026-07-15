from fastapi import APIRouter
from pydantic import BaseModel

from app.langgraph.workflow import crm_graph

router = APIRouter(prefix="/interaction", tags=["Interaction"])


class InteractionRequest(BaseModel):
    notes: str


@router.post("/ai")
def generate_ai(request: InteractionRequest):

    result = crm_graph.invoke(
        {
            "action": "log",
            "input": request.notes,
            "output": ""
        }
    )

    return {
        "success": True,
        "data": result["output"]
    }