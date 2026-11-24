/* Wires the two screens together (mock data only in Phase 2). */
(function () {
  const { clear, buildUpload, buildDashboard, loadResults } = window.SS;
  const upload = document.getElementById("screen-upload");
  const dash = document.getElementById("screen-dash");

  function showUpload() {
    clear(dash);
    dash.classList.add("hidden");
    upload.classList.remove("hidden");
    clear(upload);
    buildUpload(upload, showResults);
  }

  async function showResults() {
    try {
      const data = await loadResults();
      upload.classList.add("hidden");
      dash.classList.remove("hidden");
      buildDashboard(dash, data, showUpload);
    } catch (e) {
      showUpload();
    }
  }

  showUpload();
})();
