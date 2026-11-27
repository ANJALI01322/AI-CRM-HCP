"""Environment-driven settings. Read once at import; never raises on missing values."""

import os

from dotenv import load_dotenv

# Local development only: on Vercel there is no .env file and real env vars win.
load_dotenv()

DEFAULT_MODEL_NAME = "openai/gpt-oss-120b"


def _clean(value: str | None) -> str | None:
    value = (value or "").strip()
    return value or None


DATABASE_URL = _clean(os.getenv("DATABASE_URL"))
GROQ_API_KEY = _clean(os.getenv("GROQ_API_KEY"))
MODEL_NAME = _clean(os.getenv("MODEL_NAME")) or DEFAULT_MODEL_NAME

# Until auth exists, every request acts as this org / user (created by seed.py).
DEMO_ORG_SLUG = _clean(os.getenv("DEMO_ORG_SLUG")) or "demo"
DEMO_USER_EMAIL = _clean(os.getenv("DEMO_USER_EMAIL"))

ALLOWED_ORIGINS = [
    origin.strip().rstrip("/")
    for origin in (os.getenv("ALLOWED_ORIGINS") or "http://localhost:5173").split(",")
    if origin.strip()
]
