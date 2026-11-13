from __future__ import annotations

import os
import tempfile

# Before any backend import: tests must never touch the real Application Support folders.
os.environ["IRG_DATA_DIR"] = os.path.join(tempfile.mkdtemp(prefix="memorirg-test-"), "app")

import pytest  # noqa: E402

from backend.domain.models import FlashcardRecord  # noqa: E402


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
