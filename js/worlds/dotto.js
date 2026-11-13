// Dotto: Block Breaker world — the page plays a little.
(function () {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ── blocks: every card has an HP; each click chips one off ── */
  const cards = document.querySelectorAll(".system-card, .powerup-card");
  const rnd = (a, b) => a + Math.floor(Math.random() * (b - a + 1));

  cards.forEach((card) => {
    const hp = document.createElement("span");
    hp.className = "hp";
    hp.setAttribute("aria-hidden", "true");
    card.append(hp);

    const start = rnd(4, 14);
    let left = start;
    hp.textContent = left;

    card.addEventListener("click", (event) => {
      if (event.target.closest("a")) return;
      if (card.classList.contains("is-broken")) return;
      left -= 1;
      hp.textContent = left;
      if (!reduce) {
        card.classList.remove("is-hit");
        void card.offsetWidth; // restart the shake
        card.classList.add("is-hit");
      }
      if (left <= 0) {
        card.classList.add("is-broken");
        hp.textContent = "0";
        setTimeout(() => {
          card.classList.remove("is-broken");
          left = start;
          hp.textContent = left;
        }, 3500);
      }
    });
  });

  /* ── balls: a few of them, bouncing off the edges of the window ── */
  const sky = document.querySelector(".cosmos");
  if (!sky || reduce) return;

  const canvas = document.createElement("canvas");
  canvas.className = "balls";
  canvas.setAttribute("aria-hidden", "true");
  sky.append(canvas);
  const ctx = canvas.getContext("2d");

  let w = 0, h = 0, dpr = 1;
  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = window.innerWidth;
    h = window.innerHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  resize();
  window.addEventListener("resize", resize);

  const count = w < 700 ? 4 : 7;
  const balls = Array.from({ length: count }, () => {
    const a = Math.random() * Math.PI * 2;
    const sp = 70 + Math.random() * 60;
    return { x: Math.random() * w, y: Math.random() * h, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, r: 4 + Math.random() * 2, trail: [] };
  });

  let last = performance.now();
  function frame(now) {
    const dt = Math.min((now - last) / 1000, 0.05);
    last = now;
    const col = getComputedStyle(sky).getPropertyValue("--star").trim() || "255,255,255";
    ctx.clearRect(0, 0, w, h);
    balls.forEach((b) => {
      b.x += b.vx * dt;
      b.y += b.vy * dt;
      if (b.x < b.r) { b.x = b.r; b.vx = Math.abs(b.vx); }
      if (b.x > w - b.r) { b.x = w - b.r; b.vx = -Math.abs(b.vx); }
      if (b.y < b.r) { b.y = b.r; b.vy = Math.abs(b.vy); }
      if (b.y > h - b.r) { b.y = h - b.r; b.vy = -Math.abs(b.vy); }
      b.trail.push([b.x, b.y]);
      if (b.trail.length > 14) b.trail.shift();
      b.trail.forEach((p, i) => {
        ctx.fillStyle = "rgba(" + col + "," + (i / b.trail.length) * 0.22 + ")";
        ctx.beginPath();
        ctx.arc(p[0], p[1], b.r * (0.35 + (i / b.trail.length) * 0.6), 0, 6.2832);
        ctx.fill();
      });
      ctx.fillStyle = "rgba(" + col + ",0.55)";
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.r, 0, 6.2832);
      ctx.fill();
    });
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();
