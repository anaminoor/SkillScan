# SkillScan Design: "Terminal Radar"

Dark, techy, mission-control feel.

## Palette (CSS variables)
--bg: #0a0e14
--surface: #11161f
--border: #1f2733
--text: #c9d1d9
--text-dim: #6b7685
--accent: #00ff9c   (matched / success)
--warn: #ffb454     (partial match)
--danger: #ff5370   (missing skill)
--info: #4dabf7

## Typography
- Headings, numbers, labels: JetBrains Mono or IBM Plex Mono
- Body: Inter

## Style rules
- 1px borders, no heavy shadows
- Faint grid/scanline background at very low opacity
- Glow only on active or important elements
- Small uppercase letter-spaced labels like [ SKILL GAP ]
- Purposeful animation (typing log, ring fill); respect prefers-reduced-motion

## Screens
1. Upload: terminal-style drop zone + "paste job description" tab. After
   upload, stream real pipeline steps as a log.
2. Results dashboard: left = ranked job cards with match ring (0-100);
   center = skill radar chart (Chart.js); right = tabs GAPS / MATCHED / BULLETS.
3. Diff view: resume vs JD split pane, matched phrases green, missing
   requirements underlined red.
4. Bullet rewriter: original (dim) vs suggested (bright), copy button,
   accept/reject, label [ REWORDED FROM YOUR RESUME ].

## Mock data format (mock_data.json)
{
  "resume_skills": ["Python", "PyTorch", "SQL", "Git"],
  "matches": [
    {
      "job_id": "j_101",
      "title": "ML Engineer Intern",
      "company": "Acme AI",
      "score": 78,
      "matched_skills": ["Python", "PyTorch", "Git"],
      "missing_skills": [
        { "skill": "Docker", "importance": "high",
          "suggestion": "Containerize one of your projects" }
      ],
      "bullets": [
        { "original": "Built an image classifier using PyTorch",
          "suggested": "Developed and trained a PyTorch image classifier ...",
          "reason": "Aligns with the job's emphasis on model training" }
      ]
    }
  ]
}