#!/bin/bash
# One-time (or after dependency changes), per machine: creates .venv-desktop/
# with only runtime deps + PyInstaller — kept separate from the dev venv so
# pytest/dev tooling never leaks into the bundle.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
VENV_DIR="$PROJECT_ROOT/.venv-desktop"

echo ""
echo "=== MemorIRG — Build Venv Setup ==="
echo ""

PYTHON_VERSION=$(python3 -c 'import sys; print(f"{sys.version_info.major}.{sys.version_info.minor}")')
PYTHON_MAJOR=$(echo "$PYTHON_VERSION" | cut -d. -f1)
PYTHON_MINOR=$(echo "$PYTHON_VERSION" | cut -d. -f2)
if [[ $PYTHON_MAJOR -lt 3 ]] || { [[ $PYTHON_MAJOR -eq 3 ]] && [[ $PYTHON_MINOR -lt 11 ]]; }; then
    echo "ERROR: Python >= 3.11 required (found $PYTHON_VERSION)."
    exit 1
fi
if ! command -v node >/dev/null 2>&1; then
    echo "ERROR: Node.js not found — required to build the frontend."
    exit 1
fi

if [ -d "$VENV_DIR" ]; then
    printf "WARNING: .venv-desktop/ already exists. Recreate? [y/N] "
    read -r response
    if [[ "$response" != "y" && "$response" != "Y" ]]; then
        echo "Aborted."
        exit 0
    fi
    rm -rf "$VENV_DIR"
fi

echo "[1/3] Creating virtual environment..."
python3 -m venv "$VENV_DIR"
# shellcheck disable=SC1090
source "$VENV_DIR/bin/activate"
pip install --upgrade pip --quiet
echo ""

echo "[2/3] Installing dependencies..."
if ! pip install "fastapi>=0.115.0" "uvicorn[standard]>=0.30.0" "pydantic>=2.7.0" "python-dotenv>=1.0.0" pywebview pyinstaller --quiet; then
    echo "ERROR: Dependency installation failed."
    exit 1
fi
echo ""

echo "[3/3] Verifying installation..."
if ! python3 -c "import fastapi, webview, PyInstaller" 2>/dev/null; then
    echo "ERROR: Dependency verification failed."
    exit 1
fi
echo ""

echo "✓ Venv ready. Run 'npm --prefix frontend install && npm --prefix frontend run build', then ./build_desktop.sh."
echo ""
