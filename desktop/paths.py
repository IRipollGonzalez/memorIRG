"""Centralized path resolution for MemorIRG desktop — dev vs frozen, in one
place. The packaged .app bundle is read-only, so every runtime write goes to
Application Support instead. Nothing else in desktop/ should compute a path
by hand — import from here.

Application Support is shared by APP_NAME alone, not by which source folder
built the app — never rm -rf app_support_dir() (or anything under it)
without inspecting its contents first; a different checkout of a
same-named project may own the real data there.
"""
from __future__ import annotations

import sys
from pathlib import Path

APP_NAME = "MemorIRG"


def is_frozen() -> bool:
    return getattr(sys, "frozen", False)


def app_support_dir() -> Path:
    d = Path.home() / "Library" / "Application Support" / APP_NAME
    d.mkdir(parents=True, exist_ok=True)
    return d


def data_dir() -> Path:
    """Packaged: App Support (writable). Dev: <project_root>/data/."""
    if is_frozen():
        d = app_support_dir() / "data"
        d.mkdir(parents=True, exist_ok=True)
        return d
    return project_root() / "data"


def bundled_data_dir() -> Path:
    """Read-only default CSVs bundled inside the .app (sys._MEIPASS/data/)."""
    if is_frozen():
        return Path(sys._MEIPASS) / "data"
    return project_root() / "data"


def logs_dir() -> Path:
    """Finder-launched apps discard stdout/stderr — file logging is the only debug channel."""
    d = app_support_dir() / "logs"
    d.mkdir(parents=True, exist_ok=True)
    return d


def project_root() -> Path:
    if is_frozen():
        return Path(sys._MEIPASS)
    return Path(__file__).parent.parent.resolve()


def frontend_dist_dir() -> Path:
    """Built React app — bundled into the frozen app, or <project_root>/frontend/dist/ in dev."""
    return project_root() / "frontend" / "dist"
