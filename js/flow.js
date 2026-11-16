// =========================================================
// DA Web Design | תהליך העבודה כאנימציה אוטומטית (4 שלבים)
// =========================================================
(function flow() {
  const section = document.getElementById('flow');
  const screen = document.getElementById('flowScreen');
  if (!section || !screen) return;
  const buttons = Array.from(section.querySelectorAll('.flow-step'));
  const scenes = Array.from(screen.querySelectorAll('.scene'));
  const STEP_MS = 5200;
  section.style.setProperty('--flow-ms', STEP_MS + 'ms');

  const motionOff = () =>
    matchMedia('(prefers-reduced-motion: reduce)').matches ||
    document.documentElement.classList.contains('a11y-motion');

  let current = 0, timer = 0, startedAt = 0, remaining = STEP_MS, inView = false, hovering = false;

  function restart(el, cls) {
    el.classList.remove(cls);
    void el.offsetWidth; // reflow so CSS animations play again
    el.classList.add(cls);
  }

  function show(i, { fromUser = false } = {}) {
    current = (i + scenes.length) % scenes.length;
    buttons.forEach((b, k) => {
      b.classList.toggle('is-current', k === current);
      b.setAttribute('aria-pressed', String(k === current));
    });
    scenes.forEach((s, k) => { if (k !== current) s.classList.remove('is-on'); });
    restart(scenes[current], 'is-on');
    restart(buttons[current], 'is-current');
    schedule(STEP_MS);
    if (fromUser) buttons[current].focus({ preventScroll: true });
  }

  function schedule(ms) {
    clearTimeout(timer);
    if (motionOff() || !inView || hovering) { remaining = ms; return; }
    remaining = ms;
    startedAt = performance.now();
    timer = setTimeout(() => show(current + 1), ms);
  }
  function pause() {
    if (!timer) return;
    clearTimeout(timer); timer = 0;
    remaining = Math.max(remaining - (performance.now() - startedAt), 300);
    section.classList.add('paused');
  }
  function resume() {
    section.classList.remove('paused');
    if (!motionOff() && inView && !hovering) {
      startedAt = performance.now();
      timer = setTimeout(() => show(current + 1), remaining);
    }
  }

  buttons.forEach((b, k) => b.addEventListener('click', () => show(k, { fromUser: false })));
  const grid = section.querySelector('.flow-grid');
  grid.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse') { hovering = true; pause(); } });
  grid.addEventListener('pointerleave', () => { if (hovering) { hovering = false; resume(); } });

  new IntersectionObserver((entries) => {
    const was = inView;
    inView = entries[0].isIntersecting;
    if (inView && !was) show(current);       // replay the current step when it comes into view
    if (!inView) { clearTimeout(timer); timer = 0; }
  }, { threshold: 0.35 }).observe(grid);

  document.addEventListener('a11y-change', () => { if (motionOff()) { clearTimeout(timer); timer = 0; } });
  show(0);
})();
