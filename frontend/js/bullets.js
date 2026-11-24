/* Bullet rewriter: original (dim) vs suggested (bright), copy, accept/reject. */
(function () {
  const { el } = window.SS;

  async function copyText(text) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (e) {
      const ta = el("textarea", { style: "position:fixed;opacity:0", "aria-hidden": "true" });
      ta.value = text;
      document.body.append(ta);
      ta.select();
      let ok = false;
      try { ok = document.execCommand("copy"); } catch (err) { ok = false; }
      ta.remove();
      return ok;
    }
  }

  /** decisions: shared {key: "accepted" | "rejected"} so choices survive switching jobs/tabs. */
  function item(jobId, i, b, decisions) {
    const key = `${jobId}:${i}`;
    const card = el("div", { class: "item bullet fade-in" });
    const copy = el("button", { class: "mini", type: "button", text: "Copy" });
    copy.addEventListener("click", async () => {
      const ok = await copyText(b.suggested);
      copy.textContent = ok ? "Copied" : "Copy failed";
      setTimeout(() => { copy.textContent = "Copy"; }, 1500);
    });

    function toggle(kind) {
      decisions[key] = decisions[key] === kind ? undefined : kind;
      paint();
    }
    const accept = el("button", { class: "mini accept", type: "button", text: "Accept", onclick: () => toggle("accepted") });
    const reject = el("button", { class: "mini reject", type: "button", text: "Reject", onclick: () => toggle("rejected") });

    function paint() {
      const d = decisions[key];
      card.dataset.state = d || "pending";
      accept.setAttribute("aria-pressed", String(d === "accepted"));
      reject.setAttribute("aria-pressed", String(d === "rejected"));
    }

    card.append(
      el("div", { class: "label" }, ["ORIGINAL"]),
      el("div", { class: "orig", text: b.original }),
      el("div", { class: "label tag" }, ["[ ", el("b", { text: "REWORDED FROM YOUR RESUME" }), " ]"]),
      el("p", { class: "sugg", text: b.suggested }),
      el("div", { class: "sug", text: b.reason }),
      el("div", { class: "actions" }, [copy, el("span", { class: "spacer" }), accept, reject])
    );
    paint();
    return card;
  }

  function build(m, decisions) {
    if (!m.bullets.length) return [el("div", { class: "empty", text: "No bullet suggestions for this role." })];
    return m.bullets.map((b, i) => item(m.job_id, i, b, decisions));
  }

  window.SS = Object.assign(window.SS || {}, { buildBullets: build });
})();
