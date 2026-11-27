from datetime import datetime, timezone

from fastapi import APIRouter, Depends, Query, Response
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.crud import count, get_owned, update_fields
from app.api.deps import Pagination, RequestContext, db_session, get_context, pagination
from app.models import HCP, FollowUp, Interaction
from app.schemas.common import Page
from app.schemas.follow_up import FollowUpCreate, FollowUpOut, FollowUpStatus, FollowUpUpdate

router = APIRouter(prefix="/follow-ups", tags=["Follow-ups"])

REQUIRED = {"due_date", "action", "status"}


def _sync_completed_at(follow_up: FollowUp) -> None:
    if follow_up.status == "done" and follow_up.completed_at is None:
        follow_up.completed_at = datetime.now(timezone.utc)
    elif follow_up.status != "done":
        follow_up.completed_at = None


@router.get("", response_model=Page[FollowUpOut])
def list_follow_ups(
    hcp_id: int | None = Query(None, gt=0),
    status: FollowUpStatus | None = None,
    page: Pagination = Depends(pagination),
    ctx: RequestContext = Depends(get_context),
    db: Session = Depends(db_session),
):
    query = select(FollowUp).where(FollowUp.org_id == ctx.org_id)
    if hcp_id is not None:
        query = query.where(FollowUp.hcp_id == hcp_id)
    if status is not None:
        query = query.where(FollowUp.status == status)
    query = query.order_by(FollowUp.due_date, FollowUp.id)
    items = db.scalars(query.limit(page.limit).offset(page.offset)).all()
    return Page(items=items, total=count(db, query), limit=page.limit, offset=page.offset)


@router.get("/{follow_up_id}", response_model=FollowUpOut)
def get_follow_up(follow_up_id: int, ctx: RequestContext = Depends(get_context), db: Session = Depends(db_session)):
    return get_owned(db, FollowUp, follow_up_id, ctx.org_id, "Follow-up")


@router.post("", response_model=FollowUpOut, status_code=201)
def create_follow_up(
    payload: FollowUpCreate, ctx: RequestContext = Depends(get_context), db: Session = Depends(db_session)
):
    get_owned(db, HCP, payload.hcp_id, ctx.org_id, "HCP")
    if payload.interaction_id is not None:
        get_owned(db, Interaction, payload.interaction_id, ctx.org_id, "Interaction")
    follow_up = FollowUp(**payload.model_dump(by_alias=False), org_id=ctx.org_id, user_id=ctx.user_id)
    _sync_completed_at(follow_up)
    db.add(follow_up)
    db.commit()
    db.refresh(follow_up)
    return follow_up


@router.patch("/{follow_up_id}", response_model=FollowUpOut)
def update_follow_up(
    follow_up_id: int,
    payload: FollowUpUpdate,
    ctx: RequestContext = Depends(get_context),
    db: Session = Depends(db_session),
):
    follow_up = get_owned(db, FollowUp, follow_up_id, ctx.org_id, "Follow-up")
    update_fields(follow_up, payload, REQUIRED)
    _sync_completed_at(follow_up)
    db.commit()
    db.refresh(follow_up)
    return follow_up


@router.delete("/{follow_up_id}", status_code=204)
def delete_follow_up(follow_up_id: int, ctx: RequestContext = Depends(get_context), db: Session = Depends(db_session)):
    db.delete(get_owned(db, FollowUp, follow_up_id, ctx.org_id, "Follow-up"))
    db.commit()
    return Response(status_code=204)
