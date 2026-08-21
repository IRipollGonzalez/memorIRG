"""First-launch only: copies the bundled default CSVs into App Support's
data/ dir if it's empty. Never touches it again once any file exists there —
CSV is the app's only data store, and this must never overwrite a user's
own decks. See CLAUDE.md's 'First-launch data copy is additive-only' note.
"""
from __future__ import annotations

import shutil

from desktop.paths import bundled_data_dir, data_dir, is_frozen


def ensure_default_data() -> None:
    if not is_frozen():
        return

    target = data_dir()
    if any(target.glob("*.csv")):
        return

    source = bundled_data_dir()
    for csv_file in source.glob("*.csv"):
        shutil.copy(csv_file, target / csv_file.name)
