from __future__ import annotations

from pydantic import BaseModel


class SessionCreateRequest(BaseModel):
    topic: str
    category: str | None = None
    subcategory: str | None = None
    side_1: str
    side_2: str


class CardResponse(BaseModel):
    card_id: str
    side_1_value: str
    side_2_value: str


class SessionStateResponse(BaseModel):
    session_id: str
    topic_label: str
    side_1: str
    side_2: str
    current_card: CardResponse | None
    is_flipped: bool
    current_index: int
    total_cards: int
    completed: bool
    can_go_previous: bool
    can_go_next: bool
