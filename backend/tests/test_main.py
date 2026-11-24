from fastapi.testclient import TestClient

from backend.main import app

client = TestClient(app)


def test_health():
    r = client.get("/api/health")
    assert r.status_code == 200
    assert r.json() == {"status": "ok"}


def test_mock_matches_design_format():
    data = client.get("/api/mock").json()
    assert data["resume_skills"]
    m = data["matches"][0]
    for key in ("job_id", "title", "company", "score", "matched_skills", "missing_skills", "bullets"):
        assert key in m
    assert 0 <= m["score"] <= 100


def test_mock_has_varied_scores_and_valid_importance():
    matches = client.get("/api/mock").json()["matches"]
    scores = [m["score"] for m in matches]
    assert 6 <= len(matches) <= 8
    assert min(scores) <= 35 and max(scores) >= 90
    assert any(len(m["missing_skills"]) >= 5 for m in matches)
    for m in matches:
        for g in m["missing_skills"]:
            assert g["importance"] in {"high", "medium", "low"}


def test_frontend_assets_are_served():
    import re

    html = client.get("/").text
    assert "SKILLSCAN" in html.upper()
    for path in re.findall(r'(?:src|href)="((?:js|css|vendor)/[^"]+)"', html):
        assert client.get("/" + path).status_code == 200, path


def test_mock_diff_phrases_exist_in_texts():
    """The diff view highlights by phrase, so every phrase must occur in its text."""
    data = client.get("/api/mock").json()
    resume = data["resume_text"].lower()
    assert resume
    for m in data["matches"]:
        jd = m["jd_text"].lower()
        for pair in m["diff"]["matched"]:
            assert pair["resume"].lower() in resume, (m["job_id"], pair)
            assert pair["jd"].lower() in jd, (m["job_id"], pair)
        for phrase in m["diff"]["missing"]:
            assert phrase.lower() in jd, (m["job_id"], phrase)
        # every missing skill is underlined on the JD side
        missing = {p.lower() for p in m["diff"]["missing"]}
        assert {g["skill"].lower() for g in m["missing_skills"]} <= missing, m["job_id"]


def test_mock_bullets_reword_existing_resume_lines():
    data = client.get("/api/mock").json()
    resume = data["resume_text"]
    for m in data["matches"]:
        for b in m["bullets"]:
            assert b["original"] in resume, b["original"]
