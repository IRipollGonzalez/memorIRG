"""PyInstaller entry point for MemorIRG desktop. One process: the
background thread (started by app_window.run()) runs the FastAPI backend
via uvicorn, the main thread runs pywebview. No mode dispatch needed —
unlike the old Streamlit packaging model, nothing re-invokes this binary.
"""
from __future__ import annotations

import sys


def main() -> None:
    from desktop.app_window import run
    run()


if __name__ == "__main__":
    if not getattr(sys, "frozen", False):
        # Dev mode: put the project root on sys.path so `desktop.*`/`backend.*` imports resolve.
        # A frozen build already has sys._MEIPASS on sys.path.
        import pathlib
        _root = str(pathlib.Path(__file__).parent.parent.resolve())
        if _root not in sys.path:
            sys.path.insert(0, _root)

    main()
