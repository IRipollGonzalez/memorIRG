from __future__ import annotations

import pytest

from backend.domain.models import FlashcardRecord


@pytest.fixture
def sample_cards() -> list[FlashcardRecord]:
    return [
        FlashcardRecord(
            card_id="1", category="animals", subcategory="farm",
            values={"english": "dog", "spanish": "perro"},
        ),
        FlashcardRecord(
            card_id="2", category="animals", subcategory="wild",
            values={"english": "lion", "spanish": "leon"},
        ),
        FlashcardRecord(
            card_id="3", category="colors", subcategory=None,
            values={"english": "red", "spanish": "rojo"},
        ),
    ]
