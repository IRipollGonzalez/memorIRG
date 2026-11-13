"""PyInstaller entry point for MemorIRG. Everything else lives in irg_core."""
from __future__ import annotations

import sys


def main() -> int:
    from irg_core.runmode import run

    from backend.config import IDENTITY
    from backend.main import app

    return run(IDENTITY, app)


if __name__ == "__main__":
    if not getattr(sys, "frozen", False):
        # Dev mode: put the project root on sys.path so `backend.*` imports resolve.
        import pathlib

        sys.path.insert(0, str(pathlib.Path(__file__).parent.parent.resolve()))
    sys.exit(main())
