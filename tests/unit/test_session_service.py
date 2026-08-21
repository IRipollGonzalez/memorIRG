from __future__ import annotations

import pytest

from backend.domain.exceptions import InvalidSideSelectionError, NoCardsMatchFilterError, SessionNotFoundError
from backend.services import session_service


def _create(sample_cards):
    return session_service.create_session("Animals", ["english", "spanish"], sample_cards, "english", "spanish")


def test_create_session_shuffles_and_starts_at_zero(sample_cards) -> None:
    session = _create(sample_cards)
    assert session.current_index == 0
    assert not session.is_flipped
    assert {c.card_id for c in session.shuffled_cards} == {c.card_id for c in sample_cards}


def test_create_session_rejects_empty_deck() -> None:
    with pytest.raises(NoCardsMatchFilterError):
        session_service.create_session("Animals", ["english", "spanish"], [], "english", "spanish")


def test_create_session_rejects_identical_sides(sample_cards) -> None:
    with pytest.raises(InvalidSideSelectionError):
        session_service.create_session("Animals", ["english", "spanish"], sample_cards, "english", "english")


def test_flip_toggles_is_flipped(sample_cards) -> None:
    session = _create(sample_cards)
    flipped = session_service.flip_card(session.session_id)
    assert flipped.is_flipped
    unflipped = session_service.flip_card(session.session_id)
    assert not unflipped.is_flipped


def test_navigation_resets_flip_and_respects_bounds(sample_cards) -> None:
    session = _create(sample_cards)
    session_service.flip_card(session.session_id)

    advanced = session_service.go_next(session.session_id)
    assert advanced.current_index == 1
    assert not advanced.is_flipped

    for _ in range(5):
        advanced = session_service.go_next(session.session_id)
    assert advanced.completed
    assert advanced.current_index == 3  # clamped, never exceeds total_cards

    back = session_service.go_previous(session.session_id)
    assert back.current_index == 2
    assert not back.completed


def test_unknown_session_raises() -> None:
    with pytest.raises(SessionNotFoundError):
        session_service.get_session("does-not-exist")
