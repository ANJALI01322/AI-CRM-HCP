"""Tests run against in-memory SQLite and never touch the real database or Groq."""

import os

# Must be set before the app (and its load_dotenv) is imported; existing keys are not overridden.
os.environ["DATABASE_URL"] = "sqlite://"
os.environ["GROQ_API_KEY"] = ""
os.environ["JWT_SECRET"] = "test-secret-not-for-production-0123456789"

from datetime import date  # noqa: E402

import pytest  # noqa: E402
from fastapi.testclient import TestClient  # noqa: E402
from sqlalchemy import create_engine  # noqa: E402
from sqlalchemy.orm import Session, sessionmaker  # noqa: E402
from sqlalchemy.pool import StaticPool  # noqa: E402

import app.models  # noqa: E402,F401  (registers tables)
from app.api.deps import db_session  # noqa: E402
from app.core.security import hash_password  # noqa: E402
from app.database.database import Base  # noqa: E402
from app.main import app  # noqa: E402
from app.models import HCP, Organization, User  # noqa: E402

PASSWORD = "Demo@123"


@pytest.fixture()
def engine():
    engine = create_engine(
        "sqlite://", connect_args={"check_same_thread": False}, poolclass=StaticPool
    )
    Base.metadata.create_all(engine)
    yield engine
    engine.dispose()


@pytest.fixture()
def db(engine):
    with Session(engine) as session:
        yield session


@pytest.fixture()
def client(engine):
    factory = sessionmaker(bind=engine, autoflush=False)

    def override():
        session = factory()
        try:
            yield session
        finally:
            session.close()

    app.dependency_overrides[db_session] = override
    from app.api.auth import login_limiter

    login_limiter.reset()
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()


@pytest.fixture()
def data(db):
    """Org A (rep + manager, one assigned and one unassigned HCP) and org B (one user, one HCP)."""
    pw = hash_password(PASSWORD)
    org_a, org_b = Organization(name="Org A", slug="a"), Organization(name="Org B", slug="b")
    db.add_all([org_a, org_b])
    db.flush()
    rep = User(org_id=org_a.id, full_name="Rep A", email="rep@a.test", role="rep", password_hash=pw)
    manager = User(org_id=org_a.id, full_name="Mgr A", email="manager@a.test", role="manager", password_hash=pw)
    other = User(org_id=org_b.id, full_name="Rep B", email="rep@b.test", role="rep", password_hash=pw)
    db.add_all([rep, manager, other])
    db.flush()

    def hcp(org, name, assigned):
        return HCP(
            org_id=org.id, name=name, specialty="Cardiology", hospital="City Hospital", city="Pune",
            products_of_interest=[], assigned_user_id=assigned, last_visit=date.today(),
        )

    hcp_a = hcp(org_a, "Dr. Asha Rao", rep.id)
    hcp_a_unassigned = hcp(org_a, "Dr. Unassigned", None)
    hcp_b = hcp(org_b, "Dr. Other Org", other.id)
    db.add_all([hcp_a, hcp_a_unassigned, hcp_b])
    db.commit()
    return {
        "rep": rep, "manager": manager, "other": other,
        "hcp_a": hcp_a, "hcp_a_unassigned": hcp_a_unassigned, "hcp_b": hcp_b,
    }


def login(client, email, password=PASSWORD):
    return client.post("/api/auth/login", json={"email": email, "password": password})


def auth_headers(client, email):
    res = login(client, email)
    assert res.status_code == 200, res.text
    return {"Authorization": f"Bearer {res.json()['accessToken']}"}
