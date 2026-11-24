# SkillScan

Web app that parses a resume, retrieves relevant job descriptions via
embeddings (ChromaDB), and uses the Claude API for skill-gap analysis and
tailored bullet suggestions.

## Stack
- Backend: Python, FastAPI
- Embeddings: sentence-transformers; vector store: ChromaDB
- LLM: Claude API
- Frontend: custom dark "Terminal Radar" UI (see DESIGN.md)

## Rules
- Never fabricate experience in suggested bullets; only rephrase what the
  resume already says.
- LLM outputs must be structured JSON, validated with pydantic.
- API keys come from .env, never hard-coded or committed.
- Keep modules small: parser.py, retriever.py, analyzer.py, main.py
- Write a basic test for each module.
- Read DESIGN.md for all UI work. Build the UI against mock_data.json first.
- Commit after each working phase with a clear message.
- Privacy: never store or log uploaded resume text (no disk writes, no log
  lines, no error messages containing it). Process in memory only.
- Claude models come from .env: CLAUDE_MODEL for analysis, CLAUDE_MODEL_FAST
  (Haiku) for skill extraction.

## Data
- Seed ~40 realistic, varied job descriptions in backend/data/jobs.json.
- Keep job ingestion generic (backend/scripts/seed_jobs.py) so a Kaggle
  dataset can be loaded later by mapping its columns.

## Evaluation (Phase 10)
- eval/ holds ~10-15 labeled resume/JD pairs and a script that measures
  ranking agreement between retriever output and the labels.

## Deployment
- Before deploying, measure the memory footprint (sentence-transformers and
  torch are heavy) and confirm it fits the target host.

## Git
- Never add Co-Authored-By, Claude-Session or "Generated with Claude" lines to
  commit messages or PR descriptions.
