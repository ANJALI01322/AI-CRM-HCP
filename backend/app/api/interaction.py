import logging
import time
from datetime import date

import groq
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.agents.crm_agent import LLMNotConfigured
from app.api.crud import scope
from app.api.deps import RequestContext, db_session, get_context, local_today
from app.core import config
from app.langgraph.workflow import extraction_graph
from app.models import HCP
from app.schemas.ai import ExtractRequest, ExtractResponse

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/interaction", tags=["Interaction"], dependencies=[Depends(get_context)])


@router.post("/ai/extract", response_model=ExtractResponse)
def extract_interaction(
    payload: ExtractRequest,
    ctx: RequestContext = Depends(get_context),
    db: Session = Depends(db_session),
    today: date = Depends(local_today),
):
    """Turn free-text visit notes into a draft interaction. Nothing is saved."""
    rows = db.execute(select(HCP.id, HCP.name, HCP.hospital, HCP.specialty).where(*scope(HCP, ctx)))
    hcps = [dict(r._mapping) for r in rows]

    started = time.perf_counter()
    try:
        result = extraction_graph.invoke({"notes": payload.notes, "today": today, "hcps": hcps})
    except LLMNotConfigured as exc:
        raise HTTPException(status_code=503, detail=f"AI service unavailable: {exc}")
    except groq.RateLimitError:
        raise HTTPException(status_code=429, detail="AI provider rate limit reached. Please retry in a minute.")
    except Exception:
        logger.exception("AI extraction failed")
        raise HTTPException(status_code=503, detail="AI service unavailable")
    latency_ms = int((time.perf_counter() - started) * 1000)

    if result.get("error") or not result.get("draft"):
        logger.warning("AI extraction rejected after %s attempts: %s", result.get("attempts"), result.get("error"))
        raise HTTPException(
            status_code=422,
            detail=f"AI could not produce a valid draft: {result.get('error') or 'empty result'}. Edit the notes and try again.",
        )
    return ExtractResponse(
        draft=result["draft"],
        match=result["match"],
        model=config.MODEL_NAME,
        latency_ms=latency_ms,
        attempts=result["attempts"],
    )

