import pytest

from app.core import config
from tests.conftest import auth_headers, login


def test_errors_share_one_shape_and_carry_request_id(client, data):
    missing = client.get("/api/nope")
    assert missing.status_code == 404
    body = missing.json()
    assert set(body) >= {"error", "message", "requestId"} and body["error"] == "not_found"
    assert body["requestId"] == missing.headers["X-Request-ID"]

    unauth = client.get("/api/hcps")
    assert unauth.status_code == 401 and unauth.json()["error"] == "unauthorized"

    invalid = client.post("/api/auth/login", json={"email": "not-an-email", "password": "x"})
    assert invalid.status_code == 422
    assert invalid.json()["error"] == "validation_error"
    assert invalid.json()["details"][0]["field"].endswith("email")


def test_unhandled_errors_do_not_leak_internals(client, data, monkeypatch):
    def boom(*args, **kwargs):
        raise RuntimeError("secret-db-password-in-message")

    monkeypatch.setattr("app.api.hcps.hcp_insights", boom)
    res = client.get("/api/hcps", headers=auth_headers(client, "rep@a.test"))
    assert res.status_code == 500
    assert res.json()["error"] == "internal_error"
    assert "secret-db-password" not in res.text and "Traceback" not in res.text
    assert res.headers["X-Request-ID"]


def test_request_id_is_echoed_when_valid_and_replaced_when_not(client):
    ok = client.get("/api/nope", headers={"X-Request-ID": "trace-12345678"})
    assert ok.headers["X-Request-ID"] == "trace-12345678"
    bad = client.get("/api/nope", headers={"X-Request-ID": "x\ny"})
    assert bad.headers["X-Request-ID"] != "x\ny" and len(bad.headers["X-Request-ID"]) == 32


def test_security_headers_on_api_and_relaxed_csp_for_docs(client):
    res = client.get("/api/nope")
    assert res.headers["X-Content-Type-Options"] == "nosniff"
    assert res.headers["X-Frame-Options"] == "DENY"
    assert res.headers["Referrer-Policy"] == "no-referrer"
    assert "default-src 'none'" in res.headers["Content-Security-Policy"]
    assert res.headers["Cache-Control"] == "no-store"
    docs = client.get("/api/docs")
    assert docs.status_code == 200 and "Content-Security-Policy" not in docs.headers


def test_cors_only_allows_configured_origins(client):
    allowed = config.ALLOWED_ORIGINS[0]
    ok = client.options(
        "/api/hcps", headers={"Origin": allowed, "Access-Control-Request-Method": "GET"}
    )
    assert ok.headers.get("access-control-allow-origin") == allowed
    other = client.options(
        "/api/hcps", headers={"Origin": "https://evil.example", "Access-Control-Request-Method": "GET"}
    )
    assert "access-control-allow-origin" not in other.headers


def test_pagination_is_capped_at_100(client, data):
    headers = auth_headers(client, "manager@a.test")
    assert client.get("/api/hcps?limit=100", headers=headers).status_code == 200
    assert client.get("/api/hcps?limit=101", headers=headers).status_code == 422
    assert client.get("/api/interactions?limit=1000", headers=headers).status_code == 422
    assert client.get("/api/follow-ups?limit=0", headers=headers).status_code == 422


def test_input_validation_on_hcp_and_interaction_payloads(client, data):
    h = auth_headers(client, "manager@a.test")
    base = {"name": "Dr. New", "specialty": "Cardiology", "hospital": "H", "city": "Pune"}

    assert client.post("/api/hcps", json={**base, "email": "nope"}, headers=h).status_code == 422
    assert client.post("/api/hcps", json={**base, "priority": "Urgent"}, headers=h).status_code == 422
    assert client.post("/api/hcps", json={**base, "name": " "}, headers=h).status_code == 422

    created = client.post("/api/hcps", json={**base, "email": "", "phone": ""}, headers=h)
    assert created.status_code == 201 and created.json()["email"] is None

    hcp_id = data["hcp_a"].id
    bad_sentiment = {"hcpId": hcp_id, "channel": "Call", "notes": "n", "sentiment": "Angry"}
    assert client.post("/api/interactions", json=bad_sentiment, headers=h).status_code == 422
    too_long = {"hcpId": hcp_id, "channel": "Call", "notes": "x" * 20001}
    assert client.post("/api/interactions", json=too_long, headers=h).status_code == 422


def test_weak_or_missing_jwt_secret_disables_login_instead_of_signing(client, data, monkeypatch):
    monkeypatch.setattr(config, "JWT_SECRET", "short")
    res = login(client, "rep@a.test")
    assert res.status_code == 503 and "JWT_SECRET" in res.json()["message"]
    monkeypatch.setattr(config, "JWT_SECRET", None)
    assert login(client, "rep@a.test").status_code == 503


@pytest.mark.parametrize("path", ["/api/dashboard/stats", "/api/products", "/api/team/activity", "/api/export/hcps.csv"])
def test_data_routes_require_authentication(client, path):
    assert client.get(path).status_code == 401
