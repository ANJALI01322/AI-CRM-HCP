from dataclasses import dataclass
from datetime import date, datetime, time, timedelta, timezone

from fastapi import Depends, Header, HTTPException, Query
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from app.core.security import AuthNotConfigured, InvalidToken, decode_access_token
from app.database.database import DatabaseNotConfigured, get_db
from app.models import User
from app.schemas.common import MAX_PAGE_SIZE

bearer = HTTPBearer(auto_error=False)


def db_session():
    try:
        yield from get_db()
    except DatabaseNotConfigured as exc:
        raise HTTPException(status_code=503, detail=f"Database unavailable: {exc}")


@dataclass(frozen=True)
class RequestContext:
    org_id: int
    user_id: int
    role: str

    @property
    def is_manager(self) -> bool:
        return self.role == "manager"


def _unauthorized(message: str) -> HTTPException:
    return HTTPException(status_code=401, detail=message, headers={"WWW-Authenticate": "Bearer"})


def get_context(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer),
    db: Session = Depends(db_session),
) -> RequestContext:
    """Org/user/role of the authenticated caller, read fresh from the DB on every request."""
    if credentials is None or credentials.scheme.lower() != "bearer":
        raise _unauthorized("Not authenticated")
    try:
        payload = decode_access_token(credentials.credentials)
    except AuthNotConfigured as exc:
        raise HTTPException(status_code=503, detail=f"Authentication unavailable: {exc}")
    except InvalidToken:
        raise _unauthorized("Invalid or expired token")

    user = db.get(User, int(payload["sub"]))
    if user is None or not user.is_active or user.org_id != payload["org"]:
        raise _unauthorized("Invalid or expired token")
    return RequestContext(org_id=user.org_id, user_id=user.id, role=user.role)


def require_manager(ctx: RequestContext = Depends(get_context)) -> RequestContext:
    if not ctx.is_manager:
        raise HTTPException(status_code=403, detail="Manager role required")
    return ctx


@dataclass(frozen=True)
class Clock:
    """The caller's local 'today' and timezone, so day boundaries match what the user sees."""

    today: date
    tz: timezone

    def start_of(self, d: date) -> datetime:
        return datetime.combine(d, time.min, tzinfo=self.tz)

    def days_ago(self, days: int) -> datetime:
        return self.start_of(self.today - timedelta(days=days))


def client_clock(
    x_tz_offset: int | None = Header(None, ge=-840, le=840, description="Client UTC offset in minutes (IST = 330)"),
) -> Clock:
    tz = timezone(timedelta(minutes=x_tz_offset or 0))
    return Clock(today=datetime.now(tz).date(), tz=tz)


def local_today(clock: Clock = Depends(client_clock)) -> date:
    return clock.today


@dataclass(frozen=True)
class Pagination:
    limit: int
    offset: int


def pagination(
    limit: int = Query(50, ge=1, le=MAX_PAGE_SIZE),
    offset: int = Query(0, ge=0),
) -> Pagination:
    return Pagination(limit=limit, offset=offset)
