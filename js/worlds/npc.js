// Adaptive NPC AI world — the page adapts to how you read, like the NPC does.
(function () {
  const world = document.querySelector(".world-npc");
  if (!world) return;

  /* ── words (the Guardian is short and dry) ── */
  const T = {
    tr: {
      title: "ADAPTASYON PANELİ",
      sub: "okuyucu profili",
      tempo: "TEMPO",
      patience: "SABIR",
      curiosity: "MERAK",
      close: "küçült",
      open: "aç",
      guardian: "Guardian",
      msg: {
        start: "Seni okuyorum. Nasıl okuduğunu hatırlayacağım.",
        fast: "Hızlı kaydırıyorsun. Hızlıları arenada yavaşlatırım.",
        slow: "Yavaş okuyorsun. Alışmanı beklerim, sonra ona göre karşılarım.",
        shots: "Görsellere tıkladın. Görerek öğrenen birine benziyorsun.",
        stay: "Hâlâ buradasın. Sabırlılar arenada uzun yaşar.",
        end: "Sona geldin. Arena sonunu hatırlar."
      }
    },
    en: {
      title: "ADAPTATION PANEL",
      sub: "reader profile",
      tempo: "TEMPO",
      patience: "PATIENCE",
      curiosity: "CURIOSITY",
      close: "collapse",
      open: "open",
      guardian: "Guardian",
      msg: {
        start: "I am reading you. I will remember how you read.",
        fast: "You scroll fast. I slow the fast ones down in the arena.",
        slow: "You read slowly. I will wait for you to settle, then answer in kind.",
        shots: "You clicked the screenshots. You look like someone who learns by seeing.",
        stay: "You are still here. The patient live longer in the arena.",
        end: "You reached the end. The arena remembers the ending."
      }
    }
  };
  const words = () => (document.documentElement.lang === "en" ? T.en : T.tr);

  /* ── panel ── */
  const panel = document.createElement("aside");
  panel.className = "adapt";
  panel.setAttribute("aria-label", "adaptation panel");
  panel.innerHTML =
    '<div class="adapt-head"><span class="adapt-title"></span><button type="button" class="adapt-toggle"></button></div>' +
    '<div class="adapt-body">' +
    '<div class="adapt-sub"></div>' +
    '<div class="adapt-row" data-k="tempo"><span></span><b><i></i></b></div>' +
    '<div class="adapt-row" data-k="patience"><span></span><b><i></i></b></div>' +
    '<div class="adapt-row" data-k="curiosity"><span></span><b><i></i></b></div>' +
    '<p class="adapt-msg"><em class="adapt-who"></em> <span class="adapt-text"></span></p>' +
    "</div>";
  world.append(panel);

  const $ = (sel) => panel.querySelector(sel);
  const bar = (k) => panel.querySelector('[data-k="' + k + '"] i');

  // on windows too narrow to leave room beside the text, it starts folded
  let collapsed = window.innerWidth < 1540;
  try {
    const saved = localStorage.getItem("ae_adapt");
    if (saved !== null) collapsed = saved === "1";
  } catch (e) { /* private mode */ }
  panel.classList.toggle("is-collapsed", collapsed);

  $(".adapt-toggle").addEventListener("click", () => {
    collapsed = !collapsed;
    panel.classList.toggle("is-collapsed", collapsed);
    try { localStorage.setItem("ae_adapt", collapsed ? "1" : "0"); } catch (e) { /* private mode */ }
    render();
  });

  /* ── what we watch: scroll speed, time on the page, clicks and depth ── */
  let speed = 0;                 // smoothed px/s
  let lastY = window.scrollY;
  let lastT = performance.now();
  let seconds = 0;               // time with the page visible
  let clicks = 0;
  let depth = 0;                 // 0..1, deepest point reached

  window.addEventListener("scroll", () => {
    const now = performance.now();
    const dt = Math.max((now - lastT) / 1000, 0.016);
    const v = Math.abs(window.scrollY - lastY) / dt;
    speed = speed * 0.8 + Math.min(v, 6000) * 0.2;
    lastY = window.scrollY;
    lastT = now;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    if (max > 0) depth = Math.max(depth, window.scrollY / max);
  }, { passive: true });

  document.addEventListener("click", (event) => {
    if (event.target.closest(".shots a, .lightbox, .system-card, .rail a, .adapt")) clicks += 1;
  });

  const clamp = (n) => Math.max(0, Math.min(100, n));
  let tempo = 0, patience = 0, curiosity = 0, key = "";

  function pick() {
    if (document.body.classList.contains("lb-open")) return "shots";
    if (depth > 0.88) return "end";
    if (tempo > 52) return "fast";
    if (seconds > 100) return "stay";
    if (seconds > 25 && tempo < 14) return "slow";
    if (clicks > 3) return "shots";
    return "start";
  }

  function render() {
    const w = words();
    $(".adapt-title").textContent = w.title;
    $(".adapt-toggle").textContent = collapsed ? w.open : w.close;
    $(".adapt-sub").textContent = w.sub;
    ["tempo", "patience", "curiosity"].forEach((k) => {
      panel.querySelector('[data-k="' + k + '"] span').textContent = w[k];
    });
    $(".adapt-who").textContent = w.guardian + ":";
    $(".adapt-text").textContent = w.msg[key || "start"];
    bar("tempo").style.width = tempo + "%";
    bar("patience").style.width = patience + "%";
    bar("curiosity").style.width = curiosity + "%";
  }

  setInterval(() => {
    if (document.hidden) return;
    seconds += 0.5;
    speed *= 0.9; // it cools down when you stop
    tempo = Math.round(clamp((speed / 2200) * 100));
    patience = Math.round(clamp((seconds / 120) * 100));
    curiosity = Math.round(clamp(depth * 70 + clicks * 8));
    key = pick();
    render();
  }, 500);

  render();
})();
