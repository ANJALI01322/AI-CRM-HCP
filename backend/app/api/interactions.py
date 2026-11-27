from fastapi import APIRouter, Depends, Query, Response
from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload

from app.api.crud import count, get_owned, scope, update_fields
from app.api.deps import Pagination, RequestContext, db_session, get_context, pagination
from app.models import HCP, FollowUp, Interaction
from app.schemas.common import Page
from app.schemas.interaction import InteractionCreate, InteractionOut, InteractionUpdate

router = APIRouter(prefix="/interactions", tags=["Interactions"])

REQUIRED = {"channel", "products", "notes", "occurred_at"}


def _load(db: Session, interaction_id: int, ctx: RequestContext) -> Interaction:
    get_owned(db, Interaction, interaction_id, ctx, "Interaction")
    return db.scalar(
        select(Interaction)
        .options(joinedload(Interaction.hcp))
        .where(Interaction.id == interaction_id)
        .execution_options(populate_existing=True)
    )


@router.get("", response_model=Page[InteractionOut])
def list_interactions(
    hcp_id: int | None = Query(None, gt=0),
    page: Pagination = Depends(pagination),
    ctx: RequestContext = Depends(get_context),
    db: Session = Depends(db_session),
):
    query = select(Interaction).where(*scope(Interaction, ctx))
    if hcp_id is not None:
        query = query.where(Interaction.hcp_id == hcp_id)
    query = query.order_by(Interaction.occurred_at.desc(), Interaction.id.desc())
    items = db.scalars(
        query.options(joinedload(Interaction.hcp)).limit(page.limit).offset(page.offset)
    ).all()
    return Page(items=items, total=count(db, query), limit=page.limit, offset=page.offset)


@router.get("/{interaction_id}", response_model=InteractionOut)
def get_interaction(
    interaction_id: int, ctx: RequestContext = Depends(get_context), db: Session = Depends(db_session)
):
    return _load(db, interaction_id, ctx)


@router.post("", response_model=InteractionOut, status_code=201)
def create_interaction(
    payload: InteractionCreate, ctx: RequestContext = Depends(get_context), db: Session = Depends(db_session)
):
    """Also updates the HCP's last visit and opens a follow-up when followUpDate is set."""
    hcp = get_owned(db, HCP, payload.hcp_id, ctx, "HCP")
    data = payload.model_dump(by_alias=False, exclude_none=True)
    interaction = Interaction(**data, org_id=ctx.org_id, user_id=ctx.user_id)
    db.add(interaction)
    db.flush()
    db.refresh(interaction)  # load server-side occurred_at

    visit_date = interaction.occurred_at.date()
    if hcp.last_visit is None or visit_date > hcp.last_visit:
        hcp.last_visit = visit_date

    if interaction.follow_up_date:
        db.add(
            FollowUp(
                org_id=ctx.org_id,
                hcp_id=hcp.id,
                interaction_id=interaction.id,
                user_id=ctx.user_id,
                due_date=interaction.follow_up_date,
                action=interaction.follow_up_action or f"Follow up with {hcp.name}",
            )
        )
    db.commit()
    return _load(db, interaction.id, ctx)


@router.patch("/{interaction_id}", response_model=InteractionOut)
def update_interaction(
    interaction_id: int,
    payload: InteractionUpdate,
    ctx: RequestContext = Depends(get_context),
    db: Session = Depends(db_session),
):
    interaction = get_owned(db, Interaction, interaction_id, ctx, "Interaction")
    update_fields(interaction, payload, REQUIRED)
    db.commit()
    return _load(db, interaction_id, ctx)


@router.delete("/{interaction_id}", status_code=204)
def delete_interaction(
    interaction_id: int, ctx: RequestContext = Depends(get_context), db: Session = Depends(db_session)
):
    db.delete(get_owned(db, Interaction, interaction_id, ctx, "Interaction"))
    db.commit()
    return Response(status_code=204)
