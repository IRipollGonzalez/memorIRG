from __future__ import annotations

from backend.services import deck_service


def test_filter_by_category(sample_cards) -> None:
    result = deck_service.filter_cards(sample_cards, "animals", None)
    assert {c.card_id for c in result} == {"1", "2"}


def test_filter_by_category_and_subcategory(sample_cards) -> None:
    result = deck_service.filter_cards(sample_cards, "animals", "farm")
    assert {c.card_id for c in result} == {"1"}


def test_no_filters_returns_all(sample_cards) -> None:
    result = deck_service.filter_cards(sample_cards, None, None)
    assert result == sample_cards
