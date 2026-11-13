#!/bin/bash
# MemorIRG: the real script is shared (irg_core). Needs the build venv active.
set -euo pipefail
cd "$(dirname "$0")"
export IRG_APP_NAME="MemorIRG"
export IRG_SPEC="desktop/MemorIRG.spec"
exec bash "$(irg-build template build_desktop.sh)"
