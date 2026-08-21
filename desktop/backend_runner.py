"""Builds the uvicorn server for backend.main:app and exposes run()/stop()
for app_window's background thread. Runs in-process (a thread, not a
subprocess) — uvicorn.Server.run() doesn't need to own the main thread the
way pywebview's NSApplication.run() does, so there's no second process and
no mode-dispatch env var to re-invoke this binary under.

run() executes in its own background thread (started via threading.Thread,
not joined) — an uncaught exception there would otherwise vanish silently,
since a packaged .app has no visible stderr. Every exception is logged here.
"""
from __future__ import annotations

import uvicorn

_server: uvicorn.Server | None = None


def run(port: int) -> None:
    global _server
    from desktop.logging_setup import setup_logging
    log = setup_logging("backend")
    try:
        from desktop.data_init import ensure_default_data
        ensure_default_data()

        from backend.main import app

        config = uvicorn.Config(app, host="127.0.0.1", port=port, log_level="info")
        _server = uvicorn.Server(config)
        _server.run()  # blocks this thread until stop() sets should_exit
    except Exception:
        log.exception("Backend server thread crashed")


def stop() -> None:
    if _server is not None:
        _server.should_exit = True
