from datetime import date, datetime
from typing import Literal

from pydantic import Field

from app.schemas.common import CamelModel
from app.schemas.hcp import ProductName


Sentiment = Literal["Positive", "Neutral", "Negative"]


class InteractionFields(CamelModel):
    sentiment: Sentiment | None = None
    objections: str | None = Field(None, max_length=5000)
    follow_up_date: date | None = None
    summary: str | None = Field(None, max_length=10000)
    follow_up_action: str | None = Field(None, max_length=2000)


class InteractionCreate(InteractionFields):
    hcp_id: int = Field(gt=0)
    channel: str = Field(min_length=1, max_length=80)
    products: list[ProductName] = Field(default_factory=list, max_length=50)
    notes: str = Field(min_length=1, max_length=20000)
    occurred_at: datetime | None = None


class InteractionUpdate(InteractionFields):
    channel: str | None = Field(None, min_length=1, max_length=80)
    products: list[ProductName] | None = Field(None, max_length=50)
    notes: str | None = Field(None, min_length=1, max_length=20000)
    occurred_at: datetime | None = None


class InteractionOut(InteractionCreate):
    id: int
    user_id: int
    occurred_at: datetime
    hcp_name: str
    hcp_specialty: str
    hcp_hospital: str
    created_at: datetime
    updated_at: datetime
