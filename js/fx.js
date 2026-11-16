// =========================================================
// DA Web Design | חשיפה עדינה של תוכן בגלילה
// =========================================================
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
