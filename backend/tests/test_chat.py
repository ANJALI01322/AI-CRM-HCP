import json
from datetime import timezone

from app.agents.chat_agent import build_tools
from app.api.deps import Clock, RequestContext
from datetime import date


def tools_for(user, db):
    ctx = RequestContext(org_id=user.org_id, user_id=user.id, role=user.role)
    return {t.name: t for t in build_tools(db, ctx, Clock(today=date.today(), tz=timezone.utc))}


def test_chat_requires_auth(client, data):
    assert client.post("/api/chat", json={"message": "hi"}).status_code == 401


def test_chat_tools_are_scoped_to_caller(db, data):
    rep_tools = tools_for(data["rep"], db)
    assert json.loads(rep_tools["get_hcp_profile"].invoke({"name": "Dr. Unassigned"}))["found"] is False
    assert json.loads(rep_tools["get_hcp_profile"].invoke({"name": "Dr. Other Org"}))["found"] is False
    assert json.loads(rep_tools["get_hcp_profile"].invoke({"name": "Asha Rao"}))["found"] is True
    assert json.loads(rep_tools["territory_summary"].invoke({}))["hcp_count"] == 1

    mgr_tools = tools_for(data["manager"], db)
    assert json.loads(mgr_tools["territory_summary"].invoke({}))["hcp_count"] == 2
