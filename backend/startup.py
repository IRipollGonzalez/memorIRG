"""Startup wiring for the user's data folder: create it, seed it once, snapshot the decks.

Kept out of config.py (which must stay free of side effects) and out of services/ (which
must not know about irg_core)."""
from __future__ import annotations

from irg_core import AppPaths
from irg_core.backup import snapshot_on_startup
from irg_core.first_run import FirstRun

from backend.config import SEED_DIR


def prepare_data_folder(paths: AppPaths) -> list[str]:
    """Returns the seeded file names (empty after the first run)."""
    paths.ensure()
    seeded = FirstRun(paths).ensure_seed(SEED_DIR)
    snapshot_on_startup(paths.data_dir, paths, patterns=["*.csv"])
    return seeded
