"""Orchestrates topic discovery and detail lookup for the API layer."""
from __future__ import annotations

from backend.domain.models import Topic
from backend.repositories import topics_repository
from backend.utils.text import filename_to_label


def list_topic_names() -> list[tuple[str, str]]:
    """(name, label) pairs, without parsing each CSV — cheap for the sidebar list."""
    return [(name, filename_to_label(name)) for name in topics_repository.list_topic_files()]


def get_topic(name: str) -> Topic:
    return topics_repository.load_topic(name)
