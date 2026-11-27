from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import RequestContext, db_session, get_context
from app.models import Product
from app.schemas.common import CamelModel

router = APIRouter(prefix="/products", tags=["Products"])


class ProductOut(CamelModel):
    id: int
    name: str
    category: str | None
    indication: str | None
    status: str | None


@router.get("", response_model=list[ProductOut])
def list_products(ctx: RequestContext = Depends(get_context), db: Session = Depends(db_session)):
    """The organization's product catalog (read-only)."""
    return db.scalars(select(Product).where(Product.org_id == ctx.org_id).order_by(Product.name)).all()
