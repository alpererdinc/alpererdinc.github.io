// alper erdinç — portfolio js

(function () {

  /* ── CUSTOM CURSOR ── */
  const cursor = document.getElementById("cursor");

  if (cursor && window.matchMedia("(pointer: fine)").matches) {
    document.addEventListener("mousemove", (e) => {
      cursor.style.left = e.clientX + "px";
      cursor.style.top = e.clientY + "px";
    });

    document.querySelectorAll("a, button, .pill, .project-card").forEach((el) => {
      el.addEventListener("mouseenter", () => cursor.classList.add("big"));
      el.addEventListener("mouseleave", () => cursor.classList.remove("big"));
    });
  } else if (cursor) {
    cursor.style.display = "none";
  }

  /* ── LANG TOGGLE ── */
  let lang = localStorage.getItem("ae_lang") || "tr";
  const toggleBtn = document.getElementById("langToggle");

  function applyLang(l) {
    lang = l;

    localStorage.setItem("ae_lang", l);
    document.documentElement.setAttribute("lang", l === "tr" ? "tr" : "en");

    if (toggleBtn) {
      toggleBtn.textContent = l === "tr" ? "EN" : "TR";
    }

    document.querySelectorAll("[data-tr]").forEach((el) => {
      const val = l === "tr" ? el.dataset.tr : el.dataset.en;

      if (val !== undefined) {
        el.innerHTML = val;
      }
    });
  }

  if (toggleBtn) {
    toggleBtn.addEventListener("click", () => {
      applyLang(lang === "tr" ? "en" : "tr");
    });
  }

  applyLang(lang);

  /* ── HAMBURGER ── */
  const hamburger = document.getElementById("navHamburger");
  const mobileMenu = document.getElementById("mobileMenu");

  if (hamburger && mobileMenu) {
    hamburger.addEventListener("click", () => {
      mobileMenu.classList.toggle("open");
    });

    document.addEventListener("click", (e) => {
      if (!hamburger.contains(e.target) && !mobileMenu.contains(e.target)) {
        mobileMenu.classList.remove("open");
      }
    });
  }

  /* ── SCROLL FADE-IN FOR PROJECT CARDS ── */
  const cards = document.querySelectorAll(".project-card");

  if ("IntersectionObserver" in window && cards.length) {
    cards.forEach((card, i) => {
      card.style.opacity = "0";
      card.style.transition =
        `opacity 0.5s ease ${i * 0.07}s, transform 0.15s ease, box-shadow 0.15s ease`;
    });

    const obs = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.style.opacity = "1";
        }
      });
    }, {
      threshold: 0.1
    });

    cards.forEach((c) => obs.observe(c));
  }

  /* ── WOBBLE ON LOGO HOVER ── */
  const logo = document.querySelector(".nav-logo");

  if (logo) {
    logo.addEventListener("mouseenter", () => {
      logo.style.transform = "translate(-1px,-1px) rotate(-2deg)";
    });

    logo.addEventListener("mouseleave", () => {
      logo.style.transform = "";
    });
  }

  /* ── SCROLL TO TOP BUTTON ── */
  const scrollTopBtn = document.getElementById("scrollTopBtn");

  if (scrollTopBtn) {
    window.addEventListener("scroll", () => {
      if (window.scrollY > 450) {
        scrollTopBtn.classList.add("show");
      } else {
        scrollTopBtn.classList.remove("show");
      }
    });

    scrollTopBtn.addEventListener("click", () => {
      window.scrollTo({
        top: 0,
        behavior: "smooth"
      });
    });
  }

  /* ── AE PONG SECRET MINI GAME ── */
  (() => {
    const trigger = document.getElementById("secretGameTrigger");
    const modal = document.getElementById("pongModal");
    const closeBtn = document.getElementById("closePongBtn");
    const canvas = document.getElementById("pongCanvas");
    const scoreEl = document.getElementById("pongScore");
    const modeButtons = document.querySelectorAll("[data-pong-mode]");

    if (!trigger || !modal || !closeBtn || !canvas || !scoreEl) return;

    const ctx = canvas.getContext("2d");

    let clickCount = 0;
    let clickTimer = null;

    let animationId = null;
    let running = false;
    let currentMode = "normal";

    const keys = new Set();

    const modes = {
      easy: {
        label: "kolay",
        playerH: 94,
        aiH: 56,
        playerSpeed: 7.2,
        aiSpeed: 2.25,
        ballSpeed: 3.25,
        ballVerticalSpeed: 1.9,
        aiErrorAmount: 96,
        aiErrorInterval: 28,
        aiDeadzone: 22,
        aiMistakeChance: 0.38,
        aiMistakeMinFrames: 18,
        aiMistakeMaxFrames: 34,
        speedGainPlayer: 1.03,
        speedGainAI: 1.02,
        maxVX: 5.1,
        maxVY: 3.9
      },

      normal: {
        label: "orta",
        playerH: 74,
        aiH: 74,
        playerSpeed: 6.6,
        aiSpeed: 2.95,
        ballSpeed: 3.65,
        ballVerticalSpeed: 2.15,
        aiErrorAmount: 72,
        aiErrorInterval: 46,
        aiDeadzone: 18,
        aiMistakeChance: 0.22,
        aiMistakeMinFrames: 12,
        aiMistakeMaxFrames: 24,
        speedGainPlayer: 1.04,
        speedGainAI: 1.035,
        maxVX: 5.7,
        maxVY: 4.4
      },

      hard: {
        label: "zor",
        playerH: 72,
        aiH: 72,
        playerSpeed: 6.1,
        aiSpeed: 4.25,
        ballSpeed: 4.15,
        ballVerticalSpeed: 2.55,
        aiErrorAmount: 18,
        aiErrorInterval: 110,
        aiDeadzone: 8,
        aiMistakeChance: 0.04,
        aiMistakeMinFrames: 6,
        aiMistakeMaxFrames: 12,
        speedGainPlayer: 1.055,
        speedGainAI: 1.05,
        maxVX: 6.4,
        maxVY: 4.9
      }
    };

    const game = {
      width: canvas.width,
      height: canvas.height,

      playerScore: 0,
      aiScore: 0,
      frame: 0,

      player: {
        x: 24,
        y: 120,
        w: 10,
        h: modes.normal.playerH,
        speed: modes.normal.playerSpeed
      },

      ai: {
        x: canvas.width - 34,
        y: 145,
        w: 10,
        h: modes.normal.aiH,
        speed: modes.normal.aiSpeed,
        targetOffset: 0,
        mistakeFrames: 0,
        mistakeDirection: 0
      },

      ball: {
        x: canvas.width / 2,
        y: canvas.height / 2,
        size: 9,
        vx: modes.normal.ballSpeed,
        vy: modes.normal.ballVerticalSpeed
      }
    };

    function clamp(value, min, max) {
      return Math.max(min, Math.min(max, value));
    }

    function getMode() {
      return modes[currentMode] || modes.normal;
    }

    function updateModeButtons() {
      modeButtons.forEach((btn) => {
        btn.classList.toggle("active", btn.dataset.pongMode === currentMode);
      });
    }

    function applyMode() {
      const mode = getMode();

      game.player.h = mode.playerH;
      game.player.speed = mode.playerSpeed;

      game.ai.h = mode.aiH;
      game.ai.speed = mode.aiSpeed;

      game.player.y = game.height / 2 - game.player.h / 2;
      game.ai.y = game.height / 2 - game.ai.h / 2;

      game.ai.targetOffset = 0;
      game.ai.mistakeFrames = 0;
      game.ai.mistakeDirection = 0;

      resetBall(Math.random() > 0.5 ? 1 : -1);
      updateModeButtons();
    }

    function updateScore() {
      scoreEl.textContent =
        `${String(game.playerScore).padStart(2, "0")} / ${String(game.aiScore).padStart(2, "0")}`;
    }

    function resetBall(direction = 1) {
      const mode = getMode();
      const ball = game.ball;

      ball.x = game.width / 2;
      ball.y = game.height / 2;

      ball.vx = mode.ballSpeed * direction;
      ball.vy =
        (Math.random() > 0.5 ? 1 : -1) *
        (mode.ballVerticalSpeed * 0.75 + Math.random() * mode.ballVerticalSpeed * 0.55);
    }

    function resetGame() {
      game.playerScore = 0;
      game.aiScore = 0;
      game.frame = 0;

      applyMode();
      updateScore();
      draw();
    }

    function rectsOverlap(ball, paddle) {
      return (
        ball.x < paddle.x + paddle.w &&
        ball.x + ball.size > paddle.x &&
        ball.y < paddle.y + paddle.h &&
        ball.y + ball.size > paddle.y
      );
    }

    function updatePlayer() {
      const player = game.player;

      if (keys.has("w") || keys.has("arrowup")) {
        player.y -= player.speed;
      }

      if (keys.has("s") || keys.has("arrowdown")) {
        player.y += player.speed;
      }

      player.y = clamp(player.y, 0, game.height - player.h);
    }

    function updateAI() {
      const mode = getMode();
      const ai = game.ai;
      const ball = game.ball;

      const aiCenter = ai.y + ai.h / 2;
      const ballCenter = ball.y + ball.size / 2;

      /*
        AI artık sadece hatalı hedef seçmiyor.
        Bazen kısa süreli yanlış karar veriyor:
        - topa ters yönde hareket edebiliyor
        - geç tepki veriyor
        - özellikle orta modda nadiren ama fark edilir hata yapıyor
      */

      if (game.frame % mode.aiErrorInterval === 0) {
        ai.targetOffset = (Math.random() - 0.5) * mode.aiErrorAmount;

        if (Math.random() < mode.aiMistakeChance && ball.vx > 0) {
          ai.mistakeFrames =
            mode.aiMistakeMinFrames +
            Math.floor(Math.random() * (mode.aiMistakeMaxFrames - mode.aiMistakeMinFrames + 1));

          ai.mistakeDirection = Math.random() > 0.5 ? 1 : -1;
        }
      }

      if (ai.mistakeFrames > 0) {
        ai.y += ai.mistakeDirection * ai.speed * 0.85;
        ai.mistakeFrames -= 1;

        ai.y = clamp(ai.y, 0, game.height - ai.h);
        return;
      }

      if (ball.vx > 0) {
        const aiTarget = ballCenter + ai.targetOffset;

        if (aiTarget < aiCenter - mode.aiDeadzone) {
          ai.y -= ai.speed;
        } else if (aiTarget > aiCenter + mode.aiDeadzone) {
          ai.y += ai.speed;
        }
      } else {
        const middle = game.height / 2;

        if (aiCenter < middle - 24) {
          ai.y += ai.speed * 0.38;
        } else if (aiCenter > middle + 24) {
          ai.y -= ai.speed * 0.38;
        }
      }

      ai.y = clamp(ai.y, 0, game.height - ai.h);
    }

    function updateBall() {
      const mode = getMode();
      const player = game.player;
      const ai = game.ai;
      const ball = game.ball;

      ball.x += ball.vx;
      ball.y += ball.vy;

      if (ball.y <= 0 || ball.y + ball.size >= game.height) {
        ball.vy *= -1;
        ball.y = clamp(ball.y, 0, game.height - ball.size);
      }

      if (rectsOverlap(ball, player) && ball.vx < 0) {
        ball.vx *= -mode.speedGainPlayer;
        ball.x = player.x + player.w + 1;

        const hitPoint =
          ball.y + ball.size / 2 - (player.y + player.h / 2);

        ball.vy = hitPoint * 0.075;
      }

      if (rectsOverlap(ball, ai) && ball.vx > 0) {
        ball.vx *= -mode.speedGainAI;
        ball.x = ai.x - ball.size - 1;

        const hitPoint =
          ball.y + ball.size / 2 - (ai.y + ai.h / 2);

        ball.vy = hitPoint * 0.075;
      }

      ball.vx = clamp(ball.vx, -mode.maxVX, mode.maxVX);
      ball.vy = clamp(ball.vy, -mode.maxVY, mode.maxVY);

      if (ball.x < -ball.size) {
        game.aiScore += 1;
        updateScore();
        resetBall(1);
      }

      if (ball.x > game.width + ball.size) {
        game.playerScore += 1;
        updateScore();
        resetBall(-1);
      }
    }

    function update() {
      game.frame += 1;

      updatePlayer();
      updateAI();
      updateBall();
    }

    function drawNet() {
      ctx.fillStyle = "rgba(255, 122, 26, 0.22)";

      for (let y = 12; y < game.height; y += 24) {
        ctx.fillRect(game.width / 2 - 1, y, 2, 10);
      }
    }

    function drawBackground() {
      ctx.fillStyle = "#050505";
      ctx.fillRect(0, 0, game.width, game.height);

      ctx.fillStyle = "rgba(255, 122, 26, 0.045)";

      for (let x = 0; x < game.width; x += 24) {
        ctx.fillRect(x, 0, 1, game.height);
      }

      for (let y = 0; y < game.height; y += 24) {
        ctx.fillRect(0, y, game.width, 1);
      }
    }

    function draw() {
      const player = game.player;
      const ai = game.ai;
      const ball = game.ball;

      ctx.clearRect(0, 0, game.width, game.height);

      drawBackground();
      drawNet();

      ctx.fillStyle = "#ff7a1a";
      ctx.fillRect(player.x, player.y, player.w, player.h);
      ctx.fillRect(ai.x, ai.y, ai.w, ai.h);

      ctx.fillStyle = "#ece7df";
      ctx.fillRect(ball.x, ball.y, ball.size, ball.size);

      ctx.font = "12px monospace";
      ctx.fillStyle = "rgba(255, 122, 26, 0.7)";
      ctx.fillText("AE-PONG", 18, 24);

      ctx.font = "10px monospace";
      ctx.fillStyle = "rgba(236, 231, 223, 0.45)";
      ctx.fillText("W/S OR ↑/↓", 18, game.height - 18);

      ctx.fillStyle = "rgba(255, 122, 26, 0.55)";
      ctx.fillText(`MODE: ${currentMode.toUpperCase()}`, game.width - 118, game.height - 18);
    }

    function loop() {
      if (!running) return;

      update();
      draw();

      animationId = requestAnimationFrame(loop);
    }

    function openGame() {
      modal.classList.add("show");
      modal.setAttribute("aria-hidden", "false");

      resetGame();

      running = true;
      cancelAnimationFrame(animationId);
      animationId = requestAnimationFrame(loop);
    }

    function closeGame() {
      modal.classList.remove("show");
      modal.setAttribute("aria-hidden", "true");

      running = false;
      cancelAnimationFrame(animationId);
      keys.clear();
    }

    trigger.addEventListener("click", () => {
      clickCount += 1;

      clearTimeout(clickTimer);

      clickTimer = setTimeout(() => {
        clickCount = 0;
      }, 1600);

      if (clickCount >= 5) {
        clickCount = 0;
        clearTimeout(clickTimer);
        openGame();
      }
    });

    modeButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const selectedMode = button.dataset.pongMode;

        if (!modes[selectedMode]) return;

        currentMode = selectedMode;
        resetGame();
      });
    });

    closeBtn.addEventListener("click", closeGame);

    modal.addEventListener("click", (event) => {
      if (event.target === modal) {
        closeGame();
      }
    });

    window.addEventListener("keydown", (event) => {
      const key = event.key.toLowerCase();

      if (!running) return;

      if (["w", "s", "arrowup", "arrowdown", "r", "escape"].includes(key)) {
        event.preventDefault();
      }

      if (key === "escape") {
        closeGame();
        return;
      }

      if (key === "r") {
        resetGame();
        return;
      }

      keys.add(key);
    });

    window.addEventListener("keyup", (event) => {
      keys.delete(event.key.toLowerCase());
    });

    updateModeButtons();
    draw();
  })();

})();