from sqlalchemy import String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column

from app.database.database import Base
from app.models.base import OrgScopedMixin


class Product(OrgScopedMixin, Base):
    __tablename__ = "products"
    __table_args__ = (UniqueConstraint("org_id", "name", name="uq_products_org_name"),)

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(120), nullable=False)
    category: Mapped[str | None] = mapped_column(String(80))
    indication: Mapped[str | None] = mapped_column(String(200))
    formula: Mapped[str | None] = mapped_column(String(200))
    status: Mapped[str | None] = mapped_column(String(40))
