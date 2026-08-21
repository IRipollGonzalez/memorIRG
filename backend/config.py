"""Loads MEMORIRG_* env vars via python-dotenv; every other module reads
config from here, never os.environ directly."""
from __future__ import annotations

import os
import sys
from pathlib import Path

from dotenv import load_dotenv

load_dotenv()

PROJECT_ROOT: Path = Path(__file__).parent.parent.resolve()

APP_NAME = "MemorIRG"


def _is_frozen() -> bool:
    return getattr(sys, "frozen", False)


def _default_data_dir() -> Path:
    """Packaged builds are read-only, so writes go to Application Support instead."""
    if _is_frozen():
        d = Path.home() / "Library" / "Application Support" / APP_NAME / "data"
    else:
        d = PROJECT_ROOT / "data"
    d.mkdir(parents=True, exist_ok=True)
    return d


DATA_DIR: Path = Path(os.getenv("MEMORIRG_DATA_DIR", str(_default_data_dir())))
DATA_DIR.mkdir(parents=True, exist_ok=True)

# Path to the built frontend, if it exists — presence (not an env var) decides
# whether backend.main mounts it, so dev and packaged mode share one codebase.
FRONTEND_DIST_DIR: Path = PROJECT_ROOT / "frontend" / "dist"
