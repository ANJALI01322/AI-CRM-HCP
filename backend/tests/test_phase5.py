from datetime import date, datetime, timedelta, timezone

from app.models import FollowUp, Interaction
from tests.conftest import auth_headers


def seed_activity(db, data):
    rep, manager, hcp = data["rep"], data["manager"], data["hcp_a"]
    now = datetime.now(timezone.utc)
    db.add_all(
        [
            Interaction(org_id=rep.org_id, hcp_id=hcp.id, user_id=rep.id, channel="Phone", notes="rep note",
                        summary="=HYPERLINK(\"http://evil\")", occurred_at=now),
            Interaction(org_id=rep.org_id, hcp_id=data["hcp_a_unassigned"].id, user_id=manager.id, channel="Clinic",
                        notes="manager note", occurred_at=now),
            FollowUp(org_id=rep.org_id, hcp_id=hcp.id, user_id=rep.id, due_date=date.today() - timedelta(days=2), action="Send paper"),
        ]
    )
    db.commit()


def test_follow_up_list_includes_hcp_and_can_be_marked_done_or_rescheduled(client, data, db):
    seed_activity(db, data)
    headers = auth_headers(client, "rep@a.test")
    items = client.get("/api/follow-ups?status=open", headers=headers).json()["items"]
    assert len(items) == 1 and items[0]["hcpName"] == "Dr. Asha Rao"
    fid = items[0]["id"]

    moved = client.patch(f"/api/follow-ups/{fid}", json={"dueDate": str(date.today() + timedelta(days=5))}, headers=headers)
    assert moved.status_code == 200 and moved.json()["hcpName"] == "Dr. Asha Rao"
    done = client.patch(f"/api/follow-ups/{fid}", json={"status": "done"}, headers=headers).json()
    assert done["status"] == "done" and done["completedAt"]
    assert client.get("/api/follow-ups?status=open", headers=headers).json()["total"] == 0


def test_exports_respect_scope_and_neutralize_formulas(client, data, db):
    seed_activity(db, data)
    rep, manager = auth_headers(client, "rep@a.test"), auth_headers(client, "manager@a.test")

    rep_hcps = client.get("/api/export/hcps.csv", headers=rep)
    assert rep_hcps.headers["content-type"].startswith("text/csv")
    assert "attachment" in rep_hcps.headers["content-disposition"]
    assert "Dr. Asha Rao" in rep_hcps.text and "Dr. Unassigned" not in rep_hcps.text
    assert "Dr. Unassigned" in client.get("/api/export/hcps.csv", headers=manager).text

    rep_int = client.get("/api/export/interactions.csv", headers=rep).text
    assert "manager note" not in rep_int and "rep note" in rep_int
    assert "'=HYPERLINK" in rep_int  # leading '=' is defused
    assert "manager note" in client.get("/api/export/interactions.csv", headers=manager).text
    assert client.get("/api/export/hcps.csv").status_code == 401


def test_team_activity_is_manager_only(client, data, db):
    seed_activity(db, data)
    assert client.get("/api/team/activity", headers=auth_headers(client, "rep@a.test")).status_code == 403
    rows = client.get("/api/team/activity", headers=auth_headers(client, "manager@a.test")).json()
    by_name = {r["fullName"]: r for r in rows}
    assert by_name["Rep A"]["interactionsTotal"] == 1 and by_name["Rep A"]["overdueFollowUps"] == 1
    assert by_name["Rep A"]["assignedHcps"] == 1
    assert by_name["Mgr A"]["interactionsTotal"] == 1
    assert "Rep B" not in by_name  # other org


def test_hcp_search_is_scoped_and_escapes_wildcards(client, data):
    rep = auth_headers(client, "rep@a.test")
    assert [h["name"] for h in client.get("/api/hcps?q=asha", headers=rep).json()["items"]] == ["Dr. Asha Rao"]
    assert client.get("/api/hcps?q=Other Org", headers=rep).json()["total"] == 0
    assert client.get("/api/hcps?q=%25", headers=rep).json()["total"] == 0  # literal %, not a wildcard
