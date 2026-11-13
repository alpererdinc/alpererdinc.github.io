// JazuRider world — the game's HUD, as page progress.
// Left number = the section you are in, right = the next one, the bar fills
// as you read it, the multiplier grows with every section passed, and the
// stack of jars under the bar's marker gets taller, as it does in the game.
(function () {
  const heads = [...document.querySelectorAll(".world-jazu .project-body > h2")];
  const world = document.querySelector(".world-jazu");
  if (!heads.length || !world) return;

  const JAR =
    '<svg viewBox="0 0 24 22" aria-hidden="true"><path d="M5 8H19Q22 8 22 11V18Q22 21 19 21H5Q2 21 2 18V11Q2 8 5 8Z" fill="currentColor"/><path d="M7 2H17L16 9H8Z" fill="currentColor"/><path d="M9 4H15L14.6 6H9.4Z" fill="var(--bg)"/></svg>';

  const hud = document.createElement("div");
  hud.className = "hud";
  hud.setAttribute("aria-hidden", "true");
  hud.innerHTML =
    '<b class="hud-a">00</b>' +
    '<div class="hud-bar"><i></i><span class="hud-stack"></span></div>' +
    '<b class="hud-b">01</b>' +
    '<em class="hud-x">x1</em>';
  world.append(hud);

  const a = hud.querySelector(".hud-a");
  const b = hud.querySelector(".hud-b");
  const x = hud.querySelector(".hud-x");
  const fill = hud.querySelector(".hud-bar i");
  const stack = hud.querySelector(".hud-stack");
  const pad = (n) => String(n).padStart(2, "0");

  let shown = -1;
  let ticking = false;

  function update() {
    ticking = false;
    const line = window.innerHeight * 0.4;
    const tops = heads.map((h) => h.getBoundingClientRect().top);
    let i = -1; // index of the last heading above the line
    tops.forEach((t, k) => { if (t <= line) i = k; });
    // at the very bottom the last section counts as reached, even if it is short
    const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;
    if (atBottom) i = heads.length - 1;

    let frac = 0;
    if (i === -1) {
      frac = Math.max(0, Math.min(1, window.scrollY / Math.max(1, tops[0] + window.scrollY - line)));
    } else if (i < heads.length - 1) {
      frac = Math.max(0, Math.min(1, (line - tops[i]) / (tops[i + 1] - tops[i])));
    } else if (atBottom) {
      frac = 1;
    } else {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      frac = max > 0 ? Math.max(0, Math.min(1, (window.scrollY - (tops[i] + window.scrollY - line)) / Math.max(1, max - (tops[i] + window.scrollY - line)))) : 1;
    }

    const level = i + 1; // 0 before the first heading
    a.textContent = pad(level);
    b.textContent = level >= heads.length ? "★" : pad(level + 1);
    x.textContent = "x" + Math.max(1, level);
    fill.style.width = frac * 100 + "%";
    stack.style.left = frac * 100 + "%";

    if (level !== shown) {
      shown = level;
      const n = Math.min(Math.max(1, level), 7);
      stack.innerHTML = JAR.repeat(n);
    }
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
