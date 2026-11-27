"""Password hashing (bcrypt) and access tokens (JWT, HS256)."""

from datetime import datetime, timedelta, timezone

import bcrypt
import jwt

from app.core import config

ALGORITHM = "HS256"


class AuthNotConfigured(RuntimeError):
    pass


class InvalidToken(Exception):
    pass


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("ascii")


def verify_password(password: str, password_hash: str | None) -> bool:
    if not password_hash:
        return False
    try:
        return bcrypt.checkpw(password.encode("utf-8"), password_hash.encode("ascii"))
    except ValueError:  # malformed hash
        return False


def _secret() -> str:
    if not config.JWT_SECRET:
        raise AuthNotConfigured("JWT_SECRET is not set")
    return config.JWT_SECRET


def create_access_token(user_id: int, org_id: int, role: str) -> tuple[str, int]:
    """Return (token, expires_in_seconds)."""
    expires_in = config.JWT_EXPIRE_HOURS * 3600
    now = datetime.now(timezone.utc)
    payload = {
        "sub": str(user_id),
        "org": org_id,
        "role": role,
        "iat": now,
        "exp": now + timedelta(seconds=expires_in),
    }
    return jwt.encode(payload, _secret(), algorithm=ALGORITHM), expires_in


def decode_access_token(token: str) -> dict:
    try:
        payload = jwt.decode(
            token, _secret(), algorithms=[ALGORITHM], options={"require": ["sub", "org", "exp"]}
        )
        int(payload["sub"])
        return payload
    except (jwt.PyJWTError, ValueError, TypeError) as exc:
        raise InvalidToken(str(exc)) from exc
