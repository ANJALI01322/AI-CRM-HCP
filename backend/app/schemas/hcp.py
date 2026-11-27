from datetime import date, datetime
from typing import Annotated, Literal

from pydantic import Field, StringConstraints, field_validator

from app.schemas.common import CamelModel

Name = Annotated[str, StringConstraints(min_length=1, max_length=120)]
ProductName = Annotated[str, StringConstraints(min_length=1, max_length=120)]


Priority = Literal["High", "Medium", "Low"]
Status = Literal["Active", "Follow-up", "Inactive"]
EMAIL_PATTERN = r"^[^@\s]+@[^@\s]+\.[^@\s]+$"


class HCPFields(CamelModel):
    qualification: str | None = Field(None, max_length=160)
    department: str | None = Field(None, max_length=160)
    state: str | None = Field(None, max_length=80)
    tier: str | None = Field(None, max_length=20)
    email: str | None = Field(None, max_length=254, pattern=EMAIL_PATTERN)
    phone: str | None = Field(None, max_length=40)
    preferred_time: str | None = Field(None, max_length=120)
    prescribing_potential: str | None = Field(None, max_length=120)
    notes: str | None = Field(None, max_length=5000)
    avatar: str | None = Field(None, max_length=500)
    last_visit: date | None = None
    # Managers may assign any rep in the org; for reps it is always themselves.
    assigned_user_id: int | None = Field(None, gt=0)

    @field_validator("email", "phone", "qualification", "department", "state", mode="before")
    @classmethod
    def blank_to_none(cls, value):
        """Forms submit empty inputs as ''; store them as missing instead."""
        return None if isinstance(value, str) and not value.strip() else value


class HCPCreate(HCPFields):
    name: Name
    specialty: str = Field(min_length=1, max_length=80)
    hospital: str = Field(min_length=1, max_length=160)
    city: str = Field(min_length=1, max_length=80)
    priority: Priority = "Medium"
    status: Status = "Active"
    products_of_interest: list[ProductName] = Field(default_factory=list, max_length=50)


class HCPUpdate(HCPFields):
    name: Name | None = None
    specialty: str | None = Field(None, min_length=1, max_length=80)
    hospital: str | None = Field(None, min_length=1, max_length=160)
    city: str | None = Field(None, min_length=1, max_length=80)
    priority: Priority | None = None
    status: Status | None = None
    products_of_interest: list[ProductName] | None = Field(None, max_length=50)


class HCPOut(HCPCreate):
    id: int
    interaction_count: int = 0
    # Computed from stored interactions and follow-ups (see services/dashboard.py).
    health_label: str = "At Risk"
    health_score: int = 0
    days_since_last_visit: int | None = None
    last_sentiment: str | None = None
    interactions_last_30_days: int = 0
    overdue_follow_ups: int = 0
    next_follow_up_date: date | None = None
    next_follow_up_action: str | None = None
    created_at: datetime
    updated_at: datetime
