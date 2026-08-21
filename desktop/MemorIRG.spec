# -*- mode: python ; coding: utf-8 -*-
# MemorIRG.spec — PyInstaller build spec
#
# Build from project root with .venv-desktop active, after `npm --prefix frontend run build`:
#   source .venv-desktop/bin/activate
#   ./build_desktop.sh   (runs the frontend build, then: pyinstaller desktop/MemorIRG.spec --clean)
#
# Output: dist/MemorIRG.app
# Entry point: desktop/launcher.py (single process — see desktop-packaging.md)
# User data: ~/Library/Application Support/MemorIRG/data/
# Logs:      ~/Library/Application Support/MemorIRG/logs/

from PyInstaller.utils.hooks import collect_submodules, copy_metadata

block_cipher = None

package_metadata = [
    *copy_metadata("fastapi"),
    *copy_metadata("uvicorn"),
    *copy_metadata("pydantic"),
    *copy_metadata("python-dotenv"),
]

datas = [
    *package_metadata,
    ("../backend", "backend"),
    ("../data", "data"),
    ("../frontend/dist", "frontend/dist"),
]

hidden_imports = [
    *collect_submodules("uvicorn"),
    "fastapi", "starlette", "pydantic", "pydantic_core",
    "dotenv",
    "webview", "webview.platforms", "webview.platforms.cocoa",
    "webview.http", "webview.event", "webview.window",
    "webview.dom", "webview.menu", "webview.screen",
    "desktop", "desktop.launcher", "desktop.paths",
    "desktop.logging_setup", "desktop.backend_runner", "desktop.app_window", "desktop.data_init",
    "backend", "backend.main", "backend.config",
    "backend.domain", "backend.domain.models", "backend.domain.exceptions", "backend.domain.validators",
    "backend.schemas", "backend.schemas.topics", "backend.schemas.sessions",
    "backend.repositories", "backend.repositories.topics_repository", "backend.repositories.session_store",
    "backend.services", "backend.services.topic_service", "backend.services.deck_service", "backend.services.session_service",
    "backend.api", "backend.api.topics", "backend.api.sessions",
    "backend.utils", "backend.utils.text", "backend.utils.shuffle",
]

a = Analysis(
    ["launcher.py"],
    pathex=[".."],
    binaries=[],
    datas=datas,
    hiddenimports=hidden_imports,
    hookspath=[],
    hooksconfig={},
    runtime_hooks=[],
    excludes=["pytest", "_pytest"],
    win_no_prefer_redirects=False,
    win_private_assemblies=False,
    cipher=block_cipher,
    noarchive=False,
)

pyz = PYZ(a.pure, a.zipped_data, cipher=block_cipher)

exe = EXE(
    pyz, a.scripts, [],
    exclude_binaries=True,
    name="MemorIRG",
    debug=False,
    bootloader_ignore_signals=False,
    strip=False,
    upx=False,
    console=False,
    disable_windowed_traceback=False,
    argv_emulation=False,
    target_arch=None,
    codesign_identity=None,
    entitlements_file=None,
    icon="../assets/icon.icns",
)

coll = COLLECT(
    exe, a.binaries, a.zipfiles, a.datas,
    strip=False, upx=False, upx_exclude=[],
    name="MemorIRG",
)

app = BUNDLE(
    coll,
    name="MemorIRG.app",
    icon="../assets/icon.icns",
    bundle_identifier="com.memorirg.app",
    info_plist={
        "CFBundleName": "MemorIRG",
        "CFBundleDisplayName": "MemorIRG",
        "CFBundleShortVersionString": "1.0.0",
        "CFBundleVersion": "1",
        "NSHighResolutionCapable": True,
        "LSMinimumSystemVersion": "12.0",
        "NSAppTransportSecurity": {"NSAllowsLocalNetworking": True},
        "LSUIElement": False,
    },
)
