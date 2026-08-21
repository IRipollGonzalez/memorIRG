"""FastAPI entry point: mounts API routers, and — only when frontend/dist/
exists — serves the built frontend as static files with an SPA fallback.
Branches on file presence, not an env var, so dev and packaged mode share
this identical codebase."""
from __future__ import annotations

from fastapi import FastAPI
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from starlette.requests import Request

from backend.api import sessions, topics
from backend.config import FRONTEND_DIST_DIR
from backend.domain.exceptions import (
    InvalidSideSelectionError,
    InvalidTopicDataError,
    NoCardsMatchFilterError,
    SessionNotFoundError,
    TopicNotFoundError,
)

app = FastAPI(title="MemorIRG")

app.include_router(topics.router, prefix="/api/topics", tags=["topics"])
app.include_router(sessions.router, prefix="/api/sessions", tags=["sessions"])


@app.exception_handler(TopicNotFoundError)
async def _topic_not_found(request: Request, exc: TopicNotFoundError) -> JSONResponse:
    return JSONResponse(status_code=404, content={"detail": str(exc)})


@app.exception_handler(SessionNotFoundError)
async def _session_not_found(request: Request, exc: SessionNotFoundError) -> JSONResponse:
    return JSONResponse(status_code=404, content={"detail": str(exc)})


@app.exception_handler(InvalidTopicDataError)
async def _invalid_topic(request: Request, exc: InvalidTopicDataError) -> JSONResponse:
    return JSONResponse(status_code=422, content={"detail": str(exc)})


@app.exception_handler(NoCardsMatchFilterError)
async def _no_cards_match(request: Request, exc: NoCardsMatchFilterError) -> JSONResponse:
    return JSONResponse(status_code=422, content={"detail": str(exc)})


@app.exception_handler(InvalidSideSelectionError)
async def _invalid_sides(request: Request, exc: InvalidSideSelectionError) -> JSONResponse:
    return JSONResponse(status_code=400, content={"detail": str(exc)})


if FRONTEND_DIST_DIR.exists():
    app.mount("/assets", StaticFiles(directory=FRONTEND_DIST_DIR / "assets"), name="assets")

    @app.get("/{full_path:path}")
    async def spa_fallback(full_path: str, request: Request) -> FileResponse:
        """Any non-/api path serves index.html — React Router owns client-side routes."""
        candidate = FRONTEND_DIST_DIR / full_path
        if full_path and candidate.is_file():
            return FileResponse(candidate)
        return FileResponse(FRONTEND_DIST_DIR / "index.html")
