// Kantanfu world — the page is a level and Rex runs it as you scroll.
// He walks along the bottom edge, one end of the page to the other, and
// hops over the gaps in the ground (your own sprite, from the Dotto-Man pages).
(function () {
  const world = document.querySelector(".world-kantanfu");
  if (!world) return;

  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const ground = document.createElement("div");
  ground.className = "ground";
  ground.setAttribute("aria-hidden", "true");

  const runner = document.createElement("div");
  runner.className = "runner";
  runner.setAttribute("aria-hidden", "true");
  const img = document.createElement("img");
  img.src = "../images/Sprite-Rex-AE_BIG.gif";
  img.alt = "";
  img.width = 72;
  img.height = 72;
  runner.append(img);

  world.append(ground, runner);

  // gaps in the ground, as fractions of the screen width (same numbers as the CSS mask)
  const gaps = [[0.17, 0.215], [0.46, 0.51], [0.74, 0.79]];

  let ticking = false;
  let stopTimer = 0;
  let hopping = false;

  function update() {
    ticking = false;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const p = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
    runner.style.setProperty("--p", p);

    const size = runner.offsetWidth || 72;
    const centre = (p * (window.innerWidth - size) + size / 2) / window.innerWidth;
    const over = gaps.some(([a, b]) => centre > a - 0.015 && centre < b + 0.015);

    if (over && !hopping && !reduce) {
      hopping = true;
      runner.classList.remove("is-hop");
      void runner.offsetWidth; // restart the hop
      runner.classList.add("is-hop");
      setTimeout(() => runner.classList.remove("is-hop"), 620);
    }
    if (!over) hopping = false;

    runner.classList.add("is-moving");
    clearTimeout(stopTimer);
    stopTimer = setTimeout(() => runner.classList.remove("is-moving"), 160);
  }

  window.addEventListener("scroll", () => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(update);
    }
  }, { passive: true });
  window.addEventListener("resize", update);
  update();
  runner.classList.remove("is-moving");
})();
