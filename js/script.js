// =========================================================
// DA Web Design | אינטראקציות כלליות
// =========================================================

const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

/* ---------- accessibility widget ---------- */
(function a11yWidget() {
  const toggle = document.getElementById('a11yToggle');
  const panel = document.getElementById('a11yPanel');
  const closeBtn = document.getElementById('a11yClose');
  if (!toggle || !panel) return;

  const root = document.documentElement;
  const FONT_KEY = 'a11y-font-step';
  const STATE_KEY = 'a11y-state';
  const read = (k, fallback) => { try { return localStorage.getItem(k) ?? fallback; } catch { return fallback; } };
  const write = (k, v) => { try { localStorage.setItem(k, v); } catch { /* storage blocked */ } };

  let fontStep = parseInt(read(FONT_KEY, '0'), 10) || 0;
  let state;
  try { state = JSON.parse(read(STATE_KEY, '{}')) || {}; } catch { state = {}; }

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
    document.dispatchEvent(new CustomEvent('a11y-change', { detail: { ...state } }));
  }
  applyFont();
  applyState();

  const close = () => { panel.setAttribute('hidden', ''); toggle.setAttribute('aria-expanded', 'false'); };
  toggle.addEventListener('click', () => {
    const isHidden = panel.hasAttribute('hidden');
    if (isHidden) panel.removeAttribute('hidden'); else panel.setAttribute('hidden', '');
    toggle.setAttribute('aria-expanded', String(isHidden));
  });
  closeBtn?.addEventListener('click', close);
  document.addEventListener('click', (e) => {
    if (!panel.contains(e.target) && !toggle.contains(e.target) && !panel.hasAttribute('hidden')) close();
  });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });

  panel.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-a11y]');
    if (!btn) return;
    const action = btn.dataset.a11y;
    if (action === 'font-inc') fontStep = Math.min(fontStep + 1, 4);
    else if (action === 'font-dec') fontStep = Math.max(fontStep - 1, -2);
    else if (action === 'font-reset') fontStep = 0;
    else if (action === 'reset') { fontStep = 0; state = {}; }
    else state[action] = !state[action];

    write(FONT_KEY, String(fontStep));
    write(STATE_KEY, JSON.stringify(state));
    applyFont();
    applyState();
  });
})();

/* ---------- mobile nav ---------- */
const burger = document.getElementById('burger');
const navLinks = document.querySelector('.nav-links');
burger?.addEventListener('click', () => {
  const open = navLinks.classList.toggle('open');
  burger.setAttribute('aria-expanded', String(open));
});
navLinks?.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => navLinks.classList.remove('open'));
});

/* ---------- portfolio screens follow the pointer in 3D ---------- */
(function screenTilt() {
  const fine = matchMedia('(hover:hover) and (pointer:fine)').matches;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!fine || reduced) return;

  document.querySelectorAll('.p-card').forEach(card => {
    const screen = card.querySelector('.p-screen');
    if (!screen) return;
    let raf = 0;
    card.addEventListener('pointermove', (e) => {
      if (document.documentElement.classList.contains('a11y-motion')) return;
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        screen.style.transform =
          `rotateX(${(-y * 10).toFixed(2)}deg) rotateY(${(x * 14).toFixed(2)}deg) translateZ(40px)`;
      });
    });
    card.addEventListener('pointerleave', () => {
      cancelAnimationFrame(raf);
      screen.style.transform = '';
    });
  });
})();
