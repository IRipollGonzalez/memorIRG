"""Filters a topic's cards by the selected category/subcategory."""
from __future__ import annotations

from backend.domain.models import FlashcardRecord


def filter_cards(
    cards: list[FlashcardRecord],
    category: str | None,
    subcategory: str | None,
) -> list[FlashcardRecord]:
    filtered = cards
    if category:
        filtered = [card for card in filtered if card.category == category]
    if subcategory:
        filtered = [card for card in filtered if card.subcategory == subcategory]
    return filtered
