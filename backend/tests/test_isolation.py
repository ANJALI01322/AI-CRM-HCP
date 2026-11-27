from tests.conftest import auth_headers


def test_user_cannot_read_other_org_resources(client, data):
    headers = auth_headers(client, "manager@a.test")
    other_hcp = data["hcp_b"].id
    assert client.get(f"/api/hcps/{other_hcp}", headers=headers).status_code == 404
    assert client.patch(f"/api/hcps/{other_hcp}", json={"city": "X"}, headers=headers).status_code == 404
    assert client.delete(f"/api/hcps/{other_hcp}", headers=headers).status_code == 404
    names = [h["name"] for h in client.get("/api/hcps", headers=headers).json()["items"]]
    assert "Dr. Other Org" not in names


def test_cannot_log_interaction_against_other_org_hcp(client, data):
    headers = auth_headers(client, "manager@a.test")
    res = client.post(
        "/api/interactions",
        json={"hcpId": data["hcp_b"].id, "channel": "Call", "notes": "hi"},
        headers=headers,
    )
    assert res.status_code == 404


def test_rep_sees_only_assigned_hcps_and_own_interactions(client, data):
    rep = auth_headers(client, "rep@a.test")
    manager = auth_headers(client, "manager@a.test")

    rep_names = {h["name"] for h in client.get("/api/hcps", headers=rep).json()["items"]}
    assert rep_names == {"Dr. Asha Rao"}
    assert client.get(f"/api/hcps/{data['hcp_a_unassigned'].id}", headers=rep).status_code == 404

    mgr_names = {h["name"] for h in client.get("/api/hcps", headers=manager).json()["items"]}
    assert mgr_names == {"Dr. Asha Rao", "Dr. Unassigned"}

    created = client.post(
        "/api/interactions",
        json={"hcpId": data["hcp_a"].id, "channel": "Call", "notes": "manager visit"},
        headers=manager,
    )
    assert created.status_code == 201
    interaction_id = created.json()["id"]
    assert client.get("/api/interactions", headers=rep).json()["total"] == 0
    assert client.get(f"/api/interactions/{interaction_id}", headers=rep).status_code == 404
    assert client.get("/api/interactions", headers=manager).json()["total"] == 1


def test_rep_cannot_reassign_hcp(client, data):
    rep = auth_headers(client, "rep@a.test")
    res = client.patch(
        f"/api/hcps/{data['hcp_a'].id}", json={"assignedUserId": data["manager"].id}, headers=rep
    )
    assert res.status_code == 403
