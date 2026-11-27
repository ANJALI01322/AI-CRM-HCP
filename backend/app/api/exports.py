"""CSV exports, scoped exactly like the list endpoints: reps get their own data, managers the organization's."""

import csv
import io
from datetime import date

from fastapi import APIRouter, Depends, Response
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.crud import scope
from app.api.deps import Clock, RequestContext, client_clock, db_session, get_context
from app.models import HCP, Interaction, User
from app.services.dashboard import hcp_insights

router = APIRouter(prefix="/export", tags=["Export"])

MAX_ROWS = 10_000


def safe_cell(value) -> str:
    """Stringify a value and neutralize spreadsheet formula injection (=, +, -, @, tab, CR)."""
    if value is None:
        return ""
    text = str(value)
    if text[:1] in ("=", "+", "-", "@", "\t", "\r"):
        return "'" + text
    return text


def csv_response(filename: str, header: list[str], rows) -> Response:
    buffer = io.StringIO()
    writer = csv.writer(buffer)
    writer.writerow(header)
    for row in rows:
        writer.writerow([safe_cell(v) for v in row])
    # UTF-8 BOM so Excel opens non-ASCII names correctly.
    return Response(
        content="﻿" + buffer.getvalue(),
        media_type="text/csv; charset=utf-8",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


@router.get("/hcps.csv")
def export_hcps(
    ctx: RequestContext = Depends(get_context),
    db: Session = Depends(db_session),
    clock: Clock = Depends(client_clock),
):
    hcps = db.scalars(select(HCP).where(*scope(HCP, ctx)).order_by(HCP.name, HCP.id).limit(MAX_ROWS)).all()
    insights = hcp_insights(db, ctx, clock, hcps)
    header = [
        "Name", "Qualification", "Specialty", "Hospital", "City", "State", "Tier", "Priority", "Status",
        "Email", "Phone", "Last visit", "Days since last visit", "Relationship health", "Health score",
        "Interactions (30d)", "Products of interest",
    ]
    rows = (
        [
            h.name, h.qualification, h.specialty, h.hospital, h.city, h.state, h.tier, h.priority, h.status,
            h.email, h.phone, h.last_visit, insights[h.id]["days_since_last_visit"],
            insights[h.id]["health_label"], insights[h.id]["health_score"],
            insights[h.id]["interactions_last_30_days"], "; ".join(h.products_of_interest or []),
        ]
        for h in hcps
    )
    return csv_response(f"hcps-{clock.today.isoformat()}.csv", header, rows)


@router.get("/interactions.csv")
def export_interactions(
    ctx: RequestContext = Depends(get_context),
    db: Session = Depends(db_session),
    clock: Clock = Depends(client_clock),
):
    query = (
        select(Interaction, HCP, User.full_name)
        .join(HCP, HCP.id == Interaction.hcp_id)
        .join(User, User.id == Interaction.user_id)
        .where(*scope(Interaction, ctx))
        .order_by(Interaction.occurred_at.desc(), Interaction.id.desc())
        .limit(MAX_ROWS)
    )
    header = [
        "Date", "HCP", "Hospital", "Specialty", "Channel", "Products", "Sentiment", "Objections",
        "Summary", "Notes", "Follow-up date", "Follow-up action", "Logged by",
    ]
    rows = (
        [
            i.occurred_at.astimezone(clock.tz).date(), h.name, h.hospital, h.specialty, i.channel,
            "; ".join(i.products or []), i.sentiment, i.objections, i.summary, i.notes,
            i.follow_up_date, i.follow_up_action, user_name,
        ]
        for i, h, user_name in db.execute(query).all()
    )
    return csv_response(f"interactions-{clock.today.isoformat()}.csv", header, rows)
