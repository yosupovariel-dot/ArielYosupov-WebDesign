// =========================================================
// DA Web Design | אבק זהב עדין ברקע הפתיחה + חשיפה בגלילה
// =========================================================
(function goldDust() {
  const canvas = document.querySelector('.dust');
  if (!canvas || !canvas.getContext) return;
  const ctx = canvas.getContext('2d');
  const motionOff = () => matchMedia('(prefers-reduced-motion: reduce)').matches ||
    document.documentElement.classList.contains('a11y-motion');
  let w = 0, h = 0, dpr = Math.min(window.devicePixelRatio || 1, 2), parts = [], visible = true;

  function size() {
    const r = canvas.getBoundingClientRect();
    w = r.width; h = r.height;
    canvas.width = w * dpr; canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const count = Math.round(Math.min(90, w * h / 9000));
    parts = Array.from({ length: count }, () => ({
      x: Math.random() * w, y: Math.random() * h,
      r: Math.random() * 1.8 + .4,
      vy: -(Math.random() * .25 + .05), vx: (Math.random() - .5) * .15,
      a: Math.random() * .6 + .2, t: Math.random() * Math.PI * 2,
    }));
    draw(0);
  }
  function draw(dt) {
    ctx.clearRect(0, 0, w, h);
    for (const p of parts) {
      if (dt) {
        p.x += p.vx * dt; p.y += p.vy * dt; p.t += .02 * dt;
        if (p.y < -5) { p.y = h + 5; p.x = Math.random() * w; }
        if (p.x < -5) p.x = w + 5; if (p.x > w + 5) p.x = -5;
      }
      const alpha = p.a * (.6 + .4 * Math.sin(p.t));
      ctx.beginPath();
      ctx.fillStyle = `rgba(241, 223, 168, ${alpha.toFixed(3)})`;
      ctx.shadowColor = 'rgba(201,164,76,.9)';
      ctx.shadowBlur = p.r * 4;
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  let last = 0;
  function loop(now) {
    const dt = last ? Math.min((now - last) / 16.7, 3) : 1;
    last = now;
    if (visible && !motionOff()) draw(dt);
    requestAnimationFrame(loop);
  }
  new ResizeObserver(size).observe(canvas);
  new IntersectionObserver(e => { visible = e[0].isIntersecting; }).observe(canvas);
  size();
  requestAnimationFrame(loop);
})();

(function reveal() {
  const motionOff = matchMedia('(prefers-reduced-motion: reduce)').matches ||
    document.documentElement.classList.contains('a11y-motion');
  if (motionOff) return;
  const els = Array.from(document.querySelectorAll('.title, .service, .p-card, .price-box, .howto, .howto-panel, .faq-item, .lead-form, .contact-info, .assistant-copy, .chat'));
  let pending = els.filter(el => el.getBoundingClientRect().top > window.innerHeight);
  pending.forEach((el, i) => { el.classList.add('rv-wait', 'rv-in'); el.style.transitionDelay = `${(i % 3) * 90}ms`; });
  let raf = 0;
  function check() {
    raf = 0;
    const limit = window.innerHeight - 30;
    pending = pending.filter(el => {
      if (el.getBoundingClientRect().top < limit) { el.classList.remove('rv-wait'); return false; }
      return true;
    });
  }
  const on = () => { if (!raf) raf = requestAnimationFrame(check); };
  window.addEventListener('scroll', on, { passive: true });
  window.addEventListener('resize', on);
})();
