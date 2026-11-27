from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.api.crud import check_org_user, count, get_owned, scope, update_fields
from app.api.deps import Clock, Pagination, RequestContext, client_clock, db_session, get_context, pagination
from app.models import HCP, Interaction
from app.schemas.common import Page
from app.schemas.hcp import HCPCreate, HCPOut, HCPUpdate
from app.services.dashboard import hcp_insights

router = APIRouter(prefix="/hcps", tags=["HCPs"])

REQUIRED = {"name", "specialty", "hospital", "city", "priority", "status", "products_of_interest"}


def _interaction_counts(db: Session, ctx: RequestContext, hcp_ids: list[int]) -> dict[int, int]:
    if not hcp_ids:
        return {}
    rows = db.execute(
        select(Interaction.hcp_id, func.count())
        .where(Interaction.hcp_id.in_(hcp_ids), *scope(Interaction, ctx))
        .group_by(Interaction.hcp_id)
    )
    return dict(rows.all())


def _assignee(db: Session, ctx: RequestContext, requested: int | None) -> int | None:
    if not ctx.is_manager:
        return ctx.user_id
    if requested is not None:
        check_org_user(db, requested, ctx.org_id)
    return requested


def _out(db: Session, ctx: RequestContext, clock: Clock, hcps: list[HCP]) -> list[HCPOut]:
    counts = _interaction_counts(db, ctx, [h.id for h in hcps])
    insights = hcp_insights(db, ctx, clock, hcps)
    outs = []
    for h in hcps:
        out = HCPOut.model_validate(h)
        out.interaction_count = counts.get(h.id, 0)
        for key, value in insights[h.id].items():
            setattr(out, key, value)
        outs.append(out)
    return outs


@router.get("", response_model=Page[HCPOut])
def list_hcps(
    page: Pagination = Depends(pagination),
    ctx: RequestContext = Depends(get_context),
    db: Session = Depends(db_session),
    clock: Clock = Depends(client_clock),
):
    query = select(HCP).where(*scope(HCP, ctx)).order_by(HCP.name, HCP.id)
    hcps = db.scalars(query.limit(page.limit).offset(page.offset)).all()
    return Page(
        items=_out(db, ctx, clock, hcps),
        total=count(db, query),
        limit=page.limit,
        offset=page.offset,
    )


@router.get("/{hcp_id}", response_model=HCPOut)
def get_hcp(
    hcp_id: int,
    ctx: RequestContext = Depends(get_context),
    db: Session = Depends(db_session),
    clock: Clock = Depends(client_clock),
):
    return _out(db, ctx, clock, [get_owned(db, HCP, hcp_id, ctx, "HCP")])[0]


@router.post("", response_model=HCPOut, status_code=201)
def create_hcp(
    payload: HCPCreate,
    ctx: RequestContext = Depends(get_context),
    db: Session = Depends(db_session),
    clock: Clock = Depends(client_clock),
):
    data = payload.model_dump(by_alias=False)
    data["assigned_user_id"] = _assignee(db, ctx, data.get("assigned_user_id"))
    hcp = HCP(**data, org_id=ctx.org_id)
    db.add(hcp)
    db.commit()
    db.refresh(hcp)
    return _out(db, ctx, clock, [hcp])[0]


@router.patch("/{hcp_id}", response_model=HCPOut)
def update_hcp(
    hcp_id: int,
    payload: HCPUpdate,
    ctx: RequestContext = Depends(get_context),
    db: Session = Depends(db_session),
    clock: Clock = Depends(client_clock),
):
    hcp = get_owned(db, HCP, hcp_id, ctx, "HCP")
    if "assigned_user_id" in payload.model_fields_set:
        if not ctx.is_manager:
            raise HTTPException(status_code=403, detail="Only managers can reassign HCPs")
        _assignee(db, ctx, payload.assigned_user_id)
    update_fields(hcp, payload, REQUIRED)
    db.commit()
    db.refresh(hcp)
    return _out(db, ctx, clock, [hcp])[0]


@router.delete("/{hcp_id}", status_code=204)
def delete_hcp(hcp_id: int, ctx: RequestContext = Depends(get_context), db: Session = Depends(db_session)):
    """Also deletes the HCP's interactions and follow-ups (ON DELETE CASCADE)."""
    db.delete(get_owned(db, HCP, hcp_id, ctx, "HCP"))
    db.commit()
    return Response(status_code=204)
