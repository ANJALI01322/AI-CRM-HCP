from tests.conftest import auth_headers, login


def test_login_success_returns_token_and_user(client, data):
    res = login(client, "rep@a.test")
    assert res.status_code == 200
    body = res.json()
    assert body["tokenType"] == "bearer"
    assert body["expiresIn"] == 24 * 3600
    assert body["user"]["email"] == "rep@a.test"
    assert body["user"]["role"] == "rep"
    assert body["user"]["orgName"] == "Org A"


def test_login_wrong_password_and_unknown_email_are_401(client, data):
    assert login(client, "rep@a.test", "wrong").status_code == 401
    assert login(client, "nobody@a.test").status_code == 401


def test_me_requires_valid_token(client, data):
    assert client.get("/api/auth/me").status_code == 401
    assert client.get("/api/auth/me", headers={"Authorization": "Bearer junk"}).status_code == 401
    res = client.get("/api/auth/me", headers=auth_headers(client, "manager@a.test"))
    assert res.status_code == 200
    assert res.json()["role"] == "manager"


def test_login_rate_limited_after_five_attempts_per_minute(client, data):
    for _ in range(5):
        assert login(client, "rep@a.test", "wrong").status_code == 401
    res = login(client, "rep@a.test")
    assert res.status_code == 429
    assert "Retry-After" in res.headers
