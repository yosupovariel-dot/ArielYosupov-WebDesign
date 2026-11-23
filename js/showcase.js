// =========================================================
// DA Web Design | חלון האתרים בפתיחה: מתחלף לבד, נקודות ניווט, לחיצה פותחת את האתר
// =========================================================
(function showcase() {
  const root = document.getElementById('showcase');
  if (!root) return;
  const slides = Array.from(root.querySelectorAll('.sc-slide'));
  const dots = Array.from(root.querySelectorAll('.sc-dot'));
  const url = document.getElementById('scUrl');
  const name = document.getElementById('scName');
  const motionOff = () => matchMedia('(prefers-reduced-motion: reduce)').matches ||
    document.documentElement.classList.contains('a11y-motion');
  let i = 0, timer = 0, hovering = false;

  function show(k) {
    i = (k + slides.length) % slides.length;
    slides.forEach((s, n) => {
      s.classList.toggle('is-on', n === i);
      s.tabIndex = n === i ? 0 : -1;
    });
    dots.forEach((d, n) => {
      d.classList.toggle('is-on', n === i);
      d.setAttribute('aria-pressed', String(n === i));
    });
    if (url) url.textContent = slides[i].dataset.url;
    if (name) name.textContent = slides[i].dataset.name;
    schedule();
  }
  function schedule() {
    clearTimeout(timer);
    if (motionOff() || hovering || document.hidden) return;
    timer = setTimeout(() => show(i + 1), 4200);
  }
  dots.forEach((d, n) => d.addEventListener('click', () => show(n)));
  root.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse') { hovering = true; clearTimeout(timer); } });
  root.addEventListener('pointerleave', () => { hovering = false; schedule(); });
  document.addEventListener('visibilitychange', schedule);
  show(0);
})();
