/* Upload screen. In Phase 2 nothing is read or sent: the pipeline log is simulated. */
(function () {
  const { el, clear, reducedMotion } = window.SS;

  const STEPS = [
    "parsing resume",
    "extracting skills",
    "embedding resume vector",
    "querying job index",
    "ranking matches",
    "analysing skill gaps",
  ];

  function build(root, onDone) {
    let mode = "resume";
    let picked = false;

    const title = el("h1", { id: "up-title", text: "Scan your resume against real jobs" });
    const lede = el("p", { class: "lede", text: "Drop a resume to rank job matches and see the skill gaps. Demo mode uses mock data and reads nothing." });

    const tabResume = el("button", { class: "tab", role: "tab", "aria-selected": "true", text: "Resume" });
    const tabJd = el("button", { class: "tab", role: "tab", "aria-selected": "false", text: "Paste job description" });
    const tabs = el("div", { class: "tabs", role: "tablist" }, [tabResume, tabJd]);

    const prompt = el("div", { class: "prompt", text: "> drop resume.pdf here or click to browse" });
    const hint = el("div", { class: "hint", text: "PDF or DOCX · processed in memory only" });
    const input = el("input", { type: "file", accept: ".pdf,.docx,.txt" });
    const zone = el("label", { class: "dropzone", tabindex: "0" }, [prompt, hint, input]);

    const jd = el("textarea", { class: "jd hidden", placeholder: "Paste a job description...", "aria-label": "Job description" });

    const run = el("button", { class: "btn", text: "Run scan" });
    const demo = el("button", { class: "btn ghost", text: "Use sample data", style: "margin-left:8px" });
    const log = el("div", { class: "log panel hidden", "aria-live": "polite" });

    function refresh() {
      run.disabled = mode === "resume" ? !picked : !jd.value.trim();
    }
    function setMode(m) {
      mode = m;
      tabResume.setAttribute("aria-selected", String(m === "resume"));
      tabJd.setAttribute("aria-selected", String(m === "jd"));
      zone.classList.toggle("hidden", m !== "resume");
      jd.classList.toggle("hidden", m !== "jd");
      refresh();
    }
    tabResume.addEventListener("click", () => setMode("resume"));
    tabJd.addEventListener("click", () => setMode("jd"));
    jd.addEventListener("input", refresh);

    function pick(file) {
      picked = !!file;
      prompt.textContent = file ? "> file loaded" : "> drop resume.pdf here or click to browse";
      refresh();
    }
    input.addEventListener("change", () => pick(input.files[0]));
    zone.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); input.click(); } });
    ["dragenter", "dragover"].forEach((t) => zone.addEventListener(t, (e) => { e.preventDefault(); zone.classList.add("over"); }));
    ["dragleave", "drop"].forEach((t) => zone.addEventListener(t, (e) => { e.preventDefault(); zone.classList.remove("over"); }));
    zone.addEventListener("drop", (e) => pick(e.dataTransfer.files[0]));

    async function start() {
      run.disabled = demo.disabled = true;
      clear(log).classList.remove("hidden");
      const delay = reducedMotion() ? 0 : 420;
      for (const step of STEPS) {
        const line = el("div", { class: "line", text: `$ ${step}...` });
        log.append(line);
        await new Promise((r) => setTimeout(r, delay));
        line.className = "line done";
        line.replaceChildren(`$ ${step}... `, el("span", { class: "ok", text: "ok" }));
      }
      await new Promise((r) => setTimeout(r, delay));
      onDone();
    }
    run.addEventListener("click", start);
    demo.addEventListener("click", start);

    root.append(
      el("div", { class: "label" }, ["[ ", el("b", { text: "INPUT" }), " ]"]),
      title, lede, tabs, zone, jd, el("div", {}, [run, demo]), log
    );
    setMode("resume");
  }

  function reset(root) {
    clear(root);
  }

  window.SS = Object.assign(window.SS || {}, { buildUpload: build, resetUpload: reset });
})();
