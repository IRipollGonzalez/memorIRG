"""Reads and cleans CSV files from DATA_DIR into Topic domain objects.
CSV is the only data store for this app — see CLAUDE.md's 'CSV as the only
data store' note. The cleaning pipeline (UTF-8 with latin-1 fallback,
lowercased column names, stripped cells, dropped blank/duplicate rows)
exists because these files are hand-edited in spreadsheet tools, not
machine-generated. Parsed topics are cached by (path, mtime) so repeat
requests within a session don't re-parse an unchanged file.
"""
from __future__ import annotations

import csv
import io
import uuid
from pathlib import Path

from backend.config import DATA_DIR
from backend.domain.exceptions import InvalidTopicDataError, TopicNotFoundError
from backend.domain.models import RESERVED_METADATA_COLUMNS, FlashcardRecord, Topic
from backend.domain.validators import validate_min_content_columns
from backend.utils.text import filename_to_label

_cache: dict[Path, tuple[float, Topic]] = {}


def list_topic_files() -> dict[str, Path]:
    return {p.stem: p for p in sorted(DATA_DIR.glob("*.csv"))}


def _read_rows(path: Path) -> list[dict[str, str]]:
    raw = path.read_bytes()
    try:
        text = raw.decode("utf-8")
    except UnicodeDecodeError:
        text = raw.decode("latin-1")

    reader = csv.DictReader(io.StringIO(text))
    if reader.fieldnames is None:
        raise InvalidTopicDataError(f"{path.name} has no header row")

    rows: list[dict[str, str]] = []
    seen: set[tuple[tuple[str, str], ...]] = set()
    for row in reader:
        cleaned = {(key or "").strip().lower(): (value or "").strip() for key, value in row.items()}
        if not any(cleaned.values()):
            continue
        fingerprint = tuple(sorted(cleaned.items()))
        if fingerprint in seen:
            continue
        seen.add(fingerprint)
        rows.append(cleaned)
    return rows


def load_topic(name: str) -> Topic:
    path = list_topic_files().get(name)
    if path is None:
        raise TopicNotFoundError(f"No topic named {name!r}")

    mtime = path.stat().st_mtime
    cached = _cache.get(path)
    if cached is not None and cached[0] == mtime:
        return cached[1]

    rows = _read_rows(path)
    if not rows:
        raise InvalidTopicDataError(f"{path.name} has no usable rows")

    header = list(rows[0].keys())
    content_labels = [column for column in header if column not in RESERVED_METADATA_COLUMNS]
    validate_min_content_columns(content_labels, path.name)

    cards = [
        FlashcardRecord(
            card_id=str(uuid.uuid4()),
            category=row.get("category") or None,
            subcategory=row.get("subcategory") or None,
            values={label: row[label] for label in content_labels},
        )
        for row in rows
    ]

    topic = Topic(name=name, label=filename_to_label(name), content_labels=content_labels, cards=cards)
    _cache[path] = (mtime, topic)
    return topic
