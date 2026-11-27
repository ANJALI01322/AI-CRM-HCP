from typing import TypeVar

from fastapi import HTTPException
from pydantic import BaseModel
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.api.deps import RequestContext
from app.models import HCP, User

M = TypeVar("M")


def scope(model, ctx: RequestContext) -> list:
    """WHERE clauses limiting `model` to what the caller may see.

    Managers see the whole org. Reps see their assigned HCPs and their own
    interactions / follow-ups.
    """
    clauses = [model.org_id == ctx.org_id]
    if not ctx.is_manager:
        owner = model.assigned_user_id if model is HCP else model.user_id
        clauses.append(owner == ctx.user_id)
    return clauses


def get_owned(db: Session, model: type[M], obj_id: int, ctx: RequestContext, label: str) -> M:
    """Fetch a row by id within the caller's scope; 404 if missing or out of scope."""
    obj = db.scalar(select(model).where(model.id == obj_id, *scope(model, ctx)))
    if obj is None:
        raise HTTPException(status_code=404, detail=f"{label} not found")
    return obj


def check_org_user(db: Session, user_id: int, org_id: int) -> None:
    if db.scalar(select(User.id).where(User.id == user_id, User.org_id == org_id)) is None:
        raise HTTPException(status_code=404, detail="User not found")


def count(db: Session, query) -> int:
    return db.scalar(select(func.count()).select_from(query.order_by(None).subquery()))


def update_fields(obj, payload: BaseModel, required: set[str]) -> None:
    """Apply a partial update; explicit null is rejected for NOT NULL columns."""
    data = payload.model_dump(by_alias=False, exclude_unset=True)
    nulled = sorted(k for k in required if k in data and data[k] is None)
    if nulled:
        raise HTTPException(status_code=422, detail=f"Fields cannot be null: {', '.join(nulled)}")
    for key, value in data.items():
        setattr(obj, key, value)
