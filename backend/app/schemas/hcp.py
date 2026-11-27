from datetime import date, datetime
from typing import Annotated

from pydantic import Field, StringConstraints

from app.schemas.common import CamelModel

Name = Annotated[str, StringConstraints(min_length=1, max_length=120)]
ProductName = Annotated[str, StringConstraints(min_length=1, max_length=120)]


class HCPFields(CamelModel):
    qualification: str | None = Field(None, max_length=160)
    department: str | None = Field(None, max_length=160)
    state: str | None = Field(None, max_length=80)
    tier: str | None = Field(None, max_length=20)
    email: str | None = Field(None, max_length=254)
    phone: str | None = Field(None, max_length=40)
    preferred_time: str | None = Field(None, max_length=120)
    prescribing_potential: str | None = Field(None, max_length=120)
    notes: str | None = Field(None, max_length=5000)
    avatar: str | None = Field(None, max_length=500)
    last_visit: date | None = None
    # Managers may assign any rep in the org; for reps it is always themselves.
    assigned_user_id: int | None = Field(None, gt=0)


class HCPCreate(HCPFields):
    name: Name
    specialty: str = Field(min_length=1, max_length=80)
    hospital: str = Field(min_length=1, max_length=160)
    city: str = Field(min_length=1, max_length=80)
    priority: str = Field("Medium", min_length=1, max_length=20)
    status: str = Field("Active", min_length=1, max_length=32)
    products_of_interest: list[ProductName] = Field(default_factory=list, max_length=50)


class HCPUpdate(HCPFields):
    name: Name | None = None
    specialty: str | None = Field(None, min_length=1, max_length=80)
    hospital: str | None = Field(None, min_length=1, max_length=160)
    city: str | None = Field(None, min_length=1, max_length=80)
    priority: str | None = Field(None, min_length=1, max_length=20)
    status: str | None = Field(None, min_length=1, max_length=32)
    products_of_interest: list[ProductName] | None = Field(None, max_length=50)


class HCPOut(HCPCreate):
    id: int
    interaction_count: int = 0
    created_at: datetime
    updated_at: datetime
