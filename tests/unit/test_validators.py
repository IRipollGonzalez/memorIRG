from __future__ import annotations

import pytest

from backend.domain.exceptions import InvalidSideSelectionError, InvalidTopicDataError
from backend.domain.validators import (
    validate_distinct_sides,
    validate_min_content_columns,
    validate_sides_are_content_labels,
)


def test_min_content_columns_passes_with_enough_columns() -> None:
    validate_min_content_columns(["english", "spanish"], "languages.csv")


def test_min_content_columns_raises_with_too_few() -> None:
    with pytest.raises(InvalidTopicDataError):
        validate_min_content_columns(["english"], "languages.csv")


def test_distinct_sides_raises_when_equal() -> None:
    with pytest.raises(InvalidSideSelectionError):
        validate_distinct_sides("english", "english")


def test_distinct_sides_passes_when_different() -> None:
    validate_distinct_sides("english", "spanish")


def test_sides_must_be_content_labels() -> None:
    with pytest.raises(InvalidSideSelectionError):
        validate_sides_are_content_labels("english", "category", ["english", "spanish"])
