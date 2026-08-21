"""Creates and transitions StudySession instances. Every transition returns
a new instance via dataclasses.replace() rather than mutating in place —
see CLAUDE.md's 'Immutable session state' note. The deck is shuffled once
at creation and never re-shuffled, so 'previous' always retraces the same
order."""
from __future__ import annotations

import dataclasses
import uuid

from backend.domain.exceptions import NoCardsMatchFilterError, SessionNotFoundError
from backend.domain.models import FlashcardRecord, StudySession
from backend.domain.validators import validate_distinct_sides, validate_sides_are_content_labels
from backend.repositories import session_store
from backend.utils.shuffle import shuffle_cards


def create_session(
    topic_label: str,
    content_labels: list[str],
    cards: list[FlashcardRecord],
    side_1: str,
    side_2: str,
) -> StudySession:
    validate_sides_are_content_labels(side_1, side_2, content_labels)
    validate_distinct_sides(side_1, side_2)
    if not cards:
        raise NoCardsMatchFilterError("No cards match the selected filters")

    session = StudySession(
        session_id=str(uuid.uuid4()),
        topic_label=topic_label,
        side_1=side_1,
        side_2=side_2,
        shuffled_cards=shuffle_cards(cards),
    )
    session_store.save(session)
    return session


def get_session(session_id: str) -> StudySession:
    session = session_store.get(session_id)
    if session is None:
        raise SessionNotFoundError(f"No session {session_id!r}")
    return session


def flip_card(session_id: str) -> StudySession:
    current = get_session(session_id)
    session = dataclasses.replace(current, is_flipped=not current.is_flipped)
    session_store.save(session)
    return session


def go_next(session_id: str) -> StudySession:
    session = get_session(session_id)
    if session.can_go_next:
        session = dataclasses.replace(session, current_index=session.current_index + 1, is_flipped=False)
        session_store.save(session)
    return session


def go_previous(session_id: str) -> StudySession:
    session = get_session(session_id)
    if session.can_go_previous:
        session = dataclasses.replace(session, current_index=session.current_index - 1, is_flipped=False)
        session_store.save(session)
    return session
