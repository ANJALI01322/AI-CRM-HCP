from typing import Literal

from pydantic import Field

from app.schemas.common import CamelModel

Role = Literal["rep", "manager"]


class LoginRequest(CamelModel):
    email: str = Field(min_length=3, max_length=254, pattern=r"^[^@\s]+@[^@\s]+\.[^@\s]+$")
    password: str = Field(min_length=1, max_length=128)


class UserOut(CamelModel):
    id: int
    full_name: str
    email: str
    role: Role
    org_id: int
    org_name: str


class TokenOut(CamelModel):
    access_token: str
    token_type: Literal["bearer"] = "bearer"
    expires_in: int
    user: UserOut
