"""Deck statistics for the IRGhub summary (no irg_core imports: main.py maps them)."""
from __future__ import annotations

import dataclasses

from backend.domain.exceptions import InvalidTopicDataError
from backend.repositories import topics_repository


@dataclasses.dataclass(frozen=True)
class DeckStats:
    decks: int
    cards: int
    unreadable_decks: int


def collect_stats() -> DeckStats:
    names = list(topics_repository.list_topic_files())
    cards = 0
    unreadable = 0
    for name in names:
        try:
            cards += len(topics_repository.load_topic(name).cards)
        except InvalidTopicDataError:
            unreadable += 1
    return DeckStats(decks=len(names) - unreadable, cards=cards, unreadable_decks=unreadable)
