from fastapi import APIRouter

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

@router.get("/stats")
def get_stats():
    return {
        "total_hcps": 248,
        "today_visits": 12,
        "interactions": 845,
        "followups": 31,
    }