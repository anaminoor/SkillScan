/* Skill radar (Chart.js): your skills (green fill) vs the job's required skills (outline). */
(function () {
  const { el, reducedMotion } = window.SS;

  function css(name) {
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  }

  /** Axes = every skill the job asks for; matched ones first so the green shape is one wedge. */
  function axesFor(m) {
    const labels = [...m.matched_skills, ...m.missing_skills.map((g) => g.skill)];
    return { labels, mine: labels.map((_, i) => (i < m.matched_skills.length ? 100 : 0)) };
  }

  function build(m) {
    const canvas = el("canvas", { role: "img" });
    const wrap = el("div", { class: "radar-wrap" }, [canvas]);
    let chart = null;
    let matchedCount = 0;

    function options() {
      const grid = "rgba(201, 209, 217, 0.14)";
      return {
        responsive: true, maintainAspectRatio: false,
        animation: reducedMotion() ? false : { duration: 600 },
        layout: { padding: 4 },
        scales: {
          r: {
            min: 0, max: 100, ticks: { display: false, stepSize: 25 },
            grid: { color: grid }, angleLines: { color: grid },
            pointLabels: {
              font: { family: css("--font-mono"), size: 11 },
              color: (ctx) => (ctx.index < matchedCount ? css("--accent") : css("--danger")),
            },
          },
        },
        plugins: {
          legend: { position: "bottom", labels: { color: css("--text-label"), font: { family: css("--font-mono"), size: 11 }, boxWidth: 14, boxHeight: 8 } },
          tooltip: {
            backgroundColor: css("--surface"), borderColor: css("--border"), borderWidth: 1,
            titleFont: { family: css("--font-mono") }, bodyFont: { family: css("--font-mono") },
            callbacks: {
              label: (c) => (c.datasetIndex === 0 ? (c.raw ? "You have this" : "Missing from your resume") : "Required by this job"),
            },
          },
        },
      };
    }

    function datasets(m) {
      const { labels, mine } = axesFor(m);
      const accent = css("--accent");
      return {
        labels,
        datasets: [
          { label: "Your skills", data: mine, backgroundColor: "rgba(0, 255, 156, 0.22)", borderColor: accent, borderWidth: 2,
            pointBackgroundColor: accent, pointBorderColor: accent, pointRadius: 3 },
          { label: "Job requires", data: labels.map(() => 100), backgroundColor: "transparent", borderColor: css("--text"),
            borderWidth: 1.5, borderDash: [5, 4], pointRadius: 0, pointHoverRadius: 3 },
        ],
      };
    }

    function describe(m) {
      const total = m.matched_skills.length + m.missing_skills.length;
      canvas.setAttribute("aria-label",
        `Skill radar for ${m.title}: you cover ${m.matched_skills.length} of ${total} required skills.`);
    }

    function update(next) {
      matchedCount = next.matched_skills.length;
      describe(next);
      const d = datasets(next);
      if (!chart) {
        chart = new window.Chart(canvas, { type: "radar", data: d, options: options() });
      } else {
        chart.data = d;
        chart.update();
      }
    }

    update(m);
    return { node: wrap, update, destroy() { if (chart) chart.destroy(); chart = null; } };
  }

  window.SS = Object.assign(window.SS || {}, { buildRadar: build });
})();
