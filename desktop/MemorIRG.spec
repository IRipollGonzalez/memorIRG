# -*- mode: python ; coding: utf-8 -*-
# MemorIRG.spec: the whole build lives in irg_core.build.spec.make_spec.
# Build with:  source .venv-desktop/bin/activate && ./build_desktop.sh
import os
import sys
from pathlib import Path

ROOT = Path(SPECPATH).parent  # noqa: F821 (SPECPATH is injected by PyInstaller)
sys.path.insert(0, str(ROOT))

from backend.config import IDENTITY  # noqa: E402
from irg_core.build.spec import make_spec  # noqa: E402

make_spec(
    identity=IDENTITY,
    root=ROOT,
    packages=["backend"],
    # Read-only resources only. "data" and "backend" are refused on purpose.
    resources={"frontend/dist": "frontend/dist", "seed": "seed"},
    arch=os.environ.get("IRG_ARCH", "arm64"),
)
