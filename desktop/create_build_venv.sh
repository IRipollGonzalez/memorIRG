#!/bin/bash
# MemorIRG build venv. The shared logic is the irg_core template of the same name.
cd "$(dirname "$0")/.."
export IRG_APP_NAME="MemorIRG"
# One-time per machine: creates the build venv (.venv-desktop, or ~/.venvs/<App>-desktop inside iCloud) with the app's runtime deps (from
# pyproject.toml, so the list can never drift) plus pywebview, PyInstaller and irg_core[build].
# irg_core comes from requirements-irg.txt (or IRG_CORE_SRC="/path/to/irg_core" / "git+ssh://...@v0.1.0").
set -euo pipefail

: "${IRG_APP_NAME:?IRG_APP_NAME is required}"
ROOT="$(pwd)"

echo "=== ${IRG_APP_NAME} — Build Venv Setup ==="
python3 -c 'import sys; sys.exit(0 if sys.version_info >= (3, 11) else 1)' \
    || { echo "ERROR: Python >= 3.11 required."; exit 1; }

# Never create the venv inside iCloud Drive: iCloud flags its files "hidden" and Python
# silently skips hidden .pth files, which breaks every editable install (irg_core, the app).
if [[ "$ROOT" == *"Mobile Documents"* ]]; then
    VENV="${IRG_VENV_DIR:-$HOME/.venvs/${IRG_APP_NAME}-desktop}"
    echo "NOTE: project is in iCloud Drive; build venv goes to ${VENV}"
else
    VENV="${IRG_VENV_DIR:-$ROOT/.venv-desktop}"
fi
if [ -d "$VENV" ]; then
    echo "Removing existing $VENV"
    rm -rf "$VENV"
fi
mkdir -p "$(dirname "$VENV")"
python3 -m venv "$VENV"
# shellcheck disable=SC1091
source "$VENV/bin/activate"
pip install --quiet --upgrade pip

# irg_core first: it is NOT in the app's pyproject (CI builds of the static site must not
# need it, and a bare name on the default index would invite dependency confusion).
if [ -f requirements-irg.txt ]; then
    pip install --quiet -r requirements-irg.txt
elif [ -n "${IRG_CORE_SRC:-}" ]; then
    pip install --quiet "${IRG_CORE_SRC}[server,desktop,keychain,build]"
else
    echo "ERROR: no requirements-irg.txt and IRG_CORE_SRC is not set: cannot install irg_core."
    exit 1
fi
pip install --quiet -e "$ROOT"
pip install --quiet pywebview pyinstaller

python3 - <<'PY'
import importlib
for name in ("fastapi", "uvicorn", "webview", "PyInstaller", "irg_core"):
    importlib.import_module(name)
print("build venv OK")
PY
echo "Next: source \"$VENV/bin/activate\" && ./build_desktop.sh"
