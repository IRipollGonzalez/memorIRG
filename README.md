# MemorIRG

A local-first flashcard app. Drop a CSV into `data/`, and every column that isn't `category`/`subcategory` becomes a possible card side — study world capitals, art history, vocabulary across three languages, or any other paired-fact list, without touching code.

**Play it on your phone: https://iripollgonzalez.github.io/memorIRG/**

Ships three ways from one codebase: a browser-based dev app, a native double-clickable macOS `.app` (pywebview + PyInstaller), and a static build on GitHub Pages with no backend at all — see [CLAUDE.md](CLAUDE.md) for how.

## Requirements

- Python ≥ 3.11
- Node.js (for the frontend)
- macOS 12 or later (for the desktop build)

## Running in dev mode

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -e ".[dev]"
uvicorn backend.main:app --reload --port 8000
```

In a second terminal:

```bash
npm --prefix frontend install
npm --prefix frontend run dev
```

Open the URL Vite prints (typically http://localhost:5173).

## Adding a topic

- **Dev / desktop app**: drop a `*.csv` file into `data/` and reload the page.
- **Phone / web app**: drop the CSV into `data/`, commit, and push to `main` — a GitHub Actions workflow rebuilds and redeploys the site automatically.

Either way: the filename becomes the topic name (`world_capitals.csv` → "World Capitals"). Columns named `category`/`subcategory` (case-insensitive) become filters; every other column becomes a possible card side. A topic needs at least 2 non-metadata columns.

A column named `*_image`, `*_youtube`, or `*_audio` renders as a picture, an embedded YouTube player, or an audio clip instead of plain text — see [CLAUDE.md](CLAUDE.md#image--youtube--audio-card-sides) for the exact convention. Note the repo is public, so anything dropped in `frontend/public/media/` gets published — link out (e.g. to YouTube) rather than hosting recordings/images you don't hold the rights to.

## Tests

```bash
pytest
npm --prefix frontend run test
```

## Building the native macOS app

```bash
./desktop/create_build_venv.sh      # one-time per machine
source .venv-desktop/bin/activate
./build_desktop.sh                  # → dist/MemorIRG.app
```

See [CLAUDE.md](CLAUDE.md) for the full architecture, the desktop packaging model, and key design decisions.
