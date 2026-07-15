from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.interaction import router as interaction_router
from app.api.dashboard import router as dashboard_router


app = FastAPI(
    title="AI CRM HCP API",
    version="1.0.0",
    description="AI First CRM for Healthcare Professionals"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(interaction_router)

app.include_router(dashboard_router)

@app.get("/")
def health():
    return {
        "status": "running",
        "message": "AI CRM Backend Running"
    }
