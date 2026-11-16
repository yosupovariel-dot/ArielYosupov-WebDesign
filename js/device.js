// =========================================================
// DA Web Design | המחשב בפתיחה: הטיה בתלת־ממד לפי העכבר ומסכים מתחלפים
// =========================================================
(function heroDevice() {
  const wrap = document.getElementById('heroDevice');
  if (!wrap) return;
  const device = wrap.querySelector('.device');
  const shots = Array.from(wrap.querySelectorAll('.laptop-screen img'));
  const nameEl = document.getElementById('deviceName');
  const names = shots.map(img => img.getAttribute('src').split('/').pop().replace(/(-2)?\.jpg$/, ''))
    .map(n => ({ 'techno-tech': 'techno-tech.co.il' }[n] || n + '.com'));
  const motionOff = () => matchMedia('(prefers-reduced-motion: reduce)').matches ||
    document.documentElement.classList.contains('a11y-motion');

  // screens change every few seconds
  let i = 0;
  setInterval(() => {
    if (motionOff() || document.hidden) return;
    shots[i].classList.remove('is-on');
    i = (i + 1) % shots.length;
    shots[i].classList.add('is-on');
    if (nameEl) nameEl.textContent = names[i];
  }, 3600);

  // tilt with the pointer (desktop) or gently on its own (touch)
  const hero = wrap.closest('.hero') || document.body;
  const fine = matchMedia('(hover:hover) and (pointer:fine)').matches;
  function set(rx, ry, g) {
    device.style.setProperty('--rx', rx.toFixed(2) + 'deg');
    device.style.setProperty('--ry', ry.toFixed(2) + 'deg');
    wrap.style.setProperty('--g', g.toFixed(1) + '%');
    wrap.querySelectorAll('.glare').forEach(el => el.style.setProperty('--g', g.toFixed(1) + '%'));
  }
  if (fine) {
    hero.addEventListener('pointermove', (e) => {
      if (motionOff()) return;
      const r = hero.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      set(4 - y * 10, -12 + x * 22, 30 + x * 60);
    });
    hero.addEventListener('pointerleave', () => set(4, -12, 30));
  } else {
    let t0 = performance.now();
    (function drift(now) {
      if (!motionOff()) {
        const t = (now - t0) / 1000;
        set(4 + Math.sin(t * 0.6) * 3, -6 + Math.sin(t * 0.4) * 8, 30 + Math.sin(t * 0.4) * 25);
      }
      requestAnimationFrame(drift);
    })(t0);
  }
})();
