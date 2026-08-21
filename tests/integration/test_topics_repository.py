from __future__ import annotations

import shutil
from pathlib import Path

import pytest

from backend.domain.exceptions import InvalidTopicDataError, TopicNotFoundError

FIXTURES = Path(__file__).parent.parent / "fixtures"


@pytest.fixture
def repo(monkeypatch, tmp_path):
    for csv_file in FIXTURES.glob("*.csv"):
        shutil.copy(csv_file, tmp_path / csv_file.name)

    monkeypatch.setattr("backend.repositories.topics_repository.DATA_DIR", tmp_path)
    from backend.repositories import topics_repository

    topics_repository._cache.clear()
    return topics_repository


def test_load_topic_cleans_rows(repo) -> None:
    topic = repo.load_topic("sample_topic")
    assert topic.label == "Sample Topic"
    assert topic.content_labels == ["english", "spanish"]
    # blank row dropped, exact-duplicate "lion" row dropped
    assert len(topic.cards) == 3
    values = {card.values["english"] for card in topic.cards}
    assert values == {"dog", "lion", "red"}


def test_load_topic_caches_until_mtime_changes(repo, tmp_path) -> None:
    first = repo.load_topic("sample_topic")
    second = repo.load_topic("sample_topic")
    assert first is second

    path = tmp_path / "sample_topic.csv"
    path.write_text(path.read_text() + "colors,,blue,azul\n")
    import time

    time.sleep(0.01)
    path.touch()
    third = repo.load_topic("sample_topic")
    assert third is not first


def test_missing_topic_raises(repo) -> None:
    with pytest.raises(TopicNotFoundError):
        repo.load_topic("does-not-exist")


def test_too_few_content_columns_raises(repo) -> None:
    with pytest.raises(InvalidTopicDataError):
        repo.load_topic("too_few_columns")
