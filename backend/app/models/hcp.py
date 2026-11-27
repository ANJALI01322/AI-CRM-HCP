from datetime import date

from sqlalchemy import Date, ForeignKey, String, Text, text
from sqlalchemy.orm import Mapped, mapped_column

from app.database.database import Base
from app.models.base import OrgScopedMixin, StringArray


class HCP(OrgScopedMixin, Base):
    __tablename__ = "hcps"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(120), nullable=False)
    qualification: Mapped[str | None] = mapped_column(String(160))
    specialty: Mapped[str] = mapped_column(String(80), nullable=False)
    hospital: Mapped[str] = mapped_column(String(160), nullable=False)
    department: Mapped[str | None] = mapped_column(String(160))
    city: Mapped[str] = mapped_column(String(80), nullable=False)
    state: Mapped[str | None] = mapped_column(String(80))
    tier: Mapped[str | None] = mapped_column(String(20))
    priority: Mapped[str] = mapped_column(String(20), nullable=False, server_default="Medium")
    status: Mapped[str] = mapped_column(String(32), nullable=False, server_default="Active")
    email: Mapped[str | None] = mapped_column(String(254))
    phone: Mapped[str | None] = mapped_column(String(40))
    preferred_time: Mapped[str | None] = mapped_column(String(120))
    prescribing_potential: Mapped[str | None] = mapped_column(String(120))
    products_of_interest: Mapped[list[str]] = mapped_column(
        StringArray, nullable=False, server_default=text("'{}'")
    )
    notes: Mapped[str | None] = mapped_column(Text)
    avatar: Mapped[str | None] = mapped_column(String(500))
    last_visit: Mapped[date | None] = mapped_column(Date)
    # Rep responsible for this HCP. Reps only see HCPs assigned to them; managers see all.
    assigned_user_id: Mapped[int | None] = mapped_column(
        ForeignKey("users.id", ondelete="SET NULL"), index=True
    )
