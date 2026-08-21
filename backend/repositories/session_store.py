"""In-memory session store, keyed by session_id. Ephemeral by design —
sessions don't survive a backend restart, matching the app's original
'closing the app loses the current session' behavior."""
from __future__ import annotations

from backend.domain.models import StudySession

_sessions: dict[str, StudySession] = {}


def save(session: StudySession) -> None:
    _sessions[session.session_id] = session


def get(session_id: str) -> StudySession | None:
    return _sessions.get(session_id)
