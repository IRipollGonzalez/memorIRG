"""PyInstaller entry point for MemorIRG. Everything else lives in irg_core."""
from __future__ import annotations

import sys


def main() -> int:
    from irg_core.runmode import run

    from backend.config import IDENTITY

    # Given as an import string: the app is imported in the background thread, after the
    # window exists, so a slow import (or a macOS dialog) never delays the window.
    return run(IDENTITY, "backend.main:app")


if __name__ == "__main__":
    if not getattr(sys, "frozen", False):
        # Dev mode: put the project root on sys.path so `backend.*` imports resolve.
        import pathlib

        sys.path.insert(0, str(pathlib.Path(__file__).parent.parent.resolve()))
    sys.exit(main())
