// =========================================================
// DA Web Design | מודל "מבט מבפנים": השכבות נפרדות בגלילה
// =========================================================
(function anatomy() {
  const section = document.getElementById('anatomy');
  const stack = document.getElementById('stack');
  if (!section || !stack) return;
  const layers = Array.from(stack.querySelectorAll('.layer'));
  const items = Array.from(section.querySelectorAll('.anatomy-list li'));
  const small = () => window.innerWidth < 560;
  const motionOff = () =>
    matchMedia('(prefers-reduced-motion: reduce)').matches ||
    document.documentElement.classList.contains('a11y-motion');

  let raf = 0;
  function update() {
    raf = 0;
    const max = small() ? 48 : 92, min = small() ? 10 : 14;
    if (motionOff()) { stack.style.setProperty('--gap', max + 'px'); return; }
    const r = section.getBoundingClientRect();
    const vh = window.innerHeight;
    // 0 when the section enters from below, 1 when its middle reaches the upper third
    const p = Math.min(Math.max((vh - r.top) / (vh * 0.75 + r.height * 0.25), 0), 1);
    const eased = 1 - Math.pow(1 - p, 2);
    stack.style.setProperty('--gap', (min + (max - min) * eased).toFixed(1) + 'px');
  }
  const onScroll = () => { if (!raf) raf = requestAnimationFrame(update); };
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  document.addEventListener('a11y-change', onScroll);
  update();

  function activate(idx) {
    layers.forEach((l, i) => l.classList.toggle('is-active', i === idx));
    items.forEach(li => li.classList.toggle('is-active', Number(li.dataset.layer) === idx));
  }
  items.forEach(li => {
    const idx = Number(li.dataset.layer);
    li.addEventListener('pointerenter', () => activate(idx));
    li.addEventListener('pointerleave', () => activate(-1));
    li.addEventListener('click', () => activate(idx));
  });
})();
