from __future__ import annotations

from fastapi import APIRouter

from backend.domain.models import StudySession
from backend.schemas.sessions import CardResponse, SessionCreateRequest, SessionStateResponse
from backend.services import deck_service, session_service, topic_service

router = APIRouter()


def _to_response(session: StudySession) -> SessionStateResponse:
    card = session.current_card
    return SessionStateResponse(
        session_id=session.session_id,
        topic_label=session.topic_label,
        side_1=session.side_1,
        side_2=session.side_2,
        current_card=CardResponse(
            card_id=card.card_id,
            side_1_value=card.values[session.side_1],
            side_2_value=card.values[session.side_2],
        )
        if card
        else None,
        is_flipped=session.is_flipped,
        current_index=session.current_index,
        total_cards=session.total_cards,
        completed=session.completed,
        can_go_previous=session.can_go_previous,
        can_go_next=session.can_go_next,
    )


@router.post("", response_model=SessionStateResponse)
def create_session(body: SessionCreateRequest) -> SessionStateResponse:
    topic = topic_service.get_topic(body.topic)
    cards = deck_service.filter_cards(topic.cards, body.category, body.subcategory)
    session = session_service.create_session(topic.label, topic.content_labels, cards, body.side_1, body.side_2)
    return _to_response(session)


@router.post("/{session_id}/flip", response_model=SessionStateResponse)
def flip(session_id: str) -> SessionStateResponse:
    return _to_response(session_service.flip_card(session_id))


@router.post("/{session_id}/next", response_model=SessionStateResponse)
def next_card(session_id: str) -> SessionStateResponse:
    return _to_response(session_service.go_next(session_id))


@router.post("/{session_id}/previous", response_model=SessionStateResponse)
def previous_card(session_id: str) -> SessionStateResponse:
    return _to_response(session_service.go_previous(session_id))
