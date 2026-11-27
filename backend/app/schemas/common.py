from typing import Generic, TypeVar

from pydantic import BaseModel, ConfigDict
from pydantic.alias_generators import to_camel

T = TypeVar("T")

MAX_PAGE_SIZE = 100


class CamelModel(BaseModel):
    """JSON uses camelCase (matches the frontend); Python uses snake_case."""

    model_config = ConfigDict(
        alias_generator=to_camel,
        validate_by_name=True,
        validate_by_alias=True,
        serialize_by_alias=True,
        from_attributes=True,
        str_strip_whitespace=True,
    )


class Page(CamelModel, Generic[T]):
    items: list[T]
    total: int
    limit: int
    offset: int
