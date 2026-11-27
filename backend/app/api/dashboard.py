from datetime import date

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import Clock, RequestContext, client_clock, db_session, get_context
from app.schemas.common import CamelModel
from app.services.dashboard import dashboard_stats

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


class HealthDistribution(CamelModel):
    strong: int
    healthy: int
    watch: int
    at_risk: int
    average_score: int | None


class FollowUpCounts(CamelModel):
    open: int
    due_today: int
    due_this_week: int
    overdue: int
    due_now: int


class Coverage(CamelModel):
    touched: int
    total: int
    pct: int


class ChannelShare(CamelModel):
    channel: str
    count: int
    pct: int


class NextBestAction(CamelModel):
    hcp_id: int
    name: str
    specialty: str
    hospital: str
    products_of_interest: list[str]
    score: int
    type: str
    reason: str
    action: str


class DueFollowUp(CamelModel):
    id: int
    hcp_id: int
    hcp: str
    hospital: str
    specialty: str
    due_date: date
    days_overdue: int
    action: str


class DashboardStats(CamelModel):
    today: date
    hcp_count: int
    kol_count: int
    high_priority_count: int
    health: HealthDistribution
    follow_ups: FollowUpCounts
    today_visits: int
    interactions_total: int
    interactions_last_30_days: int
    coverage_last_30_days: Coverage
    channel_split: list[ChannelShare]
    next_best_actions: list[NextBestAction]
    due_follow_ups: list[DueFollowUp]


@router.get("/stats", response_model=DashboardStats)
def get_stats(
    ctx: RequestContext = Depends(get_context),
    db: Session = Depends(db_session),
    clock: Clock = Depends(client_clock),
):
    """Computed from the caller's scoped data; dates are relative to the caller's local today."""
    return dashboard_stats(db, ctx, clock)
