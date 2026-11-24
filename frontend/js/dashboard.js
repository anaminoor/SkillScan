/* Results dashboard: ranked cards | overview | GAPS / MATCHED / BULLETS tabs. */
(function () {
  const { el, clear, ring } = window.SS;

  const TABS = ["gaps", "matched", "bullets"];

  function verdict(score) {
    if (score >= 80) return "Strong match";
    if (score >= 60) return "Good match, a few gaps";
    if (score >= 45) return "Partial match";
    return "Weak match";
  }

  function build(root, data, onBack) {
    clear(root);
    let selected = 0;
    let tab = "gaps";

    const cards = el("div", { class: "cards" });
    const overview = el("div", { class: "overview panel" });
    const detail = el("div", { class: "detail panel" });

    function renderCards() {
      clear(cards);
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
        ))
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
    function panelBullets(m) {
      if (!m.bullets.length) return [el("div", { class: "empty", text: "No bullet suggestions for this role." })];
      return [el("div", { class: "label", text: "[ REWORDED FROM YOUR RESUME ]" })].concat(
        m.bullets.map((b) =>
          el("div", { class: "item bullet fade-in" }, [
            el("div", { class: "orig", text: b.original }),
            el("p", { class: "sugg", text: b.suggested }),
            el("div", { class: "sug", text: b.reason }),
          ])
        )
      );
    }

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

    function render() { renderCards(); renderOverview(); renderDetail(); }

    root.append(
      el("div", { class: "dash-bar" }, [
        el("div", { class: "label" }, ["[ ", el("b", { text: "RESULTS" }), ` ] ${data.matches.length} jobs ranked`]),
        el("button", { class: "btn ghost", style: "margin:0", text: "New scan", onclick: onBack }),
      ]),
      el("div", { class: "dash" }, [
        el("div", {}, [el("div", { class: "col-head label", text: "[ RANKED MATCHES ]" }), cards]),
        el("div", {}, [el("div", { class: "col-head label", text: "[ OVERVIEW ]" }), overview]),
        el("div", { class: "col-detail" }, [el("div", { class: "col-head label", text: "[ ANALYSIS ]" }), detail]),
      ])
    );
    render();
  }

  window.SS = Object.assign(window.SS || {}, { buildDashboard: build });
})();
