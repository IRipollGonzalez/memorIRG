"""First run / portability: the app starts from a neutral seed and never ships user data."""
from __future__ import annotations

import json
import zipfile
from pathlib import Path

import pytest
from fastapi.testclient import TestClient
from irg_core import AppPaths

from backend.config import IDENTITY, SEED_DIR
from backend.startup import prepare_data_folder


@pytest.fixture
def paths(tmp_path: Path) -> AppPaths:
    return AppPaths(slug=IDENTITY.slug, app_dir=tmp_path / "MemorIRG")


def test_seed_is_neutral_and_valid(monkeypatch) -> None:
    from backend.repositories import topics_repository

    monkeypatch.setattr(topics_repository, "DATA_DIR", SEED_DIR)
    topics_repository._cache.clear()
    assert sorted(topics_repository.list_topic_files()) == ["example"]
    assert len(topics_repository.load_topic("example").cards) == 6


def test_first_run_seeds_once_and_never_again(paths: AppPaths) -> None:
    assert prepare_data_folder(paths) == ["example.csv"]
    assert (paths.data_dir / "example.csv").exists()
    (paths.data_dir / "example.csv").unlink()  # the user deletes the sample deck
    (paths.data_dir / "mine.csv").write_text("category,subcategory,a,b\nx,y,1,2\n")
    assert prepare_data_folder(paths) == []
    assert not (paths.data_dir / "example.csv").exists()
    assert (paths.data_dir / "mine.csv").read_text().startswith("category")


def test_decks_are_snapshotted_daily(paths: AppPaths) -> None:
    prepare_data_folder(paths)
    prepare_data_folder(paths)
    snapshots = list(paths.backups_dir.glob("*.zip"))
    assert len(snapshots) == 1
    assert "example.csv" in zipfile.ZipFile(snapshots[0]).namelist()


def test_repo_data_dir_is_not_the_runtime_data_dir() -> None:
    from backend.config import DATA_DIR, PROJECT_ROOT

    assert PROJECT_ROOT not in DATA_DIR.parents


def test_summary_is_published_and_served(monkeypatch, tmp_path: Path) -> None:
    from backend.repositories import topics_repository

    (tmp_path / "decks").mkdir()
    (tmp_path / "decks" / "one.csv").write_text("category,subcategory,en,es\na,b,dog,perro\na,b,cat,gato\n")
    (tmp_path / "decks" / "broken.csv").write_text("only_one_column\nx\n")
    monkeypatch.setattr(topics_repository, "DATA_DIR", tmp_path / "decks")
    topics_repository._cache.clear()

    from backend import main

    monkeypatch.setattr(main, "prepare_data_folder", lambda _paths: [])
    with TestClient(main.app) as client:
        body = client.get("/summary").json()
    kpis = {k["key"]: k for k in body["kpis"]}
    assert body["app"]["slug"] == "memorirg" and body["schema_version"] == 1
    assert kpis["decks"]["value"] == 1 and kpis["cards"]["value"] == 2
    assert kpis["unreadable_decks"]["value"] == 1 and kpis["unreadable_decks"]["status"] == "warn"
    assert json.loads(main.PATHS.summary_file.read_text())["kpis"][0]["key"] == "decks"
