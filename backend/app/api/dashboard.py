from fastapi import APIRouter, Depends

from app.api.deps import get_context

router = APIRouter(prefix="/dashboard", tags=["Dashboard"], dependencies=[Depends(get_context)])

@router.get("/stats")
def get_stats():
    return {
        "total_hcps": 248,
        "today_visits": 12,
        "interactions": 845,
        "followups": 31,
    }