from datetime import date, datetime

from sqlalchemy import Date, DateTime, ForeignKey, String, Text, func, text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.database import Base
from app.models.base import OrgScopedMixin, StringArray
from app.models.hcp import HCP


class Interaction(OrgScopedMixin, Base):
    __tablename__ = "interactions"

    id: Mapped[int] = mapped_column(primary_key=True)
    hcp_id: Mapped[int] = mapped_column(
        ForeignKey("hcps.id", ondelete="CASCADE"), nullable=False, index=True
    )
    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="RESTRICT"), nullable=False, index=True
    )
    channel: Mapped[str] = mapped_column(String(80), nullable=False)
    products: Mapped[list[str]] = mapped_column(
        StringArray, nullable=False, server_default=text("'{}'")
    )
    notes: Mapped[str] = mapped_column(Text, nullable=False)
    sentiment: Mapped[str | None] = mapped_column(String(32))
    objections: Mapped[str | None] = mapped_column(Text)
    follow_up_date: Mapped[date | None] = mapped_column(Date)
    summary: Mapped[str | None] = mapped_column(Text)
    follow_up_action: Mapped[str | None] = mapped_column(Text)
    occurred_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )

    hcp: Mapped[HCP] = relationship(lazy="raise")

    @property
    def hcp_name(self) -> str:
        return self.hcp.name

    @property
    def hcp_specialty(self) -> str:
        return self.hcp.specialty

    @property
    def hcp_hospital(self) -> str:
        return self.hcp.hospital
