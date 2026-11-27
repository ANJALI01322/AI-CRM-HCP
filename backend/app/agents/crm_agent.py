import threading
import time
from functools import lru_cache

from groq import Groq
from langchain_groq import ChatGroq

from app.core import config


class LLMNotConfigured(RuntimeError):
    pass


@lru_cache(maxsize=1)
def get_llm() -> ChatGroq:
    """Build the client on first use so a missing GROQ_API_KEY never breaks app import."""
    if not config.GROQ_API_KEY:
        raise LLMNotConfigured("GROQ_API_KEY is not set")
    return ChatGroq(
        api_key=config.GROQ_API_KEY,
        model=config.MODEL_NAME,
        temperature=0.2,
        timeout=25,
        max_retries=1,
    )


_LLM_CHECK_TTL_SECONDS = 60
_llm_check_cache: tuple[float, str] | None = None
_llm_check_lock = threading.Lock()


def check_llm() -> str:
    """Cached for 60s so health polling doesn't hit Groq on every request."""
    global _llm_check_cache
    with _llm_check_lock:
        if _llm_check_cache and time.monotonic() - _llm_check_cache[0] < _LLM_CHECK_TTL_SECONDS:
            return _llm_check_cache[1]
        result = _check_llm_uncached()
        _llm_check_cache = (time.monotonic(), result)
        return result


def _check_llm_uncached() -> str:
    """Verify the key and model with Groq's models endpoint (no tokens spent). Never raises."""
    if not config.GROQ_API_KEY:
        return "error: GROQ_API_KEY is not set"
    try:
        Groq(api_key=config.GROQ_API_KEY, timeout=5.0, max_retries=0).models.retrieve(
            config.MODEL_NAME
        )
        return f"ok ({config.MODEL_NAME})"
    except Exception as exc:
        return f"error: {type(exc).__name__} for model {config.MODEL_NAME}: {str(exc).splitlines()[0][:200]}"
