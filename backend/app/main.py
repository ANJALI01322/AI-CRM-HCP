from fastapi import APIRouter, FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.agents.crm_agent import check_llm
from app.api.auth import router as auth_router
from app.api.chat import router as chat_router
from app.api.dashboard import router as dashboard_router
from app.api.follow_ups import router as follow_ups_router
from app.api.hcps import router as hcps_router
from app.api.interaction import router as interaction_router
from app.api.interactions import router as interactions_router
from app.core import config
from app.database.database import check_database

API_PREFIX = "/api"

app = FastAPI(
    title="AI CRM HCP API",
    version="1.0.0",
    description="AI First CRM for Healthcare Professionals",
    # Only /api/* reaches this service on Vercel, so docs must live under it too.
    docs_url=f"{API_PREFIX}/docs",
    redoc_url=None,
    openapi_url=f"{API_PREFIX}/openapi.json",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=config.ALLOWED_ORIGINS,
    # Browsers reject credentialed requests against a wildcard origin.
    allow_credentials="*" not in config.ALLOWED_ORIGINS,
    allow_methods=["*"],
    allow_headers=["*"],
)

api = APIRouter(prefix=API_PREFIX)


@api.get("/health", tags=["Health"])
def health():
    db = check_database()
    llm = check_llm()
    healthy = db == "ok" and llm.startswith("ok")
    return JSONResponse(
        status_code=200 if healthy else 503,
        content={"status": "ok" if healthy else "degraded", "db": db, "llm": llm},
    )


api.include_router(auth_router)
api.include_router(chat_router)
api.include_router(interaction_router)
api.include_router(dashboard_router)
api.include_router(hcps_router)
api.include_router(interactions_router)
api.include_router(follow_ups_router)

app.include_router(api)
