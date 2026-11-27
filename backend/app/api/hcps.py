from fastapi import APIRouter, Depends, Response
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.api.crud import count, get_owned, update_fields
from app.api.deps import Pagination, RequestContext, db_session, get_context, pagination
from app.models import HCP, Interaction
from app.schemas.common import Page
from app.schemas.hcp import HCPCreate, HCPOut, HCPUpdate

router = APIRouter(prefix="/hcps", tags=["HCPs"])

REQUIRED = {"name", "specialty", "hospital", "city", "priority", "status", "products_of_interest"}


def _interaction_counts(db: Session, hcp_ids: list[int]) -> dict[int, int]:
    if not hcp_ids:
        return {}
    rows = db.execute(
        select(Interaction.hcp_id, func.count())
        .where(Interaction.hcp_id.in_(hcp_ids))
        .group_by(Interaction.hcp_id)
    )
    return dict(rows.all())


def _out(hcp: HCP, interaction_count: int) -> HCPOut:
    out = HCPOut.model_validate(hcp)
    out.interaction_count = interaction_count
    return out


@router.get("", response_model=Page[HCPOut])
def list_hcps(
    page: Pagination = Depends(pagination),
    ctx: RequestContext = Depends(get_context),
    db: Session = Depends(db_session),
):
    query = select(HCP).where(HCP.org_id == ctx.org_id).order_by(HCP.name, HCP.id)
    hcps = db.scalars(query.limit(page.limit).offset(page.offset)).all()
    counts = _interaction_counts(db, [h.id for h in hcps])
    return Page(
        items=[_out(h, counts.get(h.id, 0)) for h in hcps],
        total=count(db, query),
        limit=page.limit,
        offset=page.offset,
    )


@router.get("/{hcp_id}", response_model=HCPOut)
def get_hcp(hcp_id: int, ctx: RequestContext = Depends(get_context), db: Session = Depends(db_session)):
    hcp = get_owned(db, HCP, hcp_id, ctx.org_id, "HCP")
    return _out(hcp, _interaction_counts(db, [hcp.id]).get(hcp.id, 0))


@router.post("", response_model=HCPOut, status_code=201)
def create_hcp(payload: HCPCreate, ctx: RequestContext = Depends(get_context), db: Session = Depends(db_session)):
    hcp = HCP(**payload.model_dump(by_alias=False), org_id=ctx.org_id)
    db.add(hcp)
    db.commit()
    db.refresh(hcp)
    return _out(hcp, 0)


@router.patch("/{hcp_id}", response_model=HCPOut)
def update_hcp(
    hcp_id: int,
    payload: HCPUpdate,
    ctx: RequestContext = Depends(get_context),
    db: Session = Depends(db_session),
):
    hcp = get_owned(db, HCP, hcp_id, ctx.org_id, "HCP")
    update_fields(hcp, payload, REQUIRED)
    db.commit()
    db.refresh(hcp)
    return _out(hcp, _interaction_counts(db, [hcp.id]).get(hcp.id, 0))


@router.delete("/{hcp_id}", status_code=204)
def delete_hcp(hcp_id: int, ctx: RequestContext = Depends(get_context), db: Session = Depends(db_session)):
    """Also deletes the HCP's interactions and follow-ups (ON DELETE CASCADE)."""
    db.delete(get_owned(db, HCP, hcp_id, ctx.org_id, "HCP"))
    db.commit()
    return Response(status_code=204)
