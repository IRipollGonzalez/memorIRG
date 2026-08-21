from __future__ import annotations

import dataclasses

from backend.domain.models import StudySession


def test_category_subcategory_pairs_deduplicates(sample_cards) -> None:
    from backend.domain.models import Topic

    topic = Topic(name="animals", label="Animals", content_labels=["english", "spanish"], cards=sample_cards * 2)
    assert len(topic.category_subcategory_pairs) == 3


def test_session_progression_and_completion(sample_cards) -> None:
    session = StudySession(
        session_id="s1", topic_label="Animals", side_1="english", side_2="spanish",
        shuffled_cards=sample_cards,
    )
    assert session.total_cards == 3
    assert session.can_go_next
    assert not session.can_go_previous
    assert not session.completed

    last = dataclasses.replace(session, current_index=3)
    assert last.completed
    assert last.current_card is None
    assert last.can_go_previous
    assert not last.can_go_next
