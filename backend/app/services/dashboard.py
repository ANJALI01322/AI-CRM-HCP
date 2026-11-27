"""Relationship health, next best actions and dashboard stats, computed from the caller's scoped data."""

from datetime import timedelta

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.api.crud import scope
from app.api.deps import Clock, RequestContext
from app.models import HCP, FollowUp, Interaction
from app.services.crm_queries import days_since, latest_sentiments, open_follow_ups

HEALTH_LABELS = ("Strong", "Healthy", "Watch", "At Risk")


def relationship_health(days: int | None, sentiment: str | None) -> tuple[str, int]:
    """Score 0-100: 100 minus days since last visit (capped at 90), +10 if the latest sentiment
    is positive, -25 if negative. Never visited scores 0."""
    if days is None:
        return "At Risk", 0
    score = 100 - min(days, 90)
    s = (sentiment or "").lower()
    if s == "positive":
        score += 10
    elif s == "negative":
        score -= 25
    score = max(0, min(100, score))
    if score >= 80:
        return "Strong", score
    if score >= 60:
        return "Healthy", score
    if score >= 40:
        return "Watch", score
    return "At Risk", score


def hcp_insights(db: Session, ctx: RequestContext, clock: Clock, hcps: list[HCP]) -> dict[int, dict]:
    """Per-HCP health, 30-day activity and next open follow-up, within the caller's scope."""
    ids = [h.id for h in hcps]
    if not ids:
        return {}
    sentiments = latest_sentiments(db, ctx, ids)
    recent = dict(
        db.execute(
            select(Interaction.hcp_id, func.count())
            .where(
                *scope(Interaction, ctx),
                Interaction.hcp_id.in_(ids),
                Interaction.occurred_at >= clock.days_ago(30),
            )
            .group_by(Interaction.hcp_id)
        ).all()
    )
    next_fu: dict[int, FollowUp] = {}
    overdue: dict[int, int] = {}
    for f in db.scalars(
        select(FollowUp)
        .where(*scope(FollowUp, ctx), FollowUp.status == "open", FollowUp.hcp_id.in_(ids))
        .order_by(FollowUp.due_date, FollowUp.id)
    ):
        next_fu.setdefault(f.hcp_id, f)
        if f.due_date < clock.today:
            overdue[f.hcp_id] = overdue.get(f.hcp_id, 0) + 1

    out = {}
    for h in hcps:
        days = days_since(clock, h.last_visit)
        label, score = relationship_health(days, sentiments.get(h.id))
        fu = next_fu.get(h.id)
        out[h.id] = {
            "health_label": label,
            "health_score": score,
            "days_since_last_visit": days,
            "last_sentiment": sentiments.get(h.id),
            "interactions_last_30_days": recent.get(h.id, 0),
            "overdue_follow_ups": overdue.get(h.id, 0),
            "next_follow_up_date": fu.due_date if fu else None,
            "next_follow_up_action": fu.action if fu else None,
        }
    return out


def _latest_objections(db: Session, ctx: RequestContext, hcp_id: int) -> str | None:
    return db.scalar(
        select(Interaction.objections)
        .where(*scope(Interaction, ctx), Interaction.hcp_id == hcp_id, Interaction.objections.is_not(None))
        .order_by(Interaction.occurred_at.desc())
        .limit(1)
    )


def _plural(n: int, word: str) -> str:
    return f"{n} {word}" + ("" if n == 1 else "s")


