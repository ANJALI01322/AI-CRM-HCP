import logging

from fastapi import APIRouter, FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.agents.crm_agent import check_llm
from app.api.auth import router as auth_router
from app.api.chat import router as chat_router
from app.api.dashboard import router as dashboard_router
from app.api.exports import router as exports_router
from app.api.follow_ups import router as follow_ups_router
from app.api.hcps import router as hcps_router
from app.api.interaction import router as interaction_router
from app.api.interactions import router as interactions_router
from app.api.products import router as products_router
from app.api.team import router as team_router
from app.core import config
from app.core.errors import register_exception_handlers
from app.core.logging_config import setup_logging
from app.core.middleware import RequestContextMiddleware, SecurityHeadersMiddleware
from app.database.database import check_database

API_PREFIX = "/api"

setup_logging(config.LOG_LEVEL)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="AI CRM HCP API",
    version="1.0.0",
    description="AI First CRM for Healthcare Professionals",
    # Only /api/* reaches this service on Vercel, so docs must live under it too.
    docs_url=f"{API_PREFIX}/docs",
    redoc_url=None,
    openapi_url=f"{API_PREFIX}/openapi.json",
)

register_exception_handlers(app)

# Added innermost-first: request context/logging, then security headers, then CORS outermost,
# so every response (including errors) carries CORS and security headers.
app.add_middleware(RequestContextMiddleware)
app.add_middleware(SecurityHeadersMiddleware)
app.add_middleware(
    CORSMiddleware,
    allow_origins=config.ALLOWED_ORIGINS,
    # Browsers reject credentialed requests against a wildcard origin.
    allow_credentials="*" not in config.ALLOWED_ORIGINS,
    allow_methods=["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type", "X-TZ-Offset", "X-Request-ID"],
    expose_headers=["Content-Disposition", "X-Request-ID", "Retry-After"],
    max_age=600,
)

api = APIRouter(prefix=API_PREFIX)


@api.get("/health", tags=["Health"])
def health():
    db = check_database()
    llm = check_llm()
    healthy = db == "ok" and llm.startswith("ok")
    if not healthy:
        # Details stay in the server log; the public endpoint only says which part is down.
        logger.warning("Health check degraded: db=%s llm=%s", db, llm)
    return JSONResponse(
        status_code=200 if healthy else 503,
        content={
            "status": "ok" if healthy else "degraded",
            "db": "ok" if db == "ok" else "error",
            "llm": llm if llm.startswith("ok") else "error",
        },
    )


api.include_router(auth_router)
api.include_router(chat_router)
api.include_router(interaction_router)
api.include_router(dashboard_router)
api.include_router(hcps_router)
api.include_router(interactions_router)
api.include_router(follow_ups_router)
api.include_router(products_router)
api.include_router(exports_router)
api.include_router(team_router)

app.include_router(api)
