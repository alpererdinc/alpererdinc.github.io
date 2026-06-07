// ===========================
// ALPER ERDİNÇ — PORTFOLIO JS
// ===========================

(function () {
  let currentLang = localStorage.getItem('ae_lang') || 'tr';
  const langToggle = document.getElementById('langToggle');
  const hamburger = document.getElementById('navHamburger');
  const mobileMenu = document.getElementById('mobileMenu');

  function applyLang(lang) {
    currentLang = lang;
    localStorage.setItem('ae_lang', lang);
    document.documentElement.setAttribute('lang', lang === 'tr' ? 'tr' : 'en');
    if (langToggle) langToggle.textContent = lang === 'tr' ? 'EN' : 'TR';

    document.querySelectorAll('[data-tr]').forEach(el => {
      el.textContent = lang === 'tr' ? el.dataset.tr : el.dataset.en;
    });
  }

  if (langToggle) {
    langToggle.addEventListener('click', () => {
      applyLang(currentLang === 'tr' ? 'en' : 'tr');
    });
  }

  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', () => {
      mobileMenu.classList.toggle('open');
    });
  }

  // Apply on load
  applyLang(currentLang);

  // Intersection Observer for fade-in on project cards
  const cards = document.querySelectorAll('.project-card');
  if ('IntersectionObserver' in window && cards.length) {
    cards.forEach((card, i) => {
      card.style.opacity = '0';
      card.style.transform = 'translateY(24px)';
      card.style.transition = `opacity 0.6s ease ${i * 0.08}s, transform 0.6s ease ${i * 0.08}s, border-color 0.3s, box-shadow 0.3s`;
    });
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.style.opacity = '1';
          e.target.style.transform = 'translateY(0)';
        }
      });
    }, { threshold: 0.1 });
    cards.forEach(c => obs.observe(c));
  }
})();
