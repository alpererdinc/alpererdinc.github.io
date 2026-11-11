// Dotto•Man — small page helpers, no dependencies
(function () {
  const root = document.documentElement;

  const store = {
    get(key) {
      try { return localStorage.getItem(key); } catch (e) { return null; }
    },
    set(key, value) {
      try { localStorage.setItem(key, value); } catch (e) { /* private mode */ }
    }
  };

  /* nothing here is drag-and-drop: images, links and selected text can't be
     dragged (a drag dropped outside the window can get stuck). Selecting and
     copying text still works. */
  document.addEventListener("dragstart", (event) => {
    event.preventDefault();
  });

  /* ── language: both texts are in the page; CSS hides one ── */
  const langBtn = document.getElementById("langBtn");

  function setLang(lang) {
    root.dataset.lang = lang;
    root.lang = lang;
    store.set("dotto-lang", lang);
    if (langBtn) {
      langBtn.textContent = lang === "tr" ? "EN" : "TR";
      langBtn.setAttribute("aria-label", lang === "tr" ? "Switch to English" : "Türkçeye geç");
    }
    const status = document.getElementById("formStatus");
    if (status) status.textContent = "";
  }

  setLang(store.get("dotto-lang") === "en" ? "en" : "tr");
  if (langBtn) {
    langBtn.addEventListener("click", () => setLang(root.dataset.lang === "tr" ? "en" : "tr"));
  }

  /* ── ink (dark) / paper (light) ── */
  const modeBtn = document.getElementById("modeBtn");

  function setMode(mode) {
    root.dataset.mode = mode;
    store.set("dotto-mode", mode);
    if (modeBtn) modeBtn.textContent = mode === "ink" ? "☼" : "☾";
  }

  // paper (cream, black ink) is the default look, like the logo
  setMode(store.get("dotto-mode") === "ink" ? "ink" : "paper");
  if (modeBtn) {
    modeBtn.addEventListener("click", () => setMode(root.dataset.mode === "ink" ? "paper" : "ink"));
  }

  /* ── table of contents on small screens ── */
  const toc = document.getElementById("toc");
  const tocToggle = document.getElementById("tocToggle");

  if (toc && tocToggle) {
    tocToggle.addEventListener("click", () => {
      const open = toc.classList.toggle("open");
      tocToggle.setAttribute("aria-expanded", String(open));
    });

    toc.addEventListener("click", (event) => {
      if (event.target.closest("a")) {
        toc.classList.remove("open");
        tocToggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  /* ── YouTube: poster first, player only on click ── */
  document.querySelectorAll(".yt[data-yt]").forEach((button) => {
    const id = button.dataset.yt;
    const img = document.createElement("img");
    img.src = `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
    img.alt = "";
    img.loading = "lazy";
    img.width = 480;
    img.height = 360;
    button.appendChild(img);

    button.addEventListener("click", () => {
      const frame = document.createElement("iframe");
      frame.src = `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`;
      frame.title = button.getAttribute("aria-label") || "YouTube";
      frame.allow = "autoplay; encrypted-media; picture-in-picture; fullscreen";
      frame.allowFullscreen = true;

      // swap the poster button for a plain box, so the play mark goes away
      const player = document.createElement("div");
      player.className = "yt-player";
      player.appendChild(frame);
      button.replaceWith(player);
      frame.focus();
    }, { once: true });
  });

  /* ── gallery lightbox: big image on the page, prev / next, Esc to close ── */
  const lightbox = document.getElementById("lightbox");
  const figures = [...document.querySelectorAll(".gallery figure")];

  if (lightbox && typeof lightbox.showModal === "function" && figures.length) {
    const lbImg = lightbox.querySelector(".lb-img");
    const lbCount = lightbox.querySelector(".lb-count");
    const lbText = lightbox.querySelector(".lb-text");
    const pad = (n) => String(n).padStart(2, "0");
    let current = 0;

    const items = figures.map((fig) => {
      const link = fig.querySelector("a");
      const img = fig.querySelector("img");
      return { fig, src: link.href, alt: img.alt };
    });

    // caption in the current language (both languages live in the page)
    function captionOf(fig) {
      const cap = fig.querySelector("figcaption .label:last-child");
      if (!cap) return "";
      const local = cap.querySelector(`[data-l="${root.dataset.lang}"]`);
      return (local || cap).textContent.trim();
    }

    function show(index) {
      current = (index + items.length) % items.length;
      const item = items[current];
      lbImg.classList.add("loading");
      lbImg.onload = () => lbImg.classList.remove("loading");
      lbImg.src = item.src;
      lbImg.alt = item.alt;
      lbCount.textContent = `${pad(current + 1)} / ${pad(items.length)}`;
      lbText.textContent = captionOf(item.fig);

      // warm up the neighbours so next / previous feel instant
      [current + 1, current - 1].forEach((i) => {
        const n = items[(i + items.length) % items.length];
        new Image().src = n.src;
      });
    }

    function open(index) {
      show(index);
      lightbox.showModal();
      document.body.classList.add("lb-open");
    }

    function close() {
      lightbox.close();
    }

    lightbox.addEventListener("close", () => {
      document.body.classList.remove("lb-open");
      const link = items[current].fig.querySelector("a");
      if (link) link.focus({ preventScroll: true });
    });

    items.forEach((item, i) => {
      item.fig.querySelector("a").addEventListener("click", (event) => {
        if (event.metaKey || event.ctrlKey || event.shiftKey) return; // keep "open in new tab"
        event.preventDefault();
        open(i);
      });
    });

    lightbox.querySelector(".lb-close").addEventListener("click", close);
    lightbox.querySelector(".lb-prev").addEventListener("click", () => show(current - 1));
    lightbox.querySelector(".lb-next").addEventListener("click", () => show(current + 1));

    // click on the empty space around the image closes the panel
    lightbox.addEventListener("click", (event) => {
      if (event.target === lightbox || event.target.classList.contains("lb-frame")) close();
    });

    lightbox.addEventListener("keydown", (event) => {
      if (event.key === "ArrowRight") { event.preventDefault(); show(current + 1); }
      if (event.key === "ArrowLeft") { event.preventDefault(); show(current - 1); }
    });

    // swipe on touch screens
    let startX = null;
    lbImg.addEventListener("pointerdown", (event) => { startX = event.clientX; });
    lbImg.addEventListener("pointerup", (event) => {
      if (startX === null) return;
      const dx = event.clientX - startX;
      startX = null;
      if (Math.abs(dx) > 50) show(current + (dx < 0 ? 1 : -1));
    });
  }

  /* ── section timeline + back-to-top: follow the scroll position ── */
  const rail = document.getElementById("rail");
  const toTop = document.getElementById("toTop");
  const railList = rail ? rail.querySelector("ol") : null;
  const railItems = rail ? [...rail.querySelectorAll("li")] : [];
  const railSections = railItems.map((li) => document.querySelector(li.querySelector("a").hash));

  function updateScrollUi() {
    if (toTop) toTop.classList.toggle("show", window.scrollY > 600);
    if (!railList) return;

    // the section whose top has passed ~35% of the screen is "current"
    const line = window.innerHeight * 0.35;
    let active = -1;
    railSections.forEach((section, i) => {
      if (section && section.getBoundingClientRect().top <= line) active = i;
    });
    // at the very bottom the last section is current even if it is short
    const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;
    if (atBottom) active = railSections.length - 1;

    railItems.forEach((li, i) => {
      li.classList.toggle("active", i === active);
      li.classList.toggle("passed", i < active);
      const link = li.querySelector("a");
      if (i === active) link.setAttribute("aria-current", "true");
      else link.removeAttribute("aria-current");
    });

    const progress = active < 0 ? 0 : active / Math.max(1, railSections.length - 1);
    railList.style.setProperty("--p", String(progress));
  }

  let scrollTicking = false;
  function onScroll() {
    if (scrollTicking) return;
    scrollTicking = true;
    requestAnimationFrame(() => {
      updateScrollUi();
      scrollTicking = false;
    });
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  updateScrollUi();

  /* ── contact form: Formspree, falls back to a normal POST without JS ── */
  const form = document.getElementById("contactForm");
  const status = document.getElementById("formStatus");

  function setStatus(text, kind) {
    if (!status) return;
    status.textContent = text;
    status.className = "form-status" + (kind ? " " + kind : "");
  }

  const msg = {
    tr: { sending: "Gönderiliyor…", ok: "Mesajınız ulaştı. Teşekkürler.", err: "Bir şeyler ters gitti. Google Form'u deneyin." },
    en: { sending: "Sending…", ok: "Message sent. Thank you.", err: "Something went wrong. Try the Google Form." }
  };

  if (form) {
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const t = msg[root.dataset.lang] || msg.tr;
      const button = form.querySelector("button[type=submit]");

      setStatus(t.sending);
      if (button) button.disabled = true;

      try {
        const res = await fetch(form.action, {
          method: "POST",
          body: new FormData(form),
          headers: { Accept: "application/json" }
        });
        if (!res.ok) throw new Error(String(res.status));
        form.reset();
        setStatus(t.ok, "ok");
      } catch (e) {
        setStatus(t.err, "err");
      } finally {
        if (button) button.disabled = false;
      }
    });
  }
})();
