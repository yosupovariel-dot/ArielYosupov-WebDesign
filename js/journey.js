// =========================================================
// DA Web Design | פס "השלבים שלכם", חשיפה בגלילה וזרקור על כרטיסים
// =========================================================
(function journey() {
  const bar = document.getElementById('journey');
  const fill = document.getElementById('journeyFill');
  const hero = document.querySelector('.hero');
  const sections = Array.from(document.querySelectorAll('[data-journey]'));
  const links = bar ? Array.from(bar.querySelectorAll('a[data-j]')) : [];

  let raf = 0;
  function update() {
    raf = 0;
    if (!bar) return;
    const heroBottom = hero ? hero.getBoundingClientRect().bottom : 0;
    bar.classList.toggle('is-on', heroBottom < 80);

    const line = window.innerHeight * 0.45;
    let stage = 1;
    sections.forEach(s => { if (s.getBoundingClientRect().top < line) stage = Math.max(stage, Number(s.dataset.journey)); });
    // reaching the form counts as the last stage even if the page ends early
    const lead = document.getElementById('lead');
    if (lead && lead.getBoundingClientRect().top < window.innerHeight * 0.7) stage = 4;
    links.forEach(a => {
      const j = Number(a.dataset.j);
      a.classList.toggle('is-done', j < stage);
      a.classList.toggle('is-current', j === stage);
      if (j === stage) a.setAttribute('aria-current', 'step'); else a.removeAttribute('aria-current');
    });
    const max = document.documentElement.scrollHeight - window.innerHeight;
    if (fill) fill.style.width = `${Math.min(window.scrollY / Math.max(max, 1), 1) * 100}%`;
  }
  const onScroll = () => { if (!raf) raf = requestAnimationFrame(update); };
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  update();
})();

(function reveal() {
  const motionOff = matchMedia('(prefers-reduced-motion: reduce)').matches ||
    document.documentElement.classList.contains('a11y-motion');
  const els = Array.from(document.querySelectorAll('.rv'));
  if (motionOff || !('IntersectionObserver' in window)) return;
  // only hide what starts below the fold, so the first screen is always complete
  const below = els.filter(el => el.getBoundingClientRect().top > window.innerHeight);
  below.forEach(el => el.classList.add('rv-wait'));
  // a plain scroll check: works the same in every browser and frame
  let pending = below.slice();
  let raf = 0;
  function check() {
    raf = 0;
    const limit = window.innerHeight - 40;
    pending = pending.filter(el => {
      if (el.getBoundingClientRect().top < limit) { el.classList.remove('rv-wait'); return false; }
      return true;
    });
    if (!pending.length) window.removeEventListener('scroll', onScroll);
  }
  const onScroll = () => { if (!raf) raf = requestAnimationFrame(check); };
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
})();

(function spotlight() {
  if (!matchMedia('(hover:hover) and (pointer:fine)').matches) return;
  document.querySelectorAll('.plan').forEach(card => {
    card.addEventListener('pointermove', (e) => {
      const r = card.getBoundingClientRect();
      card.style.setProperty('--mx', `${e.clientX - r.left}px`);
      card.style.setProperty('--my', `${e.clientY - r.top}px`);
    });
  });
})();
