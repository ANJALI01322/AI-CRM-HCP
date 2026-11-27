"""Read-only CRM queries scoped to the caller. Shared by the chat agent tools and the dashboard."""

from datetime import date

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.api.crud import scope
from app.api.deps import Clock, RequestContext
from app.langgraph.workflow import name_score
from app.models import HCP, FollowUp, Interaction


def days_since(clock: Clock, d: date | None) -> int | None:
    return None if d is None else max(0, (clock.today - d).days)


def find_hcps(db: Session, ctx: RequestContext, name: str, limit: int = 3) -> list[tuple[HCP, float]]:
    hcps = db.scalars(select(HCP).where(*scope(HCP, ctx))).all()
    scored = sorted(((h, name_score(name, h.name)) for h in hcps), key=lambda x: x[1], reverse=True)
    return [(h, round(s, 2)) for h, s in scored[:limit] if s >= 0.45]


def _interaction_dict(i: Interaction, hcp: HCP) -> dict:
    return {
        "id": i.id,
        "hcp": hcp.name,
        "date": i.occurred_at.date().isoformat(),
        "channel": i.channel,
        "products": list(i.products or []),
        "sentiment": i.sentiment,
        "objections": i.objections,
        "summary": i.summary or i.notes[:500],
        "follow_up_date": i.follow_up_date.isoformat() if i.follow_up_date else None,
    }


def recent_interactions(
    db: Session, ctx: RequestContext, clock: Clock, hcp_id: int | None = None, days: int = 30, limit: int = 10
) -> list[dict]:
    query = (
        select(Interaction, HCP)
        .join(HCP, HCP.id == Interaction.hcp_id)
        .where(*scope(Interaction, ctx), Interaction.occurred_at >= clock.days_ago(days))
        .order_by(Interaction.occurred_at.desc(), Interaction.id.desc())
        .limit(limit)
    )
    if hcp_id is not None:
        query = query.where(Interaction.hcp_id == hcp_id)
    return [_interaction_dict(i, h) for i, h in db.execute(query).all()]


def _follow_up_dict(f: FollowUp, hcp: HCP, clock: Clock) -> dict:
    return {
        "id": f.id,
        "hcp": hcp.name,
        "hcp_id": hcp.id,
        "hospital": hcp.hospital,
        "specialty": hcp.specialty,
        "due_date": f.due_date.isoformat(),
        "days_overdue": max(0, (clock.today - f.due_date).days),
        "action": f.action,
    }


def open_follow_ups(
    db: Session, ctx: RequestContext, clock: Clock, overdue_only: bool = False, limit: int = 50
) -> list[dict]:
    query = (
        select(FollowUp, HCP)
        .join(HCP, HCP.id == FollowUp.hcp_id)
        .where(*scope(FollowUp, ctx), FollowUp.status == "open")
        .order_by(FollowUp.due_date, FollowUp.id)
        .limit(limit)
    )
    if overdue_only:
        query = query.where(FollowUp.due_date < clock.today)
    return [_follow_up_dict(f, h, clock) for f, h in db.execute(query).all()]


def latest_sentiments(db: Session, ctx: RequestContext, hcp_ids: list[int]) -> dict[int, str | None]:
    """Sentiment of each HCP's most recent interaction visible to the caller."""
    if not hcp_ids:
        return {}
    ranked = (
        select(
            Interaction.hcp_id,
            Interaction.sentiment,
            func.row_number()
            .over(partition_by=Interaction.hcp_id, order_by=(Interaction.occurred_at.desc(), Interaction.id.desc()))
            .label("rn"),
        )
        .where(*scope(Interaction, ctx), Interaction.hcp_id.in_(hcp_ids))
        .subquery()
    )
    rows = db.execute(select(ranked.c.hcp_id, ranked.c.sentiment).where(ranked.c.rn == 1))
    return {hcp_id: sentiment for hcp_id, sentiment in rows.all()}


def hcp_profile(db: Session, ctx: RequestContext, clock: Clock, hcp: HCP) -> dict:
    interactions = recent_interactions(db, ctx, clock, hcp_id=hcp.id, days=3650, limit=5)
    follow_ups = [f for f in open_follow_ups(db, ctx, clock) if f["hcp_id"] == hcp.id]
    total = db.scalar(
        select(func.count()).select_from(Interaction).where(*scope(Interaction, ctx), Interaction.hcp_id == hcp.id)
    )
    return {
        "name": hcp.name,
        "qualification": hcp.qualification,
        "specialty": hcp.specialty,
        "hospital": hcp.hospital,
        "city": hcp.city,
        "tier": hcp.tier,
        "priority": hcp.priority,
        "status": hcp.status,
        "preferred_time": hcp.preferred_time,
        "products_of_interest": list(hcp.products_of_interest or []),
        "notes": hcp.notes,
        "last_visit": hcp.last_visit.isoformat() if hcp.last_visit else None,
        "days_since_last_visit": days_since(clock, hcp.last_visit),
        "total_interactions": total,
        "recent_interactions": interactions,
        "open_follow_ups": follow_ups,
    }


def territory_summary(db: Session, ctx: RequestContext, clock: Clock) -> dict:
    hcps = db.scalars(select(HCP).where(*scope(HCP, ctx)).order_by(HCP.name)).all()
    since = clock.days_ago(30)
    rows = db.execute(
        select(Interaction.sentiment, Interaction.products).where(
            *scope(Interaction, ctx), Interaction.occurred_at >= since
        )
    ).all()
    sentiment: dict[str, int] = {}
    products: dict[str, int] = {}
    for s, prods in rows:
        key = (s or "Unknown").capitalize()
        sentiment[key] = sentiment.get(key, 0) + 1
        for p in prods or []:
            products[p] = products.get(p, 0) + 1
    open_fus = open_follow_ups(db, ctx, clock, limit=1000)
    not_contacted = [
        {"name": h.name, "days_since_last_visit": days_since(clock, h.last_visit)}
        for h in hcps
        if h.last_visit is None or (clock.today - h.last_visit).days > 30
    ]
    return {
        "scope": "organization" if ctx.is_manager else "my assigned HCPs",
        "today": clock.today.isoformat(),
        "hcp_count": len(hcps),
        "interactions_last_30_days": len(rows),
        "sentiment_last_30_days": sentiment,
        "top_products_last_30_days": sorted(products.items(), key=lambda x: x[1], reverse=True)[:5],
        "open_follow_ups": len(open_fus),
        "overdue_follow_ups": sum(1 for f in open_fus if f["days_overdue"] > 0),
        "hcps_not_contacted_30_days": not_contacted[:15],
    }
