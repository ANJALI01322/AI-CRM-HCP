from datetime import date, datetime

from sqlalchemy import CheckConstraint, Date, DateTime, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.database import Base
from app.models.base import OrgScopedMixin
from app.models.hcp import HCP


class FollowUp(OrgScopedMixin, Base):
    __tablename__ = "follow_ups"
    __table_args__ = (
        CheckConstraint("status IN ('open', 'done', 'cancelled')", name="ck_follow_ups_status"),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    hcp_id: Mapped[int] = mapped_column(
        ForeignKey("hcps.id", ondelete="CASCADE"), nullable=False, index=True
    )
    interaction_id: Mapped[int | None] = mapped_column(
        ForeignKey("interactions.id", ondelete="SET NULL"), index=True
    )
    user_id: Mapped[int | None] = mapped_column(
        ForeignKey("users.id", ondelete="SET NULL"), index=True
    )
    due_date: Mapped[date] = mapped_column(Date, nullable=False)
    action: Mapped[str] = mapped_column(Text, nullable=False)
    status: Mapped[str] = mapped_column(String(16), nullable=False, server_default="open")
    completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))

    hcp: Mapped[HCP] = relationship(lazy="raise")

    @property
    def hcp_name(self) -> str:
        return self.hcp.name

    @property
    def hcp_hospital(self) -> str:
        return self.hcp.hospital
