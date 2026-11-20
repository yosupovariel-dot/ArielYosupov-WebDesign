// =========================================================
// DA Web Design | "איך זה עובד": מעבר אוטומטי בין 4 השלבים
// =========================================================
(function howto() {
  const list = document.getElementById('howto');
  const panel = document.getElementById('howtoPanel');
  const bar = document.getElementById('howtoBar');
  if (!list || !panel) return;
  const items = Array.from(list.querySelectorAll('li'));
  const panes = Array.from(panel.querySelectorAll('.hp'));
  const STEP_MS = 4500;
  const motionOff = () => matchMedia('(prefers-reduced-motion: reduce)').matches ||
    document.documentElement.classList.contains('a11y-motion');
  let current = 0, timer = 0, hovering = false, inView = false;

  function show(i) {
    current = (i + items.length) % items.length;
    items.forEach((li, k) => {
      li.classList.toggle('is-current', k === current);
      li.classList.toggle('is-done', k < current);
    });
    panes.forEach((p, k) => p.classList.toggle('is-current', k === current));
    run();
  }
  function run() {
    clearTimeout(timer);
    bar.style.transition = 'none';
    bar.style.width = '0';
    if (motionOff() || hovering || !inView) return;
    void bar.offsetWidth;
    bar.style.transition = `width ${STEP_MS}ms linear`;
    bar.style.width = '100%';
    timer = setTimeout(() => show(current + 1), STEP_MS);
  }

  items.forEach((li, k) => li.querySelector('button').addEventListener('click', () => show(k)));
  [list, panel].forEach(el => {
    el.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse') { hovering = true; run(); } });
    el.addEventListener('pointerleave', () => { hovering = false; run(); });
  });
  new IntersectionObserver((entries) => {
    inView = entries[0].isIntersecting;
    run();
  }, { threshold: 0.4 }).observe(panel);
  show(0);
})();
