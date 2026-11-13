// Nothing To Report world — the page is a night desk.
// 1) a status bar like the game's: day, a clock, and four stats that move as you read
// 2) a few words are blacked out; click one to read it
(function () {
  const world = document.querySelector(".world-ntr");
  if (!world) return;

  const lang = () => (document.documentElement.lang === "en" ? "en" : "tr");

  /* ── status bar ── */
  const W = {
    tr: { day: "GÜN", trust: "HALK GÜVENİ", danger: "TEHLİKE", funds: "PARA", safety: "MUHABİR GÜVENLİĞİ" },
    en: { day: "DAY", trust: "PUBLIC TRUST", danger: "DANGER", funds: "FUNDS", safety: "REPORTER SAFETY" }
  };

  const bar = document.createElement("div");
  bar.className = "statusbar";
  bar.setAttribute("aria-hidden", "true");
  bar.innerHTML =
    '<span class="sb-day"></span>' +
    '<span class="sb-stat sb-trust"></span>' +
    '<span class="sb-stat sb-danger"></span>' +
    '<span class="sb-stat sb-funds"></span>' +
    '<span class="sb-stat sb-safety"></span>';
  world.append(bar);

  const q = (s) => bar.querySelector(s);
  const heads = [...document.querySelectorAll(".project-body > h2")];
  const pad = (n) => String(n).padStart(2, "0");
  const started = Date.now();
  let depth = 0;

  function onScroll() {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    depth = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  function render() {
    const w = W[lang()];
    const line = window.innerHeight * 0.4;
    let day = 0;
    heads.forEach((h, i) => { if (h.getBoundingClientRect().top <= line) day = i + 1; });
    const secs = Math.floor((Date.now() - started) / 1000);
    q(".sb-day").textContent = w.day + " " + pad(Math.max(1, day)) + " // " + pad(Math.floor(secs / 60) % 100) + ":" + pad(secs % 60);

    // the deeper you dig, the more it costs
    const trust = Math.round(70 - 40 * depth);
    const danger = Math.round(15 + 75 * depth);
    const funds = Math.max(8, Math.round(92 - secs / 6));
    const safety = Math.round(82 - 46 * depth);
    q(".sb-trust").textContent = w.trust + ": " + trust;
    q(".sb-danger").textContent = w.danger + ": " + danger;
    q(".sb-funds").textContent = w.funds + ": " + funds;
    q(".sb-safety").textContent = w.safety + ": " + safety;
  }
  setInterval(render, 1000);
  window.addEventListener("scroll", () => requestAnimationFrame(render), { passive: true });
  render();

  /* ── redactions ── */
  const WORDS = {
    tr: ["belediye", "yayın", "bodrum", "kaçak", "sinyal", "klima", "güvercin", "muhabir"],
    en: ["municipal", "broadcast", "basement", "hidden", "signal", "air-con", "pigeon", "reporter"]
  };
  const MAX = 14;

  function redact() {
    const list = WORDS[lang()];
    // letters on both sides count as part of the word, so "yayın" does not hide inside "yayınla"
    const re = new RegExp("(?<![\\p{L}])(" + list.join("|") + ")(?![\\p{L}])", "giu");
    let count = document.querySelectorAll(".redact").length;
    const paragraphs = document.querySelectorAll(".project-body > p");

    paragraphs.forEach((p) => {
      if (count >= MAX) return;
      const walker = document.createTreeWalker(p, NodeFilter.SHOW_TEXT);
      const nodes = [];
      while (walker.nextNode()) nodes.push(walker.currentNode);

      nodes.forEach((node) => {
        if (count >= MAX || node.parentElement.closest(".redact")) return;
        const text = node.nodeValue;
        re.lastIndex = 0;
        if (!re.test(text)) return;
        re.lastIndex = 0;
        const frag = document.createDocumentFragment();
        let last = 0, m;
        while ((m = re.exec(text)) && count < MAX) {
          frag.append(text.slice(last, m.index));
          const span = document.createElement("span");
          span.className = "redact";
          span.tabIndex = 0;
          span.textContent = m[0];
          frag.append(span);
          last = m.index + m[0].length;
          count += 1;
        }
        frag.append(text.slice(last));
        node.replaceWith(frag);
      });
    });
  }

  document.addEventListener("click", (event) => {
    const r = event.target.closest(".redact");
    if (r) r.classList.toggle("is-open");
  });
  document.addEventListener("keydown", (event) => {
    if ((event.key === "Enter" || event.key === " ") && event.target.classList && event.target.classList.contains("redact")) {
      event.preventDefault();
      event.target.classList.toggle("is-open");
    }
  });

  // a language switch rewrites the paragraphs, so black them out again
  const toggle = document.getElementById("langToggle");
  if (toggle) toggle.addEventListener("click", () => setTimeout(() => { redact(); render(); }, 0));
  redact();
})();
