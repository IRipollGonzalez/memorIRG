"""Dataclasses shared by every layer. category/subcategory are reserved
column names, matched case-insensitively after normalization — every other
CSV column becomes a content label."""
from __future__ import annotations

import dataclasses

RESERVED_METADATA_COLUMNS = {"category", "subcategory"}
MIN_CONTENT_COLUMNS = 2


@dataclasses.dataclass(frozen=True)
class FlashcardRecord:
    card_id: str
    category: str | None
    subcategory: str | None
    values: dict[str, str]


@dataclasses.dataclass(frozen=True)
class Topic:
    name: str
    label: str
    content_labels: list[str]
    cards: list[FlashcardRecord]

    @property
    def category_subcategory_pairs(self) -> list[tuple[str | None, str | None]]:
        pairs = dict.fromkeys((card.category, card.subcategory) for card in self.cards)
        return list(pairs)


@dataclasses.dataclass(frozen=True)
class StudySession:
    session_id: str
    topic_label: str
    side_1: str
    side_2: str
    shuffled_cards: list[FlashcardRecord]
    current_index: int = 0
    is_flipped: bool = False

    @property
    def total_cards(self) -> int:
        return len(self.shuffled_cards)

    @property
    def completed(self) -> bool:
        return self.current_index >= self.total_cards

    @property
    def current_card(self) -> FlashcardRecord | None:
        return None if self.completed else self.shuffled_cards[self.current_index]

    @property
    def can_go_previous(self) -> bool:
        return self.current_index > 0

    @property
    def can_go_next(self) -> bool:
        return not self.completed
