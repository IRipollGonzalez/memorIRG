"""Regenerates frontend/src/data/topics.json from data/*.csv, for the
static (GitHub Pages) build only — the desktop/dev app reads CSVs at
request time through the backend instead. Reuses topics_repository's
parsing/cleaning so the static build behaves identically to the backend.
"""
from __future__ import annotations

import dataclasses
import json
import sys
from pathlib import Path

PROJECT_ROOT = Path(__file__).parent.parent
sys.path.insert(0, str(PROJECT_ROOT))

from backend.repositories import topics_repository  # noqa: E402

OUTPUT = PROJECT_ROOT / "frontend" / "src" / "data" / "topics.json"


def main() -> None:
    topics = [dataclasses.asdict(topics_repository.load_topic(name)) for name in topics_repository.list_topic_files()]
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT.write_text(json.dumps(topics, ensure_ascii=False, indent=2) + "\n")
    print(f"Wrote {len(topics)} topics to {OUTPUT.relative_to(PROJECT_ROOT)}")


if __name__ == "__main__":
    main()
