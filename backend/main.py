"""FastAPI entrypoint: API routes plus static frontend."""
import json

from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles

from backend.config import FRONTEND_DIR, ROOT

app = FastAPI(title="SkillScan")


@app.get("/api/health")
def health() -> dict:
    return {"status": "ok"}


@app.get("/api/mock")
def mock() -> dict:
    """Serve mock_data.json so the UI can run before the pipeline exists."""
    return json.loads((ROOT / "mock_data.json").read_text(encoding="utf-8"))


# Mounted last so /api routes take precedence.
if FRONTEND_DIR.exists():
    app.mount("/", StaticFiles(directory=FRONTEND_DIR, html=True), name="frontend")
