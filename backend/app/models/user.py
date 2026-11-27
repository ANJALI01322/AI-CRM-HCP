from sqlalchemy import Boolean, CheckConstraint, String, true
from sqlalchemy.orm import Mapped, mapped_column

from app.database.database import Base
from app.models.base import OrgScopedMixin


class User(OrgScopedMixin, Base):
    __tablename__ = "users"
    __table_args__ = (CheckConstraint("role IN ('rep', 'manager')", name="ck_users_role"),)

    id: Mapped[int] = mapped_column(primary_key=True)
    full_name: Mapped[str] = mapped_column(String(100), nullable=False)
    email: Mapped[str] = mapped_column(String(254), nullable=False, unique=True)
    phone: Mapped[str | None] = mapped_column(String(40))
    # Nullable until authentication is implemented.
    password_hash: Mapped[str | None] = mapped_column(String(255))
    role: Mapped[str] = mapped_column(String(16), nullable=False, server_default="rep")
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, server_default=true())
