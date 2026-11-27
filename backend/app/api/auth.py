from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session

from app.api.deps import RequestContext, db_session, get_context
from app.core.rate_limit import RateLimiter, client_ip
from app.core.security import AuthNotConfigured
from app.models import User
from app.schemas.auth import LoginRequest, TokenOut, UserOut
from app.services.auth_service import authenticate, issue_token, user_out

router = APIRouter(prefix="/auth", tags=["Auth"])

login_limiter = RateLimiter(limit=5, window_seconds=60)


@router.post("/login", response_model=TokenOut)
def login(payload: LoginRequest, request: Request, db: Session = Depends(db_session)):
    login_limiter.check(client_ip(request))
    user = authenticate(db, payload.email, payload.password)
    if user is None:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    try:
        return issue_token(db, user)
    except AuthNotConfigured as exc:
        raise HTTPException(status_code=503, detail=f"Authentication unavailable: {exc}")


@router.get("/me", response_model=UserOut)
def me(ctx: RequestContext = Depends(get_context), db: Session = Depends(db_session)):
    return user_out(db, db.get(User, ctx.user_id))
