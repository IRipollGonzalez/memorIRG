"""Single source of truth for app identity and locations. Every other module reads
config from here. User data lives in Application Support (via irg_core), never in the
repo or the bundle; ``data/`` in the repo is only the public content library that the
static GitHub Pages build is generated from."""
from __future__ import annotations

from pathlib import Path

from irg_core import AppIdentity, Branding, resolve_paths

from backend import __version__

PROJECT_ROOT: Path = Path(__file__).parent.parent.resolve()

IDENTITY = AppIdentity(
    name="MemorIRG",
    slug="memorirg",
    bundle_id="com.memorirg.app",
    env_prefix="MEMORIRG",
    version=__version__,
    default_port=8101,
    branding=Branding(mark="M"),
)

# Pure resolution: nothing is created until prepare_data_folder() runs at startup.
PATHS = resolve_paths(IDENTITY)

# The user's decks: ~/Library/Application Support/MemorIRG[-dev]/data/*.csv
DATA_DIR: Path = PATHS.data_dir

# Neutral starter content, the only "data" the app bundle ships (read-only).
SEED_DIR: Path = PROJECT_ROOT / "seed"

# Path to the built frontend, if it exists — presence (not an env var) decides
# whether backend.main mounts it, so dev and packaged mode share one codebase.
FRONTEND_DIST_DIR: Path = PROJECT_ROOT / "frontend" / "dist"
