from typing import TypeVar

from fastapi import HTTPException
from pydantic import BaseModel
from sqlalchemy import func, select
from sqlalchemy.orm import Session

M = TypeVar("M")


def get_owned(db: Session, model: type[M], obj_id: int, org_id: int, label: str) -> M:
    """Fetch a row by id within the org; 404 if missing or owned by another org."""
    obj = db.scalar(select(model).where(model.id == obj_id, model.org_id == org_id))
    if obj is None:
        raise HTTPException(status_code=404, detail=f"{label} not found")
    return obj


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
