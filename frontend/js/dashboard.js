/* Results dashboard: ranked cards | overview | GAPS / MATCHED / BULLETS tabs. */
(function () {
  const { el, clear, ring, buildRadar, buildDiff, buildBullets } = window.SS;
  let activeRadar = null;

  const TABS = ["gaps", "matched", "bullets"];

  function verdict(score) {
    if (score >= 80) return "Strong match";
    if (score >= 60) return "Good match, a few gaps";
    if (score >= 45) return "Partial match";
    return "Weak match";
  }

  function build(root, data, onBack) {
    clear(root);
    if (activeRadar) activeRadar.destroy();
    let selected = 0;
    let tab = "gaps";
    const decisions = {};

    const cards = el("div", { class: "cards" });
    const overview = el("div", { class: "overview panel" });
    const detail = el("div", { class: "detail panel" });

    function buildCards() {
      data.matches.forEach((m, i) => {
        const card = el("button", {
          class: "card fade-in", style: `animation-delay:${i * 50}ms`,
          "aria-pressed": String(i === selected),
          onclick: () => { selected = i; render(); },
        }, [
          ring(m.score),
          el("div", {}, [
            el("div", { class: "rank", text: `#${String(i + 1).padStart(2, "0")}` }),
            el("div", { class: "title", text: m.title }),
            el("div", { class: "co", text: m.company }),
            el("div", { class: "meta" }, [
              el("span", { class: "m", text: `${m.matched_skills.length} matched` }), " · ",
              el("span", { class: "x", text: `${m.missing_skills.length} missing` }),
            ]),
          ]),
        ]);
        cards.append(card);
      });
    }
    function markSelected() {
      [...cards.children].forEach((c, i) => c.setAttribute("aria-pressed", String(i === selected)));
    }

    function renderOverview() {
      const m = data.matches[selected];
      const high = m.missing_skills.filter((s) => s.importance === "high").length;
      clear(overview).append(
        el("div", { class: "label" }, ["[ ", el("b", { text: "TARGET" }), " ]"]),
        el("div", { class: "head fade-in", style: "margin-top:12px" }, [
          ring(m.score, true),
          el("div", {}, [
            el("h2", { text: m.title }),
            el("div", { class: "co", text: m.company }),
            el("div", { class: "label verdict", text: verdict(m.score) }),
          ]),
        ]),
        el("div", { class: "stats" }, [
          el("div", { class: "stat ok" }, [el("div", { class: "n", text: m.matched_skills.length }), el("div", { class: "label", text: "Matched" })]),
          el("div", { class: "stat bad" }, [el("div", { class: "n", text: m.missing_skills.length }), el("div", { class: "label", text: "Missing" })]),
          el("div", { class: "stat warn" }, [el("div", { class: "n", text: high }), el("div", { class: "label", text: "Critical gaps" })]),
        ]),
        el("div", { class: "label", text: "[ YOUR SKILLS ]" }),
        el("div", { class: "skills" }, data.resume_skills.map((s) =>
          el("span", { class: `chip ${m.matched_skills.includes(s) ? "ok" : "dim"}`, text: s })
        )),
        el("div", { class: "legend", "aria-label": "Skill chip legend" }, [
          el("span", {}, [el("span", { class: "chip ok", text: "lit" }), " on this job's requirements"]),
          el("span", {}, [el("span", { class: "chip dim", text: "dim" }), " not asked for by this job"]),
        ])
      );
    }

    function panelGaps(m) {
      if (!m.missing_skills.length) return [el("div", { class: "empty", text: "No missing skills. Nice." })];
      return m.missing_skills.map((g) =>
        el("div", { class: `item gap-${g.importance} fade-in` }, [
          el("div", { class: "row" }, [
            el("span", { class: "name", text: g.skill }),
            el("span", { class: `imp ${g.importance}`, text: g.importance }),
          ]),
          el("p", { class: "sug", text: g.suggestion }),
        ])
      );
    }
    function panelMatched(m) {
      if (!m.matched_skills.length) return [el("div", { class: "empty", text: "No matched skills." })];
      return m.matched_skills.map((s) =>
        el("div", { class: "item matched-item fade-in" }, [el("span", { class: "name", text: s })])
      );
    }
    function panelBullets(m) { return buildBullets(m, decisions); }

    function renderDetail() {
      const m = data.matches[selected];
      const counts = { gaps: m.missing_skills.length, matched: m.matched_skills.length, bullets: m.bullets.length };
      const tabbar = el("div", { class: "tabs", role: "tablist" }, TABS.map((t) =>
        el("button", {
          class: "tab", role: "tab", id: `tab-${t}`, "aria-selected": String(t === tab), "aria-controls": "tabpanel",
          onclick: () => { tab = t; renderDetail(); },
          onkeydown: (e) => {
            const d = { ArrowRight: 1, ArrowLeft: -1 }[e.key];
            if (!d) return;
            tab = TABS[(TABS.indexOf(t) + d + TABS.length) % TABS.length];
            renderDetail();
            document.getElementById(`tab-${tab}`).focus();
          },
        }, [t.toUpperCase(), el("span", { class: "count", text: counts[t] })])
      ));
      const body = { gaps: panelGaps, matched: panelMatched, bullets: panelBullets }[tab](m);
      clear(detail).append(tabbar, el("div", { class: "tabpanel", id: "tabpanel", role: "tabpanel", "aria-labelledby": `tab-${tab}` }, body));
    }

    const radar = buildRadar(data.matches[0]);
    activeRadar = radar;
    const radarPanel = el("div", { class: "panel radar-panel" }, [
      el("div", { class: "label radar-head" }, ["[ ", el("b", { text: "SKILL RADAR" }), " ]"]),
      radar.node,
    ]);
    const diffSlot = el("div", { class: "diff-slot" });

    function renderDiff() {
      clear(diffSlot).append(buildDiff(data.resume_text, data.matches[selected]));
    }

    function render() {
      markSelected(); renderOverview(); renderDetail();
      radar.update(data.matches[selected]);
      renderDiff();
    }

    root.append(
      el("div", { class: "dash-bar" }, [
        el("div", { class: "label" }, ["[ ", el("b", { text: "RESULTS" }), ` ] ${data.matches.length} jobs ranked`]),
        el("button", { class: "btn new-scan", type: "button", text: "+ New scan", onclick: onBack }),
      ]),
      el("div", { class: "dash" }, [
        el("div", {}, [el("div", { class: "col-head label", text: "[ RANKED MATCHES ]" }), cards]),
        el("div", {}, [el("div", { class: "col-head label", text: "[ OVERVIEW ]" }), overview, radarPanel]),
        el("div", { class: "col-detail" }, [el("div", { class: "col-head label", text: "[ ANALYSIS ]" }), detail]),
      ]),
      diffSlot
    );
    buildCards();
    render();
  }

  window.SS = Object.assign(window.SS || {}, { buildDashboard: build });
})();
