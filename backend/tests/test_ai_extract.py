from datetime import date, timedelta

import pytest

from app.langgraph import workflow
from app.langgraph.workflow import ExtractedInteraction
from tests.conftest import auth_headers


class FakeLLM:
    """Stands in for ChatGroq: returns queued results from with_structured_output().invoke()."""

    def __init__(self, results):
        self.results = list(results)
        self.calls = 0

    def with_structured_output(self, schema):
        return self

    def invoke(self, messages):
        self.calls += 1
        result = self.results.pop(0)
        if isinstance(result, Exception):
            raise result
        return result


def draft(**overrides):
    base = dict(
        hcp_name="Dr. Asha Rao", hospital="City Hospital", products=["CardioPlus 50mg"],
        sentiment="positive", objections=[], follow_up_date=None, summary="Discussed CardioPlus.",
    )
    return ExtractedInteraction(**{**base, **overrides})


@pytest.fixture()
def fake_llm(monkeypatch):
    def install(*results):
        llm = FakeLLM(results)
        monkeypatch.setattr(workflow, "get_llm", lambda: llm)
        return llm
    return install


def test_extract_returns_draft_and_confident_match(client, data, fake_llm):
    llm = fake_llm(draft(hcp_name="Asha Rao"))
    res = client.post("/api/interaction/ai/extract", json={"notes": "Met Asha Rao"}, headers=auth_headers(client, "rep@a.test"))
    assert res.status_code == 200, res.text
    body = res.json()
    assert body["draft"]["sentiment"] == "positive"
    assert body["match"] == {**body["match"], "hcpId": data["hcp_a"].id, "confident": True}
    assert body["attempts"] == 1 and llm.calls == 1
    assert body["model"] and body["latencyMs"] >= 0


def test_extract_retries_once_when_validation_fails(client, data, fake_llm):
    past = date.today() - timedelta(days=30)
    llm = fake_llm(draft(follow_up_date=past), draft(summary="Fixed summary."))
    res = client.post("/api/interaction/ai/extract", json={"notes": "notes"}, headers=auth_headers(client, "rep@a.test"))
    assert res.status_code == 200, res.text
    assert res.json()["attempts"] == 2 and llm.calls == 2
    assert res.json()["draft"]["summary"] == "Fixed summary."


def test_extract_gives_up_after_one_retry(client, data, fake_llm):
    llm = fake_llm(draft(summary="  "), None)
    res = client.post("/api/interaction/ai/extract", json={"notes": "notes"}, headers=auth_headers(client, "rep@a.test"))
    assert res.status_code == 422
    assert llm.calls == 2


def test_extract_rejects_empty_notes_and_requires_auth(client, data, fake_llm):
    fake_llm()
    assert client.post("/api/interaction/ai/extract", json={"notes": "x"}).status_code == 401
    res = client.post("/api/interaction/ai/extract", json={"notes": ""}, headers=auth_headers(client, "rep@a.test"))
    assert res.status_code == 422


def test_match_only_considers_hcps_in_callers_scope(client, data, fake_llm):
    fake_llm(draft(hcp_name="Dr. Unassigned"))
    res = client.post("/api/interaction/ai/extract", json={"notes": "n"}, headers=auth_headers(client, "rep@a.test"))
    assert res.status_code == 200
    assert res.json()["match"]["hcpId"] is None
    assert all(c["id"] != data["hcp_a_unassigned"].id for c in res.json()["match"]["candidates"])
