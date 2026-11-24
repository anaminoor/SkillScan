/* Data access. Phase 2: mock data only; the real backend is wired in later. */
(function () {
  async function loadResults() {
    const res = await fetch("/api/mock");
    if (!res.ok) throw new Error("Could not load mock data");
    const data = await res.json();
    data.matches.sort((a, b) => b.score - a.score);
    return data;
  }
  window.SS = Object.assign(window.SS || {}, { loadResults });
})();
