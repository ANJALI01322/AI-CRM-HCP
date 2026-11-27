import logging

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.agents.crm_agent import LLMNotConfigured
from app.langgraph.workflow import crm_graph

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/interaction", tags=["Interaction"])


class InteractionRequest(BaseModel):
    notes: str


@router.post("/ai")
def generate_ai(request: InteractionRequest):
    try:
        result = crm_graph.invoke(
            {
                "action": "log",
                "input": request.notes,
                "output": ""
            }
        )
    except LLMNotConfigured as exc:
        logger.error("AI request rejected: %s", exc)
        raise HTTPException(status_code=503, detail=f"AI service unavailable: {exc}")
    except Exception:
        logger.exception("AI request failed")
        raise HTTPException(status_code=503, detail="AI service unavailable")

    return {
        "success": True,
        "data": result["output"]
    }
