// =========================================================
// DA Web Design | "דאני": חייזר בחללית שמרחף בצד המסך ועונה על שאלות
// השאלות נשלחות ל-/api/ask (Claude). כשהשרת לא זמין, יש תשובות מוכנות מראש.
// =========================================================
(function mascot() {
  if (document.getElementById('dani')) return;
  const motionOff = () => matchMedia('(prefers-reduced-motion: reduce)').matches ||
    document.documentElement.classList.contains('a11y-motion');
  const store = {
    get(k) { try { return sessionStorage.getItem(k); } catch { return null; } },
    set(k, v) { try { sessionStorage.setItem(k, v); } catch { /* storage blocked */ } },
  };

  const SVG = `
  <svg viewBox="0 0 120 100" aria-hidden="true">
    <g class="d-beam"><path d="M42 80 L30 100 H90 L78 80 Z" fill="#FFE27A" opacity=".28"/></g>
    <line x1="52" y1="36" x2="46" y2="26" stroke="#57B86E" stroke-width="3" stroke-linecap="round"/>
    <line x1="68" y1="36" x2="74" y2="26" stroke="#57B86E" stroke-width="3" stroke-linecap="round"/>
    <circle cx="46" cy="25" r="4" fill="#F39C12"/><circle cx="74" cy="25" r="4" fill="#F39C12"/>
    <circle cx="60" cy="50" r="19" fill="#7CD992"/>
    <ellipse cx="52" cy="47" rx="6" ry="7" fill="#fff"/><ellipse cx="68" cy="47" rx="6" ry="7" fill="#fff"/>
    <g class="d-pupils"><circle cx="52" cy="48" r="3.2" fill="#1E2A38"/><circle cx="68" cy="48" r="3.2" fill="#1E2A38"/>
      <circle cx="53" cy="46.5" r="1" fill="#fff"/><circle cx="69" cy="46.5" r="1" fill="#fff"/></g>
    <path d="M52 56 Q60 63 68 56" fill="none" stroke="#1E2A38" stroke-width="2.4" stroke-linecap="round"/>
    <circle cx="46" cy="55" r="3" fill="#FF8FA3" opacity=".7"/><circle cx="74" cy="55" r="3" fill="#FF8FA3" opacity=".7"/>
    <g class="d-arm"><path d="M80 56 Q90 48 92 40" fill="none" stroke="#7CD992" stroke-width="5" stroke-linecap="round"/><circle cx="92" cy="39" r="4" fill="#7CD992"/></g>
    <path d="M30 60 A30 30 0 0 1 90 60 Z" fill="#CFEFFF" opacity=".45" stroke="#fff" stroke-width="2"/>
    <ellipse cx="60" cy="68" rx="54" ry="14" fill="#2A7AC0"/>
    <ellipse cx="60" cy="62" rx="40" ry="8" fill="#5BA3E0"/>
    <g class="d-lights"><circle cx="24" cy="70" r="3.4" fill="#FFD54A"/><circle cx="42" cy="75" r="3.4" fill="#F39C12"/>
      <circle cx="60" cy="77" r="3.4" fill="#FFD54A"/><circle cx="78" cy="75" r="3.4" fill="#F39C12"/><circle cx="96" cy="70" r="3.4" fill="#FFD54A"/></g>
  </svg>`;

  const LOCAL = [
    { k: ['מחיר', 'עולה', 'עלות', 'כמה זה', 'תקציב'], a: 'המחיר נקבע לפי סוג האתר וההיקף שלו, ולכן אין מחיר אחיד. אחרי שיחה קצרה תקבלו הצעת מחיר מסודרת וסופית, בלי התחייבות. הכי מהיר: וואטסאפ או 055-6658131.' },
    { k: ['זמן', 'מתי', 'כמה ימים', 'מהר', 'לוקח'], a: 'דף נחיתה מוכן תוך כיומיים, אתר תדמית תוך כשבוע וחנות אונליין תוך כשבועיים. את לוח הזמנים המדויק קובעים בשיחה הראשונה.' },
    { k: ['נחיתה', 'תדמית', 'הבדל', 'מה מתאים'], a: 'דף נחיתה הוא עמוד אחד שמוביל לפעולה אחת, מתאים לקמפיין או למוצר. אתר תדמית מציג את כל העסק בכמה עמודים. אם אתם לא בטוחים, השותפים ישמחו להמליץ בשיחה קצרה.' },
    { k: ['חנות', 'מכירה', 'סליקה', 'תשלום באתר', 'משלוח'], a: 'חנות אונליין כוללת ניהול מוצרים, עגלת קניות, תשלום מאובטח והגדרת משלוחים. היא מוכנה תוך כשבועיים.' },
    { k: ['בעלות', 'שלי', 'שלנו', 'קבצים'], a: 'כן, האתר שייך לכם במלואו: הקבצים, התוכן והגישה לניהול. אין תלות בנו להמשך.' },
    { k: ['דומיין', 'אחסון', 'hosting', 'כתובת'], a: 'אפשר לעזור לכם לקנות ולהגדיר דומיין ואחסון, או לעבוד מול ספק שכבר יש לכם. הכול מוסבר בצורה פשוטה.' },
    { k: ['seo', 'גוגל', 'קידום'], a: 'כל אתר נבנה עם בסיס נכון לקידום בגוגל (SEO): מהירות, מבנה נכון ותגיות מסודרות, כדי שיהיה קל למצוא אתכם.' },
    { k: ['תשלום', 'מקדמה', 'לשלם'], a: 'בדרך כלל יש מקדמה בתחילת העבודה ותשלום נוסף בסיום, לפני שהאתר עולה לאוויר. הכול מסוכם מראש.' },
    { k: ['תמיכה', 'אחרי', 'תיקונים', 'עדכונים'], a: 'כן, השותפים נשארים זמינים גם אחרי ההשקה לתיקונים, עדכונים קטנים ושאלות.' },
    { k: ['קשר', 'טלפון', 'וואטסאפ', 'לדבר', 'פגישה'], a: 'אפשר להתקשר ל-055-6658131 או 054-5791574, לשלוח הודעה בכפתור הוואטסאפ הירוק, או למלא את טופס "צרו קשר" בתחתית דף הבית.' },
    { k: ['עבודות', 'דוגמ', 'תיק', 'פרויקט'], a: 'אפשר לראות עבודות בעמוד "פרויקטים", למשל keterjudah.com (חנות), levmeirisrael.com ו-techno-tech.co.il.' },
  ];
  function localAnswer(q) {
    const t = q.toLowerCase();
    const hit = LOCAL.find(item => item.k.some(k => t.includes(k)));
    return hit ? hit.a : 'שאלה טובה! על זה כדאי לדבר ישירות עם השותפים: וואטסאפ או 055-6658131. הם עונים תוך יום עסקים.';
  }

  /* ---------- build the elements ---------- */
  const ship = document.createElement('button');
  ship.type = 'button';
  ship.id = 'dani';
  ship.className = 'dani';
  ship.setAttribute('aria-label', 'דאני, העוזר של האתר: פתיחת צ\'אט שאלות ותשובות');
  ship.setAttribute('aria-expanded', 'false');
  ship.innerHTML = `<span class="dani-tilt"><span class="dani-bob">${SVG}</span></span><span class="dani-bubble" hidden>היי! יש לכם שאלה? 👋</span>`;

  const panel = document.createElement('div');
  panel.className = 'dani-panel';
  panel.id = 'daniPanel';
  panel.setAttribute('role', 'dialog');
  panel.setAttribute('aria-label', 'שאלות ותשובות עם דאני');
  panel.hidden = true;
  panel.innerHTML = `
    <div class="dp-head">
      <span class="dp-avatar">${SVG}</span>
      <div><b>דאני מהחללית</b><small>עונה בעזרת בינה מלאכותית</small></div>
      <button type="button" class="dp-close" aria-label="סגירת הצ'אט">✕</button>
    </div>
    <div class="dp-log" aria-live="polite"></div>
    <div class="dp-chips">
      <button type="button">כמה עולה אתר?</button>
      <button type="button">כמה זמן זה לוקח?</button>
      <button type="button">דף נחיתה או אתר תדמית?</button>
    </div>
    <form class="dp-form">
      <label for="daniInput" class="sr-only">השאלה שלכם</label>
      <input id="daniInput" type="text" maxlength="400" autocomplete="off" placeholder="כתבו שאלה...">
      <button type="submit" aria-label="שליחה">➤</button>
    </form>
    <p class="dp-note" hidden>מצב תצוגה מקדימה: התשובות כאן מוכנות מראש. באתר החי דאני עונה בעזרת בינה מלאכותית.</p>`;

  document.body.append(ship, panel);
  const log = panel.querySelector('.dp-log');
  const form = panel.querySelector('.dp-form');
  const input = panel.querySelector('#daniInput');
  const chips = panel.querySelector('.dp-chips');
  const note = panel.querySelector('.dp-note');
  const bubble = ship.querySelector('.dani-bubble');
  const history = [];
  let busy = false, apiOk = true;

  function add(cls, text) {
    const el = document.createElement('div');
    el.className = 'dp-msg ' + cls;
    el.textContent = text;
    log.appendChild(el);
    log.scrollTop = log.scrollHeight;
    return el;
  }

  async function ask(question) {
    if (busy || !question.trim()) return;
    busy = true;
    chips.hidden = true;
    add('me', question);
    history.push({ role: 'user', content: question });
    const typing = add('bot typing', '');
    typing.innerHTML = '<i></i><i></i><i></i>';
    let answer = '';
    if (apiOk) {
      try {
        const ctrl = new AbortController();
        const timer = setTimeout(() => ctrl.abort(), 20000);
        const res = await fetch('/api/ask', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ messages: history.slice(-8) }),
          signal: ctrl.signal,
        });
        clearTimeout(timer);
        const data = res.ok ? await res.json() : null;
        if (data && data.answer) answer = data.answer;
        else if (res.status === 429) answer = 'קיבלתי הרבה שאלות בבת אחת 😅 נסו שוב בעוד כמה דקות, או דברו עם השותפים בוואטסאפ.';
        else apiOk = false; // no assistant server here (preview, or not set up yet)
      } catch { apiOk = false; }
    }
    if (!answer) {
      if (!apiOk) note.hidden = false;
      await new Promise(r => setTimeout(r, motionOff() ? 0 : 600));
      answer = localAnswer(question);
    }
    typing.remove();
    add('bot', answer);
    history.push({ role: 'assistant', content: answer });
    busy = false;
    input.focus();
  }

  function open() {
    panel.hidden = false;
    ship.classList.add('is-open');
    ship.setAttribute('aria-expanded', 'true');
    bubble.hidden = true;
    if (!log.children.length) add('bot', 'היי! אני דאני 👽 אשמח לענות על כל שאלה על בניית אתרים ועל DA Web Design.');
    setTimeout(() => input.focus(), 50);
  }
  function close() {
    panel.hidden = true;
    ship.classList.remove('is-open');
    ship.setAttribute('aria-expanded', 'false');
    ship.focus();
  }

  ship.addEventListener('click', () => (panel.hidden ? open() : close()));
  panel.querySelector('.dp-close').addEventListener('click', close);
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !panel.hidden) close(); });
  form.addEventListener('submit', (e) => { e.preventDefault(); const q = input.value; input.value = ''; ask(q); });
  chips.addEventListener('click', (e) => { const b = e.target.closest('button'); if (b) ask(b.textContent); });

  /* ---------- free flight around the page ----------
     Picks a new spot every few seconds, mostly near the edges so it rarely
     covers text, glides there smoothly and tilts in the direction it flies.
     It slows to a stop when the pointer comes close, so it is easy to click. */
  const tilt = ship.querySelector('.dani-tilt');
  let pos = { x: 24, y: window.innerHeight * 0.55 }, target = { ...pos }, vx = 0;
  let pointer = { x: -999, y: -999 }, restUntil = 0, lastT = 0;
  function size() { const r = ship.getBoundingClientRect(); return { w: r.width || 120, h: r.height || 100 }; }
  function pickTarget() {
    const { w, h } = size();
    const W = window.innerWidth, H = window.innerHeight;
    const minY = 90, maxY = H - h - (W < 768 ? 80 : 30), maxX = W - w - 10;
    if (Math.random() < 0.7) {           // along an edge
      const edge = Math.floor(Math.random() * 3);
      if (edge === 0) target = { x: 10 + Math.random() * 40, y: minY + Math.random() * (maxY - minY) };          // left
      else if (edge === 1) target = { x: maxX - Math.random() * 40, y: minY + Math.random() * (maxY - minY) };   // right
      else target = { x: 10 + Math.random() * (maxX - 10), y: maxY - Math.random() * 40 };                      // bottom
    } else {                             // a short trip across the page
      target = { x: 10 + Math.random() * (maxX - 10), y: minY + Math.random() * (maxY - minY) };
    }
    restUntil = performance.now() + 2500 + Math.random() * 3500;
  }
  function place() {
    ship.style.transform = `translate3d(${pos.x.toFixed(1)}px, ${pos.y.toFixed(1)}px, 0)`;
  }
  function step(t) {
    const dt = lastT ? Math.min((t - lastT) / 16.7, 3) : 1;
    lastT = t;
    if (!motionOff() && panel.hidden && !document.hidden) {
      const { w, h } = size();
      const near = Math.hypot(pointer.x - (pos.x + w / 2), pointer.y - (pos.y + h / 2)) < 140;
      const dx = target.x - pos.x, dy = target.y - pos.y;
      const dist = Math.hypot(dx, dy);
      if (!near && dist > 2) {
        const speed = Math.min(2.2, 0.6 + dist / 160) * dt;   // px per frame
        pos.x += (dx / dist) * Math.min(speed, dist);
        pos.y += (dy / dist) * Math.min(speed, dist);
        vx += ((dx / dist) * speed - vx) * 0.1;
      } else {
        vx *= 0.9;
        if (!near && t > restUntil) pickTarget();
      }
      tilt.style.transform = `rotate(${Math.max(-14, Math.min(14, vx * 7)).toFixed(1)}deg)`;
      place();
    }
    requestAnimationFrame(step);
  }
  window.addEventListener('pointermove', (e) => { pointer = { x: e.clientX, y: e.clientY }; }, { passive: true });
  window.addEventListener('resize', () => {
    const { w, h } = size();
    pos.x = Math.min(pos.x, window.innerWidth - w - 10);
    pos.y = Math.min(pos.y, window.innerHeight - h - 30);
    pickTarget(); place();
  });
  place();
  restUntil = performance.now() + 1500;
  requestAnimationFrame(step);

  // eyes follow the pointer a little
  const pupils = ship.querySelector('.d-pupils');
  window.addEventListener('pointermove', (e) => {
    if (motionOff()) return;
    const r = ship.getBoundingClientRect();
    const dx = Math.max(-1, Math.min(1, (e.clientX - (r.left + r.width / 2)) / 300));
    const dy = Math.max(-1, Math.min(1, (e.clientY - (r.top + r.height / 2)) / 300));
    pupils.setAttribute('transform', `translate(${(dx * 2).toFixed(2)} ${(dy * 2).toFixed(2)})`);
  }, { passive: true });

  // one short greeting per visit, then it stays quiet
  if (!store.get('dani-hello')) {
    setTimeout(() => {
      if (!panel.hidden) return;
      bubble.hidden = false;
      store.set('dani-hello', '1');
      setTimeout(() => { bubble.hidden = true; }, 5000);
    }, 7000);
  }
})();
