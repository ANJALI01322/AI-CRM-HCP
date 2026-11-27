from functools import lru_cache

from sqlalchemy import create_engine, text
from sqlalchemy.engine import Engine
from sqlalchemy.orm import declarative_base, sessionmaker

from app.core import config

Base = declarative_base()


class DatabaseNotConfigured(RuntimeError):
    pass


def normalize_url(url: str) -> str:
    # Neon / Heroku style "postgres://" URLs are rejected by SQLAlchemy 2.x.
    if url.startswith("postgres://"):
        return "postgresql://" + url[len("postgres://"):]
    return url


@lru_cache(maxsize=1)
def get_engine() -> Engine:
    """Create the engine on first use so a missing DATABASE_URL never breaks app import."""
    if not config.DATABASE_URL:
        raise DatabaseNotConfigured("DATABASE_URL is not set")
    return create_engine(
        normalize_url(config.DATABASE_URL), pool_pre_ping=True, pool_recycle=300, pool_size=5, max_overflow=5
    )


@lru_cache(maxsize=1)
def _session_factory() -> sessionmaker:
    return sessionmaker(autocommit=False, autoflush=False, bind=get_engine())


def get_db():
    db = _session_factory()()
    try:
        yield db
    finally:
        db.close()


def check_database() -> str:
    """Return "ok" or a short error description. Never raises."""
    try:
        with get_engine().connect() as conn:
            conn.execute(text("SELECT 1"))
        return "ok"
    except DatabaseNotConfigured as exc:
        return f"error: {exc}"
    except Exception as exc:  # report, don't crash the health check
        return f"error: {type(exc).__name__}: {str(exc).splitlines()[0][:200]}"
