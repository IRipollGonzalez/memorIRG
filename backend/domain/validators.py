"""Pure validation functions over domain objects — no I/O."""
from __future__ import annotations

from backend.domain.exceptions import InvalidSideSelectionError, InvalidTopicDataError
from backend.domain.models import MIN_CONTENT_COLUMNS


def validate_min_content_columns(content_labels: list[str], source_name: str) -> None:
    if len(content_labels) < MIN_CONTENT_COLUMNS:
        raise InvalidTopicDataError(
            f"{source_name} needs at least {MIN_CONTENT_COLUMNS} content columns, found {len(content_labels)}"
        )


def validate_distinct_sides(side_1: str, side_2: str) -> None:
    if side_1 == side_2:
        raise InvalidSideSelectionError("side_1 and side_2 must be different columns")


def validate_sides_are_content_labels(side_1: str, side_2: str, content_labels: list[str]) -> None:
    for side in (side_1, side_2):
        if side not in content_labels:
            raise InvalidSideSelectionError(f"{side!r} is not a content column for this topic")
