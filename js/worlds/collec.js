// CollecZone world — a small turntable that plays the page.
// The record turns; the tonearm moves from the outer groove to the inner one
// as you read, and the label says which track (section) is playing.
(function () {
  const world = document.querySelector(".world-collec");
  const heads = [...document.querySelectorAll(".world-collec .project-body > h2")];
  if (!world || !heads.length) return;

  const deck = document.createElement("aside");
  deck.className = "deck";
  deck.setAttribute("aria-hidden", "true");
  deck.innerHTML =
    '<svg viewBox="0 0 170 124" xmlns="http://www.w3.org/2000/svg">' +
    '<rect class="deck-base" x="2" y="2" width="166" height="120" rx="6"/>' +
    '<g class="deck-record"><circle class="deck-vinyl" cx="68" cy="64" r="50"/>' +
    '<circle class="deck-groove" cx="68" cy="64" r="40"/><circle class="deck-groove" cx="68" cy="64" r="31"/>' +
    '<path class="deck-half-a" d="M68 64 m-19 0 a19 19 0 0 1 38 0Z"/><path class="deck-half-b" d="M68 64 m19 0 a19 19 0 0 1 -38 0Z"/>' +
    '<circle class="deck-hole" cx="68" cy="64" r="3.2"/></g>' +
    '<circle class="deck-pivot" cx="146" cy="22" r="7"/>' +
    '<g class="deck-arm"><line x1="146" y1="22" x2="146" y2="96"/><rect x="141" y="92" width="10" height="12" rx="2"/></g>' +
    "</svg>" +
    '<div class="deck-label"><span class="deck-now">NOW PLAYING</span><b class="deck-track"></b></div>';
  world.append(deck);

  const arm = deck.querySelector(".deck-arm");
  const track = deck.querySelector(".deck-track");
  let ticking = false;

  function update() {
    ticking = false;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const p = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
    // from the outer groove (a little off the record) to the inner one
    arm.style.transform = "rotate(" + (4 + p * 22).toFixed(1) + "deg)";

    const line = window.innerHeight * 0.4;
    let i = 0;
    heads.forEach((h, k) => { if (h.getBoundingClientRect().top <= line) i = k; });
    track.textContent = "A" + (i + 1) + " · " + heads[i].textContent.trim();
  }

  window.addEventListener("scroll", () => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(update);
    }
  }, { passive: true });
  window.addEventListener("resize", update);
  const toggle = document.getElementById("langToggle");
  if (toggle) toggle.addEventListener("click", () => setTimeout(update, 0));
  update();
})();
