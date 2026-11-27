from dataclasses import dataclass

from fastapi import Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core import config
from app.database.database import DatabaseNotConfigured, get_db
from app.models import Organization, User
from app.schemas.common import MAX_PAGE_SIZE


def db_session():
    try:
        yield from get_db()
    except DatabaseNotConfigured as exc:
        raise HTTPException(status_code=503, detail=f"Database unavailable: {exc}")


@dataclass(frozen=True)
class RequestContext:
    org_id: int
    user_id: int


def get_context(db: Session = Depends(db_session)) -> RequestContext:
    """Org/user for the request. Replace with the authenticated user once auth exists."""
    org = db.scalar(select(Organization).where(Organization.slug == config.DEMO_ORG_SLUG))
    if org is None:
        raise HTTPException(
            status_code=503,
            detail=f"Organization '{config.DEMO_ORG_SLUG}' not found. Run: python seed.py",
        )
    query = select(User).where(User.org_id == org.id, User.is_active.is_(True))
    if config.DEMO_USER_EMAIL:
        query = query.where(User.email == config.DEMO_USER_EMAIL)
    else:
        query = query.where(User.role == "rep").order_by(User.id)
    user = db.scalars(query.limit(1)).first()
    if user is None:
        raise HTTPException(status_code=503, detail="No active user found for the organization")
    return RequestContext(org_id=org.id, user_id=user.id)


@dataclass(frozen=True)
class Pagination:
    limit: int
    offset: int


def pagination(
    limit: int = Query(50, ge=1, le=MAX_PAGE_SIZE),
    offset: int = Query(0, ge=0),
) -> Pagination:
    return Pagination(limit=limit, offset=offset)
