# SkillScan

See which skills your resume is missing for the jobs you want.

SkillScan parses a resume, retrieves relevant job descriptions with embeddings,
and shows skill gaps and tailored bullet suggestions in a dark "Terminal Radar" UI.

## Status

**The UI is built and currently runs on mock data (`mock_data.json`).**
The backend (resume parsing, retrieval, Claude analysis) is in progress, so
nothing you upload is analysed yet. The "Use sample data" button loads the mock results.

- [x] Phase 1: project scaffold (FastAPI app, config, tests)
- [x] Phase 2: dark UI: upload screen, ranked job cards, match rings, GAPS / MATCHED / BULLETS tabs
- [x] Phase 3: skill radar, resume vs JD diff, bullet rewriter (on mock data)
- [ ] Resume parser
- [ ] Job seed data and embedding retriever (ChromaDB)
- [ ] Claude skill-gap analysis and bullet suggestions
- [ ] Connect the UI to the real backend
- [ ] Evaluation against labeled resume/JD pairs
- [ ] Deployment

## Planned features

Shown in the UI today (with mock data):

- **Match score ring**: a 0-100 score per job, colour-coded green / amber / red.
- **Skill radar chart**: your skills against the skills the selected job requires.
- **Resume vs JD diff**: matched phrases highlighted on both sides, missing requirements underlined in red on the job side.
- **Bullet rewriter**: original vs suggested bullet, with copy and accept/reject.

Still to come: wiring all of the above to real data from the backend.

**Rule for suggestions:** suggested bullets only reword content that is already
on your resume. They never invent experience.

## Tech stack

- Python, FastAPI
- sentence-transformers (embeddings) and ChromaDB (vector store)
- Claude API (skill-gap analysis and bullet suggestions)
- Plain HTML/CSS/JS with Chart.js (vendored in `frontend/vendor/`)

## Setup (Windows)

```powershell
git clone <repo-url> SkillScan
cd SkillScan
python -m venv .venv
.venv\Scripts\Activate.ps1
pip install -r requirements.txt
copy .env.example .env
```

Open `.env` and add your API key (`ANTHROPIC_API_KEY`). Then start the server:

```powershell
uvicorn backend.main:app --reload
```

Open http://127.0.0.1:8000 and click "Use sample data".

Run the tests with `pytest`.

## Privacy

Uploaded resumes are processed in memory and are never stored or logged.

## Screenshots

_Coming soon. Images will go in `docs/screenshots/`._
