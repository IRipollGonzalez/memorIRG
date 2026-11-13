"""FastAPI entry point: mounts API routers, and — only when frontend/dist/
exists — serves the built frontend as static files with an SPA fallback.
Branches on file presence, not an env var, so dev and packaged mode share
this identical codebase."""
from __future__ import annotations

from collections.abc import AsyncIterator, Awaitable, Callable
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.responses import FileResponse, JSONResponse, Response
from fastapi.staticfiles import StaticFiles
from irg_core.summary import AppRef, AppSummary, Kpi, SummaryPublisher, summary_router
from irg_core.util import utcnow
from starlette.requests import Request

from backend.api import sessions, topics
from backend.config import FRONTEND_DIST_DIR, IDENTITY, PATHS
from backend.domain.exceptions import (
    InvalidSideSelectionError,
    InvalidTopicDataError,
    NoCardsMatchFilterError,
    SessionNotFoundError,
    TopicNotFoundError,
)
from backend.services import summary_service
from backend.startup import prepare_data_folder


def build_summary() -> AppSummary:
    stats = summary_service.collect_stats()
    return AppSummary(
        app=AppRef(slug=IDENTITY.slug, name=IDENTITY.name, version=IDENTITY.version),
        updated_at=utcnow(),
        kpis=[
            Kpi(key="decks", label="Decks", value=stats.decks, status="ok"),
            Kpi(key="cards", label="Cards", value=stats.cards, status="ok"),
            Kpi(
                key="unreadable_decks",
                label="Unreadable decks",
                value=stats.unreadable_decks,
                status="warn" if stats.unreadable_decks else "ok",
            ),
        ],
    )


publisher = SummaryPublisher(PATHS, build_summary)


@asynccontextmanager
async def lifespan(_: FastAPI) -> AsyncIterator[None]:
    prepare_data_folder(PATHS)
    publisher.publish_now()
    yield
    publisher.close()


app = FastAPI(title="MemorIRG", lifespan=lifespan)


@app.middleware("http")
async def _refresh_summary_when_decks_are_listed(
    request: Request, call_next: Callable[[Request], Awaitable[Response]]
) -> Response:
    # The sidebar lists decks on load: a cheap, natural moment to refresh the IRGhub summary
    # (CSV files are edited outside the app, so there is no "data changed" event to hook).
    response = await call_next(request)
    if request.method == "GET" and request.url.path == "/api/topics":
        publisher.notify_changed()
    return response


app.include_router(topics.router, prefix="/api/topics", tags=["topics"])
app.include_router(sessions.router, prefix="/api/sessions", tags=["sessions"])
app.include_router(summary_router(PATHS))


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
