/* Resume vs JD split pane. Matched phrases: green on both sides. Missing: red underline on the JD side. */
(function () {
  const { el } = window.SS;

  function escapeRe(s) { return s.replace(/[.*+?^${}()|[\]\\\/]/g, "\\$&"); }

  /** Split `text` into text nodes and <mark>s. specs: [{phrase, cls, pair}]. Longest phrase wins on overlap. */
  function highlight(text, specs) {
    const hits = [];
    for (const s of specs) {
      const re = new RegExp(`(?<![\\w+#])${escapeRe(s.phrase)}(?![\\w+#])`, "gi");
      for (const m of text.matchAll(re)) hits.push({ start: m.index, end: m.index + m[0].length, s });
    }
    hits.sort((a, b) => a.start - b.start || (b.end - b.start) - (a.end - a.start));
    const out = [];
    let pos = 0;
    for (const h of hits) {
      if (h.start < pos) continue;
      if (h.start > pos) out.push(text.slice(pos, h.start));
      out.push(el("mark", {
        class: h.s.cls, "data-pair": h.s.pair == null ? null : String(h.s.pair),
        tabindex: h.s.pair == null ? null : "0",
      }, [text.slice(h.start, h.end)]));
      pos = h.end;
    }
    if (pos < text.length) out.push(text.slice(pos));
    return out;
  }

  function pane(title, text, specs, id) {
    return el("div", { class: "diff-pane" }, [
      el("div", { class: "label diff-head", id }, [title]),
      el("pre", { class: "diff-text", tabindex: "0", "aria-labelledby": id }, highlight(text, specs)),
    ]);
  }

  /** Hovering or focusing a matched phrase lights up its counterpart on the other side. */
  function linkPairs(root) {
    const set = (target, on) => {
      const pair = target.dataset && target.dataset.pair;
      if (pair == null) return;
      root.querySelectorAll(`mark[data-pair="${pair}"]`).forEach((n) => n.classList.toggle("linked", on));
    };
    root.addEventListener("mouseover", (e) => set(e.target, true));
    root.addEventListener("mouseout", (e) => set(e.target, false));
    root.addEventListener("focusin", (e) => set(e.target, true));
    root.addEventListener("focusout", (e) => set(e.target, false));
  }

  function build(resumeText, m) {
    const matched = m.diff.matched;
    const resumeSpecs = matched.map((p, i) => ({ phrase: p.resume, cls: "hit", pair: i }));
    const jdSpecs = matched.map((p, i) => ({ phrase: p.jd, cls: "hit", pair: i }))
      .concat(m.diff.missing.map((phrase) => ({ phrase, cls: "miss" })));

    const root = el("div", { class: "diff panel" }, [
      el("div", { class: "diff-bar" }, [
        el("div", { class: "label" }, ["[ ", el("b", { text: "RESUME vs JOB" }), " ]"]),
        el("div", { class: "diff-key" }, [
          el("span", { class: "key hit", text: "matched" }),
          el("span", { class: "key miss", text: "missing from resume" }),
        ]),
      ]),
      el("div", { class: "diff-split" }, [
        pane("YOUR RESUME", resumeText, resumeSpecs, "diff-h-resume"),
        pane(`JOB: ${m.title}`, m.jd_text, jdSpecs, "diff-h-jd"),
      ]),
    ]);
    linkPairs(root);
    return root;
  }

  window.SS = Object.assign(window.SS || {}, { buildDiff: build });
})();
