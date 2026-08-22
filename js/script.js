// =========================================================
// אריאל יוסופוב — אתר תדמית אישי | אינטראקציות
// =========================================================

document.getElementById('year').textContent = new Date().getFullYear();

/* ---------- glass header on scroll ---------- */
const navEl = document.querySelector('.nav');
function updateNavScroll() {
  navEl?.classList.toggle('scrolled', window.scrollY > 40);
}
updateNavScroll();
window.addEventListener('scroll', updateNavScroll, { passive: true });

/* ---------- accessibility widget ---------- */
(function a11yWidget() {
  const toggle = document.getElementById('a11yToggle');
  const panel = document.getElementById('a11yPanel');
  const closeBtn = document.getElementById('a11yClose');
  if (!toggle || !panel) return;

  const root = document.documentElement;
  const FONT_KEY = 'a11y-font-step';
  const STATE_KEY = 'a11y-state';
  let fontStep = parseInt(localStorage.getItem(FONT_KEY) || '0', 10);
  let state = JSON.parse(localStorage.getItem(STATE_KEY) || '{}');

  function applyFont() {
    root.style.fontSize = fontStep === 0 ? '' : `${100 + fontStep * 10}%`;
  }
  function applyState() {
    root.classList.toggle('a11y-contrast', !!state.contrast);
    root.classList.toggle('a11y-underline', !!state.underline);
    root.classList.toggle('a11y-motion', !!state.motion);
    document.querySelectorAll('.a11y-option').forEach(btn => {
      const key = btn.dataset.a11y;
      if (key && key !== 'reset') btn.classList.toggle('active', !!state[key]);
    });
  }
  applyFont();
  applyState();

  toggle.addEventListener('click', () => {
    const isHidden = panel.hasAttribute('hidden');
    if (isHidden) panel.removeAttribute('hidden'); else panel.setAttribute('hidden', '');
    toggle.setAttribute('aria-expanded', String(isHidden));
  });
  closeBtn?.addEventListener('click', () => {
    panel.setAttribute('hidden', '');
    toggle.setAttribute('aria-expanded', 'false');
  });
  document.addEventListener('click', (e) => {
    if (!panel.contains(e.target) && !toggle.contains(e.target) && !panel.hasAttribute('hidden')) {
      panel.setAttribute('hidden', '');
      toggle.setAttribute('aria-expanded', 'false');
    }
  });

  panel.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-a11y]');
    if (!btn) return;
    const action = btn.dataset.a11y;

    if (action === 'font-inc') fontStep = Math.min(fontStep + 1, 4);
    else if (action === 'font-dec') fontStep = Math.max(fontStep - 1, -2);
    else if (action === 'font-reset') fontStep = 0;
    else if (action === 'reset') {
      fontStep = 0;
      state = {};
    } else {
      state[action] = !state[action];
    }

    localStorage.setItem(FONT_KEY, String(fontStep));
    localStorage.setItem(STATE_KEY, JSON.stringify(state));
    applyFont();
    applyState();
  });
})();

/* ---------- custom cursor ---------- */
const cursorDot = document.querySelector('.cursor-dot');
if (matchMedia('(hover:hover) and (pointer:fine)').matches) {
  window.addEventListener('mousemove', (e) => {
    cursorDot.style.transform = `translate(${e.clientX}px, ${e.clientY}px) translate(-50%,-50%)`;
  });
  document.querySelectorAll('a, button, input, select, .tilt').forEach(el => {
    el.addEventListener('mouseenter', () => {
      cursorDot.style.width = '30px';
      cursorDot.style.height = '30px';
      cursorDot.style.background = 'rgba(47,111,204,.45)';
    });
    el.addEventListener('mouseleave', () => {
      cursorDot.style.width = '14px';
      cursorDot.style.height = '14px';
      cursorDot.style.background = 'var(--lavender-deep)';
    });
  });
}

/* ---------- mobile nav ---------- */
const burger = document.getElementById('burger');
const navLinks = document.querySelector('.nav-links');
burger?.addEventListener('click', () => {
  navLinks.classList.toggle('open');
});
navLinks?.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => navLinks.classList.remove('open'));
});

/* ---------- reveal on scroll ---------- */
const revealEls = document.querySelectorAll('.reveal');
const io = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('in');
      io.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });
revealEls.forEach(el => io.observe(el));

/* ---------- animated counters ---------- */
const counters = document.querySelectorAll('.stat-num');
const counterIO = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const el = entry.target;
    const target = parseInt(el.dataset.count, 10);
    const suffix = el.dataset.suffix || '';
    const duration = 1200;
    const start = performance.now();
    function tick(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(eased * target) + suffix;
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
    counterIO.unobserve(el);
  });
}, { threshold: 0.6 });
counters.forEach(el => counterIO.observe(el));

/* ---------- tilt cards ---------- */
document.querySelectorAll('.tilt').forEach(card => {
  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const rotateX = ((y / rect.height) - 0.5) * -12;
    const rotateY = ((x / rect.width) - 0.5) * 12;
    card.style.transform = `perspective(700px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
  });
  card.addEventListener('mouseleave', () => {
    card.style.transform = 'perspective(700px) rotateX(0) rotateY(0) translateY(0)';
  });
});

/* ---------- magnetic buttons ---------- */
document.querySelectorAll('.magnetic').forEach(btn => {
  btn.addEventListener('mousemove', (e) => {
    const rect = btn.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    btn.style.transform = `translate(${x * 0.25}px, ${y * 0.4}px)`;
  });
  btn.addEventListener('mouseleave', () => {
    btn.style.transform = 'translate(0,0)';
  });
});
