from datetime import date, datetime, timedelta, timezone

from app.models import FollowUp, Interaction
from app.services.dashboard import relationship_health
from tests.conftest import auth_headers


def test_relationship_health_formula():
    assert relationship_health(None, None) == ("At Risk", 0)
    assert relationship_health(0, "positive") == ("Strong", 100)
    assert relationship_health(30, None) == ("Healthy", 70)
    assert relationship_health(60, None) == ("Watch", 40)
    assert relationship_health(10, "negative") == ("Healthy", 65)
    assert relationship_health(200, "negative") == ("At Risk", 0)


def test_dashboard_empty_org_has_zero_counts_not_fake_numbers(client, data, db):
    headers = auth_headers(client, "rep@a.test")
    body = client.get("/api/dashboard/stats", headers=headers).json()
    assert body["hcpCount"] == 1
    assert body["interactionsTotal"] == 0
    assert body["followUps"] == {"open": 0, "dueToday": 0, "dueThisWeek": 0, "overdue": 0, "dueNow": 0}
    assert body["channelSplit"] == []


def test_dashboard_counts_follow_ups_and_scope(client, data, db):
    rep, manager, hcp = data["rep"], data["manager"], data["hcp_a"]
    today = date.today()
    now = datetime.now(timezone.utc)
    db.add_all(
        [
            Interaction(org_id=rep.org_id, hcp_id=hcp.id, user_id=rep.id, channel="Phone", notes="n",
                        sentiment="Negative", objections="price", occurred_at=now),
            Interaction(org_id=rep.org_id, hcp_id=data["hcp_a_unassigned"].id, user_id=manager.id, channel="Clinic",
                        notes="m", occurred_at=now),
            FollowUp(org_id=rep.org_id, hcp_id=hcp.id, user_id=rep.id, due_date=today - timedelta(days=3), action="Send paper"),
            FollowUp(org_id=rep.org_id, hcp_id=hcp.id, user_id=rep.id, due_date=today, action="Call"),
            FollowUp(org_id=rep.org_id, hcp_id=hcp.id, user_id=rep.id, due_date=today + timedelta(days=2), action="Visit"),
            FollowUp(org_id=rep.org_id, hcp_id=hcp.id, user_id=rep.id, due_date=today - timedelta(days=9), action="Old", status="done"),
        ]
    )
    db.commit()

    rep_body = client.get("/api/dashboard/stats", headers=auth_headers(client, "rep@a.test")).json()
    assert rep_body["interactionsTotal"] == 1  # manager's interaction is out of the rep's scope
    assert rep_body["followUps"]["open"] == 3
    assert rep_body["followUps"]["overdue"] == 1
    assert rep_body["followUps"]["dueToday"] == 1
    assert rep_body["followUps"]["dueNow"] == 2
    assert rep_body["channelSplit"] == [{"channel": "Phone", "count": 1, "pct": 100}]
    top = rep_body["nextBestActions"][0]
    assert top["hcpId"] == hcp.id
    assert "overdue follow-up" in top["reason"] and "negative" in top["reason"]
    assert "Send paper" in top["action"]

    mgr_body = client.get("/api/dashboard/stats", headers=auth_headers(client, "manager@a.test")).json()
    assert mgr_body["hcpCount"] == 2
    assert mgr_body["interactionsTotal"] == 2


def test_hcp_list_includes_computed_health(client, data):
    items = client.get("/api/hcps", headers=auth_headers(client, "rep@a.test")).json()["items"]
    assert items[0]["healthLabel"] == "Strong"  # last_visit=today, no sentiment -> 100
    assert items[0]["daysSinceLastVisit"] == 0
