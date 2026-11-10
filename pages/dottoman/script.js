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

  setMode(store.get("dotto-mode") === "paper" ? "paper" : "ink");
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
      button.replaceChildren(frame);
      button.classList.add("playing");
      button.style.cursor = "default";
    }, { once: true });
  });

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
