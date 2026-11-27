from functools import lru_cache

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.core.security import create_access_token, hash_password, verify_password
from app.models import Organization, User
from app.schemas.auth import TokenOut, UserOut


@lru_cache(maxsize=1)
def _dummy_hash() -> str:
    """Checked when the email is unknown, so response time doesn't reveal which emails exist."""
    return hash_password("not-a-real-password")


def authenticate(db: Session, email: str, password: str) -> User | None:
    user = db.scalar(select(User).where(func.lower(User.email) == email.strip().lower()))
    if user is None:
        verify_password(password, _dummy_hash())
        return None
    if not user.is_active or not verify_password(password, user.password_hash):
        return None
    return user


def user_out(db: Session, user: User) -> UserOut:
    org = db.get(Organization, user.org_id)
    return UserOut(
        id=user.id,
        full_name=user.full_name,
        email=user.email,
        role=user.role,
        org_id=user.org_id,
        org_name=org.name if org else "",
    )


def issue_token(db: Session, user: User) -> TokenOut:
    token, expires_in = create_access_token(user.id, user.org_id, user.role)
    return TokenOut(access_token=token, expires_in=expires_in, user=user_out(db, user))
