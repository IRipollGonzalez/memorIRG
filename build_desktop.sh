#!/bin/bash
set -euo pipefail

PROJECT_ROOT="$(cd "$(dirname "$0")" && pwd)"
cd "$PROJECT_ROOT"

echo ""
echo "=== MemorIRG — Desktop Build ==="
echo ""

PYTHON_VERSION=$(python3 -c 'import sys; print(f"{sys.version_info.major}.{sys.version_info.minor}")')
PYTHON_MAJOR=$(echo "$PYTHON_VERSION" | cut -d. -f1)
PYTHON_MINOR=$(echo "$PYTHON_VERSION" | cut -d. -f2)
if [[ $PYTHON_MAJOR -lt 3 ]] || { [[ $PYTHON_MAJOR -eq 3 ]] && [[ $PYTHON_MINOR -lt 11 ]]; }; then
    echo "ERROR: Python >= 3.11 required (found $PYTHON_VERSION)."
    exit 1
fi
if [ ! -d ".venv-desktop" ]; then
    echo "ERROR: .venv-desktop/ not found. Run ./desktop/create_build_venv.sh first."
    exit 1
fi
if [[ "${VIRTUAL_ENV:-}" != *".venv-desktop"* ]]; then
    echo "ERROR: Build venv not active. Run: source .venv-desktop/bin/activate"
    exit 1
fi
if [ ! -f "assets/icon.icns" ]; then
    echo "ERROR: assets/icon.icns not found."
    exit 1
fi
if [ ! -f "desktop/MemorIRG.spec" ]; then
    echo "ERROR: desktop/MemorIRG.spec not found."
    exit 1
fi

echo "[1/5] Activating build venv..."
echo "      Python $PYTHON_VERSION | Venv: $VIRTUAL_ENV"
echo ""

echo "[2/5] Building frontend..."
if ! npm --prefix frontend run build; then
    echo "ERROR: Frontend build failed."
    exit 1
fi
if [ ! -f "frontend/dist/index.html" ]; then
    echo "ERROR: frontend/dist/index.html not found after build."
    exit 1
fi
echo ""

echo "[3/5] Cleaning previous build..."
rm -rf build/ dist/
echo ""

echo "[4/5] Running PyInstaller..."
if ! pyinstaller "desktop/MemorIRG.spec" --clean --noconfirm --log-level ERROR; then
    echo "ERROR: PyInstaller failed."
    exit 1
fi
echo ""

# Ad-hoc codesign to strip iCloud Drive extended attributes — this project
# lives under iCloud Drive, and synced xattrs break an otherwise-valid signature.
SIGN_TMP=$(mktemp -d)
trap 'rm -rf "$SIGN_TMP"' EXIT
ditto --noextattr --norsrc "dist/MemorIRG.app" "$SIGN_TMP/MemorIRG.app"
if codesign --force --deep --sign - "$SIGN_TMP/MemorIRG.app" 2>/dev/null; then
    rm -rf "dist/MemorIRG.app"
    ditto "$SIGN_TMP/MemorIRG.app" "dist/MemorIRG.app"
fi

echo "[5/5] Verifying output..."
if [ ! -d "dist/MemorIRG.app" ]; then
    echo "ERROR: dist/MemorIRG.app not found after build."
    exit 1
fi

APP_SIZE=$(du -sh "dist/MemorIRG.app" 2>/dev/null | cut -f1 || echo "unknown")
echo ""
echo "✓ Build complete: dist/MemorIRG.app (${APP_SIZE})"
echo "  Launch: open dist/MemorIRG.app"
echo "  Logs:   ~/Library/Application Support/MemorIRG/logs/"
echo ""
