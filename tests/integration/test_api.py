from __future__ import annotations

import shutil
from pathlib import Path

import pytest
from fastapi.testclient import TestClient

FIXTURES = Path(__file__).parent.parent / "fixtures"


@pytest.fixture
def client(monkeypatch, tmp_path):
    shutil.copy(FIXTURES / "sample_topic.csv", tmp_path / "sample_topic.csv")
    monkeypatch.setattr("backend.repositories.topics_repository.DATA_DIR", tmp_path)

    from backend.repositories import session_store, topics_repository

    topics_repository._cache.clear()
    session_store._sessions.clear()

    from backend.main import app

    return TestClient(app)


def test_list_topics(client) -> None:
    response = client.get("/api/topics")
    assert response.status_code == 200
    assert response.json() == [{"name": "sample_topic", "label": "Sample Topic"}]


def test_get_topic_detail(client) -> None:
    response = client.get("/api/topics/sample_topic")
    assert response.status_code == 200
    body = response.json()
    assert body["content_labels"] == ["english", "spanish"]
    assert body["total_cards"] == 3
    assert {"category": "animals", "subcategory": "farm"} in body["category_subcategory_pairs"]


def test_get_unknown_topic_returns_404(client) -> None:
    response = client.get("/api/topics/nope")
    assert response.status_code == 404


def test_full_session_flow(client) -> None:
    create = client.post(
        "/api/sessions",
        json={"topic": "sample_topic", "category": None, "subcategory": None, "side_1": "english", "side_2": "spanish"},
    )
    assert create.status_code == 200
    session = create.json()
    assert session["total_cards"] == 3
    assert session["current_index"] == 0
    session_id = session["session_id"]

    flipped = client.post(f"/api/sessions/{session_id}/flip").json()
    assert flipped["is_flipped"] is True

    advanced = client.post(f"/api/sessions/{session_id}/next").json()
    assert advanced["current_index"] == 1
    assert advanced["is_flipped"] is False


def test_session_with_filter_that_matches_nothing_returns_422(client) -> None:
    response = client.post(
        "/api/sessions",
        json={"topic": "sample_topic", "category": "does-not-exist", "subcategory": None, "side_1": "english", "side_2": "spanish"},
    )
    assert response.status_code == 422


def test_session_with_identical_sides_returns_400(client) -> None:
    response = client.post(
        "/api/sessions",
        json={"topic": "sample_topic", "category": None, "subcategory": None, "side_1": "english", "side_2": "english"},
    )
    assert response.status_code == 400
