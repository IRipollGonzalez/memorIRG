"""Pure string helpers — no I/O."""
from __future__ import annotations


def filename_to_label(name: str) -> str:
    return name.replace("_", " ").replace("-", " ").title()
