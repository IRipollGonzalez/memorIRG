"""Owns the pywebview window and the backend thread's lifecycle.

Startup order matters on macOS: the window must be created (Step 1) before
any blocking work, or Finder-launched apps get a bouncing Dock icon and
silently exit before NSApplication.run() (webview.start()) is reached.
The FastAPI backend starts in a background thread (not a subprocess — see
backend_runner.py); the window navigates to it once it's ready.
webview.start() must be the last call on the main thread.
"""
from __future__ import annotations

import logging
import socket
import sys
import threading
import time

import webview

log = logging.getLogger("memorirg.app_window")

# Colors below are copy-synced from frontend/src/styles/theme.css's :root /
# dark-mode blocks (--bg, --text, --text-muted, --accent, --accent-foreground)
# — this loading screen has no access to the app's own CSS, so keep these
# two in sync by hand if the palette changes.
_LOADING_HTML = """\
<!DOCTYPE html>
<html><head><meta charset="utf-8"><style>
* { margin: 0; padding: 0; box-sizing: border-box; }
:root { --bg: #f5f0e6; --fg: #2b2318; --muted: #7a6f5d; --accent: #b1502c; --accent-fg: #fff8f2; }
@media (prefers-color-scheme: dark) {
  :root { --bg: #1c1712; --fg: #f0e9dc; --muted: #a89a84; --accent: #e0895a; --accent-fg: #241207; }
}
body { background: var(--bg); color: var(--fg);
       font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, sans-serif;
       display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; }
.mark { width: 56px; height: 56px; border-radius: 14px; background: var(--accent); color: var(--accent-fg);
        display: flex; align-items: center; justify-content: center;
        font-size: 24px; font-weight: 600; margin-bottom: 20px;
        animation: breathe 1.8s ease-in-out infinite; }
.title { font-size: 1.05rem; font-weight: 600; letter-spacing: -0.01em; }
.sub { font-size: 0.8rem; color: var(--muted); margin-top: 6px; }
@keyframes breathe { 0%, 100% { opacity: 1; } 50% { opacity: 0.55; } }
@media (prefers-reduced-motion: reduce) { .mark { animation: none; } }
</style></head><body>
<div class="mark">M</div>
<div class="title">MemorIRG</div>
<div class="sub">Starting up…</div>
</body></html>"""

_ERROR_HTML = """\
<!DOCTYPE html>
<html><head><meta charset="utf-8"><style>
* { margin: 0; padding: 0; box-sizing: border-box; }
:root { --bg: #f5f0e6; --fg: #2b2318; --muted: #7a6f5d; --accent: #b1502c; --accent-fg: #fff8f2; }
@media (prefers-color-scheme: dark) {
  :root { --bg: #1c1712; --fg: #f0e9dc; --muted: #a89a84; --accent: #e0895a; --accent-fg: #241207; }
}
body { background: var(--bg); color: var(--fg);
       font-family: -apple-system, BlinkMacSystemFont, sans-serif;
       display: flex; flex-direction: column; align-items: center; justify-content: center;
       height: 100vh; padding: 2rem; text-align: center; }
.mark { width: 56px; height: 56px; border-radius: 14px; background: var(--accent); color: var(--accent-fg);
        display: flex; align-items: center; justify-content: center;
        font-size: 22px; font-weight: 600; margin-bottom: 20px; }
h1 { font-size: 1.05rem; font-weight: 600; margin-bottom: 0.6rem; }
p { color: var(--muted); font-size: 0.82rem; line-height: 1.6; max-width: 360px; }
code { background: color-mix(in srgb, var(--accent) 12%, var(--bg)); padding: 0.15em 0.45em; border-radius: 6px; font-size: 0.78rem; }
</style></head><body>
<div class="mark">!</div>
<h1>Could not start MemorIRG</h1>
<p>The backend did not become ready in time.<br><br>
Check logs at<br><code>~/Library/Application Support/MemorIRG/logs/</code></p>
</body></html>"""


def _find_free_port() -> int:
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.bind(("127.0.0.1", 0))
        return s.getsockname()[1]


def _wait_for_server(port: int, timeout: float = 30.0) -> bool:
    deadline = time.monotonic() + timeout
    while time.monotonic() < deadline:
        try:
            with socket.create_connection(("127.0.0.1", port), timeout=1.0):
                return True
        except OSError:
            time.sleep(0.25)
    return False


def run() -> None:
    """Launch the native desktop window. MUST run on the main thread."""
    from desktop.logging_setup import setup_logging

    global log
    log = setup_logging("app")
    log.info("=== MemorIRG desktop starting ===")
    log.info("frozen=%s executable=%s", getattr(sys, "frozen", False), sys.executable)

    port = _find_free_port()
    log.info("Allocated port: %d", port)

    # Step 1: window with loading screen, before any blocking work.
    window = webview.create_window(
        title="MemorIRG", html=_LOADING_HTML,
        width=1100, height=760, min_size=(700, 500),
        text_select=False, zoomable=False,
    )

    # Step 2: backend startup in a background thread (in-process, not a subprocess).
    def _start_in_background() -> None:
        try:
            from desktop import backend_runner
            threading.Thread(target=backend_runner.run, args=(port,), daemon=True).start()

            if not _wait_for_server(port, timeout=30.0):
                log.error("Backend did not become ready within timeout")
                window.load_html(_ERROR_HTML)
                return

            url = f"http://127.0.0.1:{port}"
            log.info("Backend ready — navigating window to %s", url)
            window.load_url(url)
        except Exception:
            log.exception("Background startup thread raised an exception")
            window.load_html(_ERROR_HTML)

    threading.Thread(target=_start_in_background, daemon=True).start()

    # Step 3: last call on the main thread — blocks until the window closes.
    webview.start(debug=False, private_mode=False)

    # Step 4: signal the uvicorn server to shut down.
    from desktop import backend_runner
    backend_runner.stop()

    log.info("=== MemorIRG desktop shutdown complete ===")
