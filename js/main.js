// alper erdinç — portfolio js

(function () {

  /* ── CUSTOM CURSOR ── */
  const cursor = document.getElementById('cursor');
  if (cursor && window.matchMedia('(pointer: fine)').matches) {
    document.addEventListener('mousemove', e => {
      cursor.style.left = e.clientX + 'px';
      cursor.style.top  = e.clientY + 'px';
    });
    document.querySelectorAll('a, button, .pill, .project-card').forEach(el => {
      el.addEventListener('mouseenter', () => cursor.classList.add('big'));
      el.addEventListener('mouseleave', () => cursor.classList.remove('big'));
    });
  } else if (cursor) {
    cursor.style.display = 'none';
  }

  /* ── LANG TOGGLE ── */
  let lang = localStorage.getItem('ae_lang') || 'tr';
  const toggleBtn = document.getElementById('langToggle');

  function applyLang(l) {
    lang = l;
    localStorage.setItem('ae_lang', l);
    document.documentElement.setAttribute('lang', l === 'tr' ? 'tr' : 'en');
    if (toggleBtn) toggleBtn.textContent = l === 'tr' ? 'EN' : 'TR';
    document.querySelectorAll('[data-tr]').forEach(el => {
      const val = l === 'tr' ? el.dataset.tr : el.dataset.en;
      if (val !== undefined) el.innerHTML = val;
    });
  }

  if (toggleBtn) toggleBtn.addEventListener('click', () => applyLang(lang === 'tr' ? 'en' : 'tr'));
  applyLang(lang);

  /* ── HAMBURGER ── */
  const hamburger = document.getElementById('navHamburger');
  const mobileMenu = document.getElementById('mobileMenu');
  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', () => mobileMenu.classList.toggle('open'));
    document.addEventListener('click', e => {
      if (!hamburger.contains(e.target) && !mobileMenu.contains(e.target)) {
        mobileMenu.classList.remove('open');
      }
    });
  }

  /* ── SCROLL FADE-IN for project cards ── */
  const cards = document.querySelectorAll('.project-card');
  if ('IntersectionObserver' in window && cards.length) {
    cards.forEach((card, i) => {
      card.style.opacity = '0';
      card.style.transition = `opacity 0.5s ease ${i * 0.07}s, transform 0.15s ease, box-shadow 0.15s ease`;
    });
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) e.target.style.opacity = '1'; });
    }, { threshold: 0.1 });
    cards.forEach(c => obs.observe(c));
  }

  /* ── WOBBLE on logo hover ── */
  const logo = document.querySelector('.nav-logo');
  if (logo) {
    logo.addEventListener('mouseenter', () => {
      logo.style.transform = 'translate(-1px,-1px) rotate(-2deg)';
    });
    logo.addEventListener('mouseleave', () => {
      logo.style.transform = '';
    });
  }

})();
