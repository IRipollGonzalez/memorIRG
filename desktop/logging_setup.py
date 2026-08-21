"""Rotating file logger for MemorIRG desktop.

Call as the FIRST action in each mode, before any import that might fail,
so startup failures are captured on disk — packaged apps have no visible
terminal. Files: ~/Library/Application Support/MemorIRG/logs/<name>.log
(2MB per file, 3 backups).
"""
from __future__ import annotations

import logging
import logging.handlers
import sys
from pathlib import Path


def setup_logging(name: str, logs_path: Path | None = None) -> logging.Logger:
    if logs_path is None:
        from desktop.paths import logs_dir
        logs_path = logs_dir()

    logger = logging.getLogger(f"memorirg.{name}")
    logger.setLevel(logging.DEBUG)

    if logger.handlers:
        return logger

    fmt = logging.Formatter(
        "%(asctime)s %(levelname)-8s [%(name)s] %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S",
    )

    fh = logging.handlers.RotatingFileHandler(
        logs_path / f"{name}.log", maxBytes=2 * 1024 * 1024, backupCount=3, encoding="utf-8",
    )
    fh.setFormatter(fmt)
    logger.addHandler(fh)

    if not getattr(sys, "frozen", False):
        ch = logging.StreamHandler(sys.stderr)
        ch.setFormatter(fmt)
        logger.addHandler(ch)

    return logger
