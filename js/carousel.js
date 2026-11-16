// =========================================================
// DA Web Design | גלריית אתרים מסתובבת בתלת־ממד (Hero)
// כל מסך הוא קישור אמיתי לאתר. מסך שלא נמצא מקדימה מסתובב קודם לחזית.
// =========================================================
(function siteRing() {
  const stage = document.getElementById('ringStage');
  const ring = document.getElementById('ring');
  if (!stage || !ring) return;
  const items = Array.from(ring.querySelectorAll('.ring-item'));
  const nameEl = document.getElementById('ringName');
  const n = items.length;
  if (!n) return;

  const STEP = (Math.PI * 2) / n;
  const SPIN = 0.16;          // radians per second while idle
  const RESUME_MS = 2600;     // idle time before spinning again

  let angle = 0;              // current rotation of the ring
  let target = null;          // when set, ease toward this angle
  let radius = 380, cardW = 300;
  let pausedUntil = 0, hovering = false, focusInside = false;
  let front = -1;

  const motionOff = () =>
    matchMedia('(prefers-reduced-motion: reduce)').matches ||
    document.documentElement.classList.contains('a11y-motion');

  function measure() {
    const w = stage.clientWidth;
    cardW = Math.round(Math.min(380, Math.max(180, w * 0.56)));
    // distance that keeps neighbours from touching, plus some air
    radius = (cardW / 2) / Math.tan(Math.PI / n) * 1.12;
    items.forEach(el => el.style.setProperty('--w', cardW + 'px'));
    layout();
  }

  function frontIndex() {
    // the item whose angle is closest to facing the viewer
    const k = Math.round(-angle / STEP);
    return ((k % n) + n) % n;
  }

  function layout() {
    const h = cardW * 11 / 16;
    items.forEach((el, i) => {
      const theta = angle + i * STEP;
      const c = Math.cos(theta), s = Math.sin(theta);
      const x = s * radius;
      const z = c * radius - radius;
      const facing = (c + 1) / 2; // 1 = front, 0 = back
      el.style.transform =
        `translate3d(${(x - cardW / 2).toFixed(1)}px, ${(-h / 2).toFixed(1)}px, ${z.toFixed(1)}px) rotateY(${theta.toFixed(4)}rad)`;
      el.style.opacity = (0.18 + 0.82 * Math.pow(facing, 1.6)).toFixed(3);
      el.style.zIndex = String(Math.round(facing * 100));
      el.style.filter = facing > 0.92 ? '' : `brightness(${(0.45 + 0.55 * facing).toFixed(2)})`;
    });
    const f = frontIndex();
    if (f !== front) {
      if (front >= 0) items[front].classList.remove('is-front');
      items[f].classList.add('is-front');
      front = f;
      if (nameEl) nameEl.textContent = items[f].dataset.name || '';
    }
  }

  function goTo(index) {
    // shortest rotation that brings item `index` to the front
    const want = -index * STEP;
    let diff = want - angle;
    diff = Math.atan2(Math.sin(diff), Math.cos(diff));
    target = angle + diff;
    pausedUntil = performance.now() + RESUME_MS;
    if (motionOff()) { angle = target; target = null; layout(); }
    else kick();
  }
  const step = (dir) => goTo(frontIndex() + dir);

  /* ---------- animation loop ---------- */
  let last = 0, running = false, visible = true;
  function tick(now) {
    const dt = Math.min((now - (last || now)) / 1000, 0.05);
    last = now;
    let moving = false;
    if (target !== null) {
      const d = target - angle;
      if (Math.abs(d) < 0.0005) { angle = target; target = null; }
      else { angle += d * Math.min(1, dt * 7); moving = true; }
    } else if (!dragging && !hovering && !focusInside && !motionOff() && now > pausedUntil) {
      angle -= SPIN * dt;
      moving = true;
    }
    layout();
    const keepGoing = visible && (moving || dragging || (!motionOff() && !hovering && !focusInside));
    if (keepGoing) requestAnimationFrame(tick);
    else { running = false; last = 0; }
  }
  function kick() {
    if (running || !visible) return;
    running = true;
    requestAnimationFrame(tick);
  }

  /* ---------- drag to spin ---------- */
  let dragging = false, startX = 0, lastX = 0, moved = 0, velocity = 0;
  stage.addEventListener('pointerdown', (e) => {
    if (e.button !== 0) return;
    dragging = true; moved = 0; velocity = 0;
    startX = lastX = e.clientX;
    target = null;
    stage.classList.add('dragging');
    kick();
  });
  window.addEventListener('pointermove', (e) => {
    if (!dragging) return;
    const dx = e.clientX - lastX;
    lastX = e.clientX;
    moved = Math.max(moved, Math.abs(e.clientX - startX));
    const delta = dx * (Math.PI / (radius * 2.2));
    angle += delta;
    velocity = delta;
  });
  window.addEventListener('pointerup', () => {
    if (!dragging) return;
    dragging = false;
    stage.classList.remove('dragging');
    if (moved > 6) {
      // carry a little momentum, then settle on the nearest screen
      const projected = angle + velocity * 8;
      goTo(Math.round(-projected / STEP));
    }
  });

  /* ---------- clicks: back screens rotate forward, the front one opens ---------- */
  items.forEach((el, i) => {
    el.addEventListener('click', (e) => {
      if (moved > 6) { e.preventDefault(); moved = 0; return; }
      if (i !== frontIndex()) { e.preventDefault(); goTo(i); }
    });
    el.addEventListener('focus', () => { if (i !== frontIndex()) goTo(i); });
    el.addEventListener('dragstart', (e) => e.preventDefault());
  });

  stage.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse') hovering = true; });
  stage.addEventListener('pointerleave', () => { hovering = false; pausedUntil = performance.now() + 800; kick(); });
  ring.addEventListener('focusin', () => { focusInside = true; });
  ring.addEventListener('focusout', () => { focusInside = false; kick(); });

  document.getElementById('ringNext')?.addEventListener('click', () => step(1));
  document.getElementById('ringPrev')?.addEventListener('click', () => step(-1));
  stage.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') { e.preventDefault(); step(1); items[frontIndex()].focus({ preventScroll: true }); }
    if (e.key === 'ArrowRight') { e.preventDefault(); step(-1); items[frontIndex()].focus({ preventScroll: true }); }
  });

  /* ---------- lifecycle ---------- */
  new ResizeObserver(measure).observe(stage);
  new IntersectionObserver((entries) => {
    visible = entries[0].isIntersecting && !document.hidden;
    if (visible) kick();
  }).observe(stage);
  document.addEventListener('visibilitychange', () => { visible = !document.hidden; if (visible) kick(); });
  document.addEventListener('a11y-change', () => { layout(); kick(); });

  measure();
  kick();
})();
