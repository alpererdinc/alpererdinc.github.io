// DiveAlamut world — every section sits on a platform of the tower.
// Each platform has a gap to dive through and a red segment that smashes
// once you have scrolled past it.
(function () {
  const heads = document.querySelectorAll(".world-alamut .project-body > h2");
  if (!heads.length) return;

  // widths in %: stone, gap, stone, red, stone  (always adds up to 100)
  const patterns = [
    [22, 12, 28, 14, 24],
    [38, 12, 16, 12, 22],
    [14, 12, 36, 14, 24],
    [30, 12, 20, 16, 22],
    [18, 12, 30, 12, 28],
    [42, 12, 14, 14, 18],
    [26, 12, 24, 18, 20]
  ];
  const kinds = ["s", "g", "s", "r", "s"];

  const plats = [];
  heads.forEach((h, i) => {
    const plat = document.createElement("div");
    plat.className = "plat";
    plat.setAttribute("aria-hidden", "true");
    patterns[i % patterns.length].forEach((w, k) => {
      const seg = document.createElement("span");
      seg.className = kinds[k];
      seg.style.flex = "0 0 " + w + "%";
      plat.append(seg);
    });
    h.after(plat);
    plats.push(plat);
  });

  let ticking = false;
  function update() {
    const line = window.innerHeight * 0.55;
    plats.forEach((plat) => {
      plat.classList.toggle("is-passed", plat.getBoundingClientRect().top < line);
    });
    ticking = false;
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
