import logging
import time
from typing import Literal

import groq
from fastapi import APIRouter, Depends, HTTPException
from langgraph.errors import GraphRecursionError
from pydantic import Field
from sqlalchemy.orm import Session

from app.agents.chat_agent import run_chat
from app.agents.crm_agent import LLMNotConfigured
from app.api.deps import Clock, RequestContext, client_clock, db_session, get_context
from app.core import config
from app.core.rate_limit import RateLimiter
from app.models import User
from app.schemas.common import CamelModel

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/chat", tags=["AI Analyst"])

chat_limiter = RateLimiter(limit=20, window_seconds=60)

MAX_HISTORY = 10


class ChatTurn(CamelModel):
    role: Literal["user", "assistant"]
    content: str = Field(min_length=1, max_length=4000)


class ChatRequest(CamelModel):
    message: str = Field(min_length=1, max_length=2000)
    history: list[ChatTurn] = Field(default_factory=list, max_length=50)


class ChatAnswerOut(CamelModel):
    kind: Literal["answer", "no_data", "off_topic"]
    title: str
    evidence: str | None = None
    interpretation: str | None = None
    recommendation: str | None = None
    message: str | None = None


class ChatResponse(CamelModel):
    answer: ChatAnswerOut
    tools_used: list[str]
    model: str
    latency_ms: int


@router.post("", response_model=ChatResponse)
def chat(
    payload: ChatRequest,
    ctx: RequestContext = Depends(get_context),
    db: Session = Depends(db_session),
    clock: Clock = Depends(client_clock),
):
    chat_limiter.check(f"user:{ctx.user_id}")
    history = [t.model_dump() for t in payload.history[-MAX_HISTORY:]]
    user = db.get(User, ctx.user_id)

    started = time.perf_counter()
    try:
        answer, tools_used = run_chat(db, ctx, clock, user.full_name, payload.message, history)
    except LLMNotConfigured as exc:
        raise HTTPException(status_code=503, detail=f"AI service unavailable: {exc}")
    except GraphRecursionError:
        raise HTTPException(status_code=422, detail="The question needed too many steps. Try asking something narrower.")
    except groq.RateLimitError:
        raise HTTPException(status_code=429, detail="AI provider rate limit reached. Please retry in a minute.")
    except Exception:
        logger.exception("AI analyst request failed")
        raise HTTPException(status_code=503, detail="AI service unavailable")

    return ChatResponse(
        answer=answer,
        tools_used=tools_used,
        model=config.MODEL_NAME,
        latency_ms=int((time.perf_counter() - started) * 1000),
    )
