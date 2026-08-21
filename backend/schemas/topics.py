from __future__ import annotations

from pydantic import BaseModel


class TopicSummary(BaseModel):
    name: str
    label: str


class CategorySubcategoryPair(BaseModel):
    category: str | None
    subcategory: str | None


class TopicDetail(BaseModel):
    name: str
    label: str
    content_labels: list[str]
    category_subcategory_pairs: list[CategorySubcategoryPair]
    total_cards: int
