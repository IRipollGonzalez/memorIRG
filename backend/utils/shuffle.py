"""Pure shuffle helper — returns a new list, never mutates the input."""
from __future__ import annotations

import random

from backend.domain.models import FlashcardRecord


def shuffle_cards(cards: list[FlashcardRecord]) -> list[FlashcardRecord]:
    shuffled = list(cards)
    random.shuffle(shuffled)
    return shuffled
