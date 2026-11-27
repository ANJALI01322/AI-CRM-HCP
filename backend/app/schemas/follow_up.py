from datetime import date, datetime
from typing import Literal

from pydantic import Field

from app.schemas.common import CamelModel

FollowUpStatus = Literal["open", "done", "cancelled"]


class FollowUpCreate(CamelModel):
    hcp_id: int = Field(gt=0)
    interaction_id: int | None = Field(None, gt=0)
    due_date: date
    action: str = Field(min_length=1, max_length=2000)
    status: FollowUpStatus = "open"


class FollowUpUpdate(CamelModel):
    due_date: date | None = None
    action: str | None = Field(None, min_length=1, max_length=2000)
    status: FollowUpStatus | None = None


class FollowUpOut(FollowUpCreate):
    id: int
    user_id: int | None
    completed_at: datetime | None
    created_at: datetime
    updated_at: datetime
