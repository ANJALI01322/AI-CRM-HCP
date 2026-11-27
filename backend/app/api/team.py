from datetime import datetime

from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.api.deps import Clock, RequestContext, client_clock, db_session, require_manager
from app.models import HCP, FollowUp, Interaction, User
from app.schemas.common import CamelModel

router = APIRouter(prefix="/team", tags=["Team"])


class RepActivity(CamelModel):
    user_id: int
    full_name: str
    role: str
    assigned_hcps: int
    interactions_last_30_days: int
    interactions_total: int
    last_activity: datetime | None
    open_follow_ups: int
    overdue_follow_ups: int


@router.get("/activity", response_model=list[RepActivity])
def team_activity(
    ctx: RequestContext = Depends(require_manager),
    db: Session = Depends(db_session),
    clock: Clock = Depends(client_clock),
):
    """Per-user activity across the manager's organization (managers only)."""
    users = db.scalars(
        select(User).where(User.org_id == ctx.org_id, User.is_active.is_(True)).order_by(User.full_name)
    ).all()

    def per_user(model, *where):
        rows = db.execute(
            select(model.user_id if model is not HCP else HCP.assigned_user_id, func.count())
            .where(model.org_id == ctx.org_id, *where)
            .group_by(model.user_id if model is not HCP else HCP.assigned_user_id)
        )
        return dict(rows.all())

    hcps = per_user(HCP)
    total = per_user(Interaction)
    last30 = per_user(Interaction, Interaction.occurred_at >= clock.days_ago(30))
    open_fu = per_user(FollowUp, FollowUp.status == "open")
    overdue = per_user(FollowUp, FollowUp.status == "open", FollowUp.due_date < clock.today)
    last_activity = dict(
        db.execute(
            select(Interaction.user_id, func.max(Interaction.occurred_at))
            .where(Interaction.org_id == ctx.org_id)
            .group_by(Interaction.user_id)
        ).all()
    )
    return [
        RepActivity(
            user_id=u.id,
            full_name=u.full_name,
            role=u.role,
            assigned_hcps=hcps.get(u.id, 0),
            interactions_last_30_days=last30.get(u.id, 0),
            interactions_total=total.get(u.id, 0),
            last_activity=last_activity.get(u.id),
            open_follow_ups=open_fu.get(u.id, 0),
            overdue_follow_ups=overdue.get(u.id, 0),
        )
        for u in users
    ]
