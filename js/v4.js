// =========================================================
// DA Web Design | Why / How / What pill, media slots, gentle reveals
// =========================================================
(function chapters() {
  const pill = document.getElementById('gc');
  if (!pill) return;
  const links = Array.from(pill.querySelectorAll('a[data-gc]'));
  const order = links.map(a => a.dataset.gc);
  const sections = order.map(k => document.querySelector(`[data-gc-section="${k}"]`));
  let raf = 0;
  function update() {
    raf = 0;
    const line = window.innerHeight * 0.4;
    let current = -1;
    sections.forEach((s, i) => { if (s && s.getBoundingClientRect().top < line) current = i; });
    links.forEach((a, i) => {
      a.classList.toggle('is-current', i === current);
      a.classList.toggle('is-done', i < current);
      if (i === current) a.setAttribute('aria-current', 'step'); else a.removeAttribute('aria-current');
    });
  }
  window.addEventListener('scroll', () => { if (!raf) raf = requestAnimationFrame(update); }, { passive: true });
  update();
})();

(function navBorder() {
  const nav = document.querySelector('.nav');
  if (!nav) return;
  const set = () => nav.classList.toggle('scrolled', window.scrollY > 10);
  window.addEventListener('scroll', set, { passive: true });
  set();
})();

/* Media slots: files listed in assets/media/manifest.json replace their placeholders. */
(function mediaSlots() {
  const slots = Array.from(document.querySelectorAll('.media-slot[data-file]'));
  if (!slots.length) return;
  const base = (document.querySelector('script[src$="js/v4.js"]')?.getAttribute('src') || '').replace(/js\/v4\.js$/, '');
  fetch(base + 'assets/media/manifest.json', { cache: 'no-cache' })
    .then(r => (r.ok ? r.json() : { files: [] }))
    .catch(() => ({ files: [] }))
    .then(({ files = [] }) => {
      slots.forEach((slot) => {
        const file = slot.dataset.file;
        if (!files.includes(file.split('/').pop())) return;
        const src = base + file;
        const isVideo = /\.(mp4|webm|mov)$/i.test(file);
        const el = document.createElement(isVideo ? 'video' : 'img');
        el.src = src;
        if (isVideo) { el.controls = true; el.playsInline = true; el.preload = 'metadata'; }
        else { el.alt = slot.querySelector('figcaption b')?.textContent || ''; el.loading = 'lazy'; }
        slot.replaceChildren(el);
        slot.classList.add('is-filled');
      });
    });
})();

(function reveal() {
  const off = matchMedia('(prefers-reduced-motion: reduce)').matches ||
    document.documentElement.classList.contains('a11y-motion');
  return; // reveals switched off: content is simply there
  const els = Array.from(document.querySelectorAll('.chapter, .statement, .beliefs li, .principles article, .process-wrap, .offer, .proof, .voices .media-slot, .faq-item, .lead-form, .media-short'));
  let pending = els.filter(el => el.getBoundingClientRect().top > window.innerHeight);
  pending.forEach((el, i) => { el.classList.add('rv-wait', 'rv-in'); el.style.transitionDelay = `${(i % 4) * 70}ms`; });
  let raf = 0;
  function check() {
    raf = 0;
    const limit = window.innerHeight - 40;
    pending = pending.filter(el => {
      if (el.getBoundingClientRect().top < limit) { el.classList.remove('rv-wait'); return false; }
      return true;
    });
  }
  window.addEventListener('scroll', () => { if (!raf) raf = requestAnimationFrame(check); }, { passive: true });
})();

/* rotating word in the headline */
(function rotator() {
  const root = document.getElementById('rotator');
  if (!root) return;
  const words = Array.from(root.querySelectorAll('.rot-word'));
  const off = () => matchMedia('(prefers-reduced-motion: reduce)').matches ||
    document.documentElement.classList.contains('a11y-motion');
  // size the slot to the widest word so the line never jumps
  const fit = () => { root.style.width = Math.max(...words.map(w => w.scrollWidth)) + 'px'; };
  fit(); window.addEventListener('resize', fit);
  document.fonts && document.fonts.ready.then(fit);
  let i = 0;
  setInterval(() => {
    if (off() || document.hidden) return;
    const cur = words[i];
    i = (i + 1) % words.length;
    const next = words[i];
    cur.classList.remove('is-on'); cur.classList.add('is-out');
    next.classList.remove('is-out'); next.classList.add('is-on');
    setTimeout(() => cur.classList.remove('is-out'), 650);
  }, 2600);
})();

/* progress line under the why/how/what bar */
(function subnavFill() {
  const fill = document.getElementById('subnavFill');
  if (!fill) return;
  let raf = 0;
  const set = () => {
    raf = 0;
    const max = document.documentElement.scrollHeight - innerHeight;
    fill.style.transform = `scaleX(${Math.min(scrollY / Math.max(max, 1), 1).toFixed(4)})`;
  };
  addEventListener('scroll', () => { if (!raf) raf = requestAnimationFrame(set); }, { passive: true });
  set();
})();

/* hero background: crossfade between client sites */
(function heroBg() {
  const layers = Array.from(document.querySelectorAll('.hero-bg .hb'));
  if (layers.length < 2) return;
  const off = () => matchMedia('(prefers-reduced-motion: reduce)').matches ||
    document.documentElement.classList.contains('a11y-motion');
  let i = 0;
  setInterval(() => {
    if (off() || document.hidden) return;
    layers[i].classList.remove('is-on');
    i = (i + 1) % layers.length;
    layers[i].classList.add('is-on');
  }, 5500);
})();