def next_best_actions(
    db: Session, ctx: RequestContext, hcps: list[HCP], insights: dict, limit: int = 3
) -> list[dict]:
    """Rank by: days since last visit (capped 90; never visited = 90) + 25 if the latest
    sentiment is negative + 15 per overdue follow-up. Reasons/actions use stored data only."""
    ranked = []
    for h in hcps:
        i = insights[h.id]
        days = i["days_since_last_visit"]
        negative = (i["last_sentiment"] or "").lower() == "negative"
        score = min(90 if days is None else days, 90) + (25 if negative else 0) + 15 * i["overdue_follow_ups"]
        ranked.append((score, h.priority == "High", h, i, negative))
    ranked.sort(key=lambda r: (r[0], r[1]), reverse=True)

    actions = []
    for score, _, h, i, negative in ranked[:limit]:
        if score <= 0:
            break
        days = i["days_since_last_visit"]
        reasons = ["Never visited" if days is None else f"{_plural(days, 'day')} since last visit"]
        if negative:
            reasons.append("last interaction sentiment was negative")
        if i["overdue_follow_ups"]:
            reasons.append(_plural(i["overdue_follow_ups"], "overdue follow-up"))

        if i["overdue_follow_ups"]:
            kind, action = "followup", f"Complete overdue follow-up: {i['next_follow_up_action']}"
        elif negative:
            objections = _latest_objections(db, ctx, h.id)
            kind = "risk"
            action = f"Address recorded objections: {objections}" if objections else "Revisit to address the negative feedback"
        elif days is None or days > 30:
            kind, action = "risk", "Schedule a visit to re-establish contact"
        elif i["next_follow_up_action"]:
            kind, action = "opportunity", f"Next planned step: {i['next_follow_up_action']}"
        else:
            kind, action = "opportunity", "Plan the next detailing visit"

        actions.append(
            {
                "hcp_id": h.id,
                "name": h.name,
                "specialty": h.specialty,
                "hospital": h.hospital,
                "products_of_interest": list(h.products_of_interest or []),
                "score": score,
                "type": kind,
                "reason": "; ".join(reasons) + ".",
                "action": action,
            }
        )
    return actions


def dashboard_stats(db: Session, ctx: RequestContext, clock: Clock) -> dict:
    hcps = db.scalars(select(HCP).where(*scope(HCP, ctx)).order_by(HCP.name)).all()
    insights = hcp_insights(db, ctx, clock, hcps)

    health = {label: 0 for label in HEALTH_LABELS}
    for i in insights.values():
        health[i["health_label"]] += 1
    avg_score = round(sum(i["health_score"] for i in insights.values()) / len(hcps)) if hcps else None

    today = clock.today.isoformat()
    week_end = (clock.today + timedelta(days=6)).isoformat()
    open_fus = open_follow_ups(db, ctx, clock, limit=10_000)
    overdue = sum(1 for f in open_fus if f["due_date"] < today)
    due_today = sum(1 for f in open_fus if f["due_date"] == today)
    due_week = sum(1 for f in open_fus if today <= f["due_date"] <= week_end)

    in_scope = scope(Interaction, ctx)
    since30 = clock.days_ago(30)

    def count(*where) -> int:
        return db.scalar(select(func.count()).select_from(Interaction).where(*in_scope, *where))

    last30 = count(Interaction.occurred_at >= since30)
    channels = db.execute(
        select(Interaction.channel, func.count())
        .where(*in_scope, Interaction.occurred_at >= since30)
        .group_by(Interaction.channel)
        .order_by(func.count().desc())
    ).all()
    touched = sum(
        1 for i in insights.values() if i["days_since_last_visit"] is not None and i["days_since_last_visit"] <= 30
    )

    return {
        "today": clock.today,
        "hcp_count": len(hcps),
        "kol_count": sum(1 for h in hcps if h.tier in ("KOL", "Tier 1")),
        "high_priority_count": sum(1 for h in hcps if h.priority == "High"),
        "health": {
            "strong": health["Strong"],
            "healthy": health["Healthy"],
            "watch": health["Watch"],
            "at_risk": health["At Risk"],
            "average_score": avg_score,
        },
        "follow_ups": {
            "open": len(open_fus),
            "due_today": due_today,
            "due_this_week": due_week,
            "overdue": overdue,
            "due_now": due_today + overdue,
        },
        "today_visits": count(
            Interaction.occurred_at >= clock.start_of(clock.today),
            Interaction.occurred_at < clock.start_of(clock.today + timedelta(days=1)),
        ),
        "interactions_total": count(),
        "interactions_last_30_days": last30,
        "coverage_last_30_days": {
            "touched": touched,
            "total": len(hcps),
            "pct": round(100 * touched / len(hcps)) if hcps else 0,
        },
        "channel_split": [
            {"channel": ch, "count": n, "pct": round(100 * n / last30) if last30 else 0} for ch, n in channels
        ],
        "next_best_actions": next_best_actions(db, ctx, hcps, insights),
        "due_follow_ups": [f for f in open_fus if f["due_date"] <= today][:10],
    }
