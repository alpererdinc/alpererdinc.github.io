// Vehicle Brand Detection world — the page is a live detection feed.
// 1) paragraphs get a green box and a confidence the first time they come into view
// 2) a "Brand Counts" overlay (like the demo's) counts one car per section you pass
(function () {
  const world = document.querySelector(".world-brand");
  if (!world) return;

  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ── scanning ── */
  const conf = () => (0.8 + Math.random() * 0.19).toFixed(2);
  const targets = document.querySelectorAll(".project-body > p, .project-body .shot");

  if (!reduce && "IntersectionObserver" in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        io.unobserve(el);
        el.dataset.conf = conf();
        el.classList.add("is-scanned");
        setTimeout(() => el.classList.remove("is-scanned"), 1800);
      });
    }, { threshold: 0.4 });
    targets.forEach((el) => io.observe(el));
  }

  /* ── Brand Counts overlay: the cars found so far ── */
  const heads = [...document.querySelectorAll(".project-body > h2")];
  if (!heads.length) return;

  const cars = ["ford", "honda", "hyundai", "renault", "fiat", "volkswagen", "ford", "honda", "renault", "fiat", "hyundai", "ford"];

  const hud = document.createElement("aside");
  hud.className = "counts";
  hud.setAttribute("aria-hidden", "true");
  hud.innerHTML = '<b>Brand Counts</b><ul></ul>';
  world.append(hud);
  const list = hud.querySelector("ul");

  let shown = -1;
  let ticking = false;

  function update() {
    ticking = false;
    const line = window.innerHeight * 0.4;
    let n = 0;
    heads.forEach((h) => { if (h.getBoundingClientRect().top <= line) n += 1; });
    if (n === shown) return;
    shown = n;

    const counts = {};
    cars.slice(0, n).forEach((c) => { counts[c] = (counts[c] || 0) + 1; });
    const names = Object.keys(counts).sort();
    list.innerHTML = names.map((c) => "<li>" + c + ": " + counts[c] + "</li>").join("");
    hud.classList.toggle("is-empty", n === 0);
  }

  window.addEventListener("scroll", () => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(update);
    }
  }, { passive: true });
  window.addEventListener("resize", update);
  update();
})();
