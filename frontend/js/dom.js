/* Tiny DOM helpers. Always uses textContent, never innerHTML (safe by default). */
(function () {
  function el(tag, attrs, children) {
    const node = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs || {})) {
      if (v === false || v == null) continue;
      if (k === "class") node.className = v;
      else if (k === "text") node.textContent = v;
      else if (k.startsWith("on")) node.addEventListener(k.slice(2), v);
      else node.setAttribute(k, v === true ? "" : v);
    }
    for (const c of [].concat(children || [])) {
      if (c == null) continue;
      node.append(c.nodeType ? c : document.createTextNode(String(c)));
    }
    return node;
  }

  function clear(node) { node.replaceChildren(); return node; }

  function reducedMotion() {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  const SVG_NS = "http://www.w3.org/2000/svg";
  function svg(tag, attrs) {
    const n = document.createElementNS(SVG_NS, tag);
    for (const [k, v] of Object.entries(attrs || {})) n.setAttribute(k, v);
    return n;
  }

  /** Animated match ring, score 0-100. */
  function ring(score, large) {
    const r = 22, circ = 2 * Math.PI * r;
    const tone = score >= 70 ? "hi" : score >= 45 ? "mid" : "lo";
    const wrap = el("div", {
      class: `ring ${tone} ${large ? "lg" : ""} ${reducedMotion() ? "static" : "animate"}`,
      role: "img", "aria-label": `Match score ${score} out of 100`,
    });
    const s = svg("svg", { viewBox: "0 0 50 50", "aria-hidden": "true" });
    s.append(svg("circle", { class: "track", cx: 25, cy: 25, r }));
    const fill = svg("circle", { class: "fill", cx: 25, cy: 25, r });
    fill.style.setProperty("--circ", circ.toFixed(2));
    fill.style.setProperty("--offset", (circ * (1 - score / 100)).toFixed(2));
    s.append(fill);
    wrap.append(s, el("div", { class: "num", text: String(score) }));
    return wrap;
  }

  window.SS = Object.assign(window.SS || {}, { el, clear, ring, reducedMotion });
})();
