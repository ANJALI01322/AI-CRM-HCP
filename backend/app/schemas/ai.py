from datetime import date
from typing import Literal

from pydantic import Field

from app.schemas.common import CamelModel


class ExtractRequest(CamelModel):
    notes: str = Field(min_length=1, max_length=8000)


class InteractionDraftOut(CamelModel):
    hcp_name: str | None
    hospital: str | None
    products: list[str]
    sentiment: Literal["positive", "neutral", "negative"]
    objections: list[str]
    follow_up_date: date | None
    summary: str


class HCPCandidate(CamelModel):
    id: int
    name: str
    hospital: str
    specialty: str
    score: float


class HCPMatch(CamelModel):
    hcp_id: int | None
    confident: bool
    candidates: list[HCPCandidate]


class ExtractResponse(CamelModel):
    draft: InteractionDraftOut
    match: HCPMatch
    model: str
    latency_ms: int
    attempts: int
