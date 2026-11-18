// =========================================================
// DA Web Design | "פיקסל": רובוט-דפדפן קטן עם כובע פרופלור ועיפרון,
// שמטייל באתר, נוחת על חלקים בדף ועונה על שאלות.
// השאלות נשלחות ל-/api/ask (Claude). כשהשרת לא זמין, יש תשובות מוכנות מראש.
// =========================================================
(function pixel() {
  if (document.getElementById('pixel')) return;
  const motionOff = () => matchMedia('(prefers-reduced-motion: reduce)').matches ||
    document.documentElement.classList.contains('a11y-motion');
  const store = {
    get(k) { try { return sessionStorage.getItem(k); } catch { return null; } },
    set(k, v) { try { sessionStorage.setItem(k, v); } catch { /* storage blocked */ } },
  };

  /* ---------- the character (layered so each part can move on its own) ---------- */
  const BODY = `
    <g class="px-legs">
      <g class="px-leg px-leg-l"><path d="M48 86 L46 99" stroke="#1A1918" stroke-width="4" stroke-linecap="round"/><ellipse cx="45" cy="101" rx="6" ry="3.4" fill="#1A1918"/></g>
      <g class="px-leg px-leg-r"><path d="M72 86 L74 99" stroke="#1A1918" stroke-width="4" stroke-linecap="round"/><ellipse cx="75" cy="101" rx="6" ry="3.4" fill="#1A1918"/></g>
    </g>
    <g class="px-arm px-arm-l"><path d="M24 60 Q14 66 10 76" fill="none" stroke="#1A1918" stroke-width="4" stroke-linecap="round"/><circle cx="10" cy="77" r="4.5" fill="#FBFAF7" stroke="#1A1918" stroke-width="2.5"/></g>
    <g class="px-arm px-arm-r">
      <path d="M96 60 Q106 66 110 76" fill="none" stroke="#1A1918" stroke-width="4" stroke-linecap="round"/>
      <g class="px-pencil"><rect x="106" y="62" width="6" height="22" rx="1.5" fill="#E9B44C" stroke="#1A1918" stroke-width="1.8" transform="rotate(-28 109 73)"/><path d="M114.5 82 L118 89 L111 86.5 Z" fill="#1A1918" transform="rotate(-28 109 73)"/></g>
      <circle cx="110" cy="77" r="4.5" fill="#FBFAF7" stroke="#1A1918" stroke-width="2.5"/>
    </g>
    <g class="px-body">
      <rect x="22" y="26" width="76" height="62" rx="13" fill="#FBFAF7" stroke="#1A1918" stroke-width="3"/>
      <path d="M35 27.5 H85 A11.5 11.5 0 0 1 96.5 39 V40.5 H23.5 V39 A11.5 11.5 0 0 1 35 27.5 Z" fill="#C2613F"/>
      <circle cx="32" cy="34" r="2.3" fill="#FBFAF7"/><circle cx="39" cy="34" r="2.3" fill="#FBFAF7"/><circle cx="46" cy="34" r="2.3" fill="#FBFAF7"/>
      <rect x="30" y="44" width="60" height="36" rx="7" fill="#1F1E1B"/>
      <g class="px-face">
        <g class="px-eye px-eye-l"><ellipse cx="48" cy="59" rx="6" ry="6.5" fill="#EDEAE2"/><circle class="px-pupil" cx="48" cy="59.5" r="3" fill="#1A1918"/><circle class="px-glint" cx="49.3" cy="57.8" r="1" fill="#fff"/><rect class="px-lid" x="41" y="51.5" width="14" height="15" fill="#1F1E1B"/></g>
        <g class="px-eye px-eye-r"><ellipse cx="72" cy="59" rx="6" ry="6.5" fill="#EDEAE2"/><circle class="px-pupil" cx="72" cy="59.5" r="3" fill="#1A1918"/><circle class="px-glint" cx="73.3" cy="57.8" r="1" fill="#fff"/><rect class="px-lid" x="65" y="51.5" width="14" height="15" fill="#1F1E1B"/></g>
        <circle cx="41" cy="69" r="2.6" fill="#E07A5F" opacity=".75"/><circle cx="79" cy="69" r="2.6" fill="#E07A5F" opacity=".75"/>
        <path class="px-mouth" d="M53 69 Q60 75 67 69" fill="none" stroke="#E9B44C" stroke-width="2.6" stroke-linecap="round"/>
      </g>
    </g>
    <g class="px-hat">
      <path d="M48 26 Q48 16 60 16 Q72 16 72 26 Z" fill="#1A1918"/>
      <line x1="60" y1="16" x2="60" y2="9" stroke="#1A1918" stroke-width="3"/>
      <g class="px-prop"><ellipse cx="60" cy="8" rx="24" ry="3.6" fill="#C2613F"/><ellipse cx="60" cy="8" rx="24" ry="3.6" fill="none" stroke="#1A1918" stroke-width="1.6"/></g>
      <circle cx="60" cy="8" r="3" fill="#E9B44C" stroke="#1A1918" stroke-width="1.5"/>
    </g>`;
  const SVG = `<svg viewBox="0 0 120 112" aria-hidden="true">${BODY}</svg>`;

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
  const bot = document.createElement('button');
  bot.type = 'button';
  bot.id = 'pixel';
  bot.className = 'pixel';
  bot.setAttribute('aria-label', 'פיקסל, העוזר של האתר: פתיחת צ\'אט שאלות ותשובות');
  bot.setAttribute('aria-expanded', 'false');
  bot.innerHTML = `<span class="px-rig">${SVG}</span><span class="px-shadow"></span><span class="px-bubble" hidden></span>`;

  const panel = document.createElement('div');
  panel.className = 'dani-panel';
  panel.id = 'pixelPanel';
  panel.setAttribute('role', 'dialog');
  panel.setAttribute('aria-label', 'שאלות ותשובות עם פיקסל');
  panel.hidden = true;
  panel.innerHTML = `
    <div class="dp-head">
      <span class="dp-avatar">${SVG}</span>
      <div><b>פיקסל</b><small>עונה בעזרת בינה מלאכותית</small></div>
      <button type="button" class="dp-close" aria-label="סגירת הצ'אט">✕</button>
    </div>
    <div class="dp-log" aria-live="polite"></div>
    <div class="dp-chips">
      <button type="button">כמה עולה אתר?</button>
      <button type="button">כמה זמן זה לוקח?</button>
      <button type="button">דף נחיתה או אתר תדמית?</button>
    </div>
    <form class="dp-form">
      <label for="pixelInput" class="sr-only">השאלה שלכם</label>
      <input id="pixelInput" type="text" maxlength="400" autocomplete="off" placeholder="כתבו שאלה...">
      <button type="submit" aria-label="שליחה">➤</button>
    </form>
    <p class="dp-note" hidden>מצב תצוגה מקדימה: התשובות כאן מוכנות מראש. באתר החי פיקסל עונה בעזרת בינה מלאכותית.</p>`;
  document.body.append(bot, panel);

  const $ = (sel) => bot.querySelector(sel);
  const rig = $('.px-rig'), shadow = $('.px-shadow'), bubble = $('.px-bubble');
  const prop = $('.px-prop'), body = $('.px-body'), hat = $('.px-hat');
  const armL = $('.px-arm-l'), armR = $('.px-arm-r'), legL = $('.px-leg-l'), legR = $('.px-leg-r');
  const pupils = bot.querySelectorAll('.px-pupil'), glints = bot.querySelectorAll('.px-glint');
  const lids = bot.querySelectorAll('.px-lid'), mouth = $('.px-mouth');

  /* ---------- chat ---------- */
  const log = panel.querySelector('.dp-log');
  const form = panel.querySelector('.dp-form');
  const input = panel.querySelector('#pixelInput');
  const chips = panel.querySelector('.dp-chips');
  const note = panel.querySelector('.dp-note');
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
    busy = true; chips.hidden = true;
    add('me', question);
    history.push({ role: 'user', content: question });
    const typing = add('bot typing', '');
    typing.innerHTML = '<i></i><i></i><i></i>';
    mood = 'think';
    let answer = '';
    if (apiOk) {
      try {
        const ctrl = new AbortController();
        const timer = setTimeout(() => ctrl.abort(), 20000);
        const res = await fetch('/api/ask', {
          method: 'POST', headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ messages: history.slice(-8) }), signal: ctrl.signal,
        });
        clearTimeout(timer);
        const data = res.ok ? await res.json() : null;
        if (data && data.answer) answer = data.answer;
        else if (res.status === 429) answer = 'קיבלתי הרבה שאלות בבת אחת 😅 נסו שוב בעוד כמה דקות, או דברו עם השותפים בוואטסאפ.';
        else apiOk = false;
      } catch { apiOk = false; }
    }
    if (!answer) {
      if (!apiOk) note.hidden = false;
      await new Promise(r => setTimeout(r, motionOff() ? 0 : 650));
      answer = localAnswer(question);
    }
    typing.remove();
    add('bot', answer);
    history.push({ role: 'assistant', content: answer });
    mood = 'happy'; moodUntil = performance.now() + 1500;
    busy = false;
    input.focus();
  }
  function openPanel() {
    panel.hidden = false;
    bot.classList.add('is-open');
    bot.setAttribute('aria-expanded', 'true');
    bubble.hidden = true;
    if (!log.children.length) add('bot', 'היי! אני פיקסל 🤖 אני עוזר לבנות אתרים. אשמח לענות על כל שאלה על אתרים ועל DA Web Design.');
    setTimeout(() => input.focus(), 50);
  }
  function closePanel() {
    panel.hidden = true;
    bot.classList.remove('is-open');
    bot.setAttribute('aria-expanded', 'false');
    bot.focus();
  }
  panel.querySelector('.dp-close').addEventListener('click', closePanel);
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !panel.hidden) closePanel(); });
  form.addEventListener('submit', (e) => { e.preventDefault(); const q = input.value; input.value = ''; ask(q); });
  chips.addEventListener('click', (e) => { const b = e.target.closest('button'); if (b) ask(b.textContent); });

  /* =========================================================
     Motion. A small physics model drives everything:
     - steering with acceleration and braking toward a goal
     - banking into turns and turning to face the direction of travel
     - squash and stretch on take-off and landing
     - propeller speed follows effort; arms and legs swing behind the body
     - hover drift from layered sine waves, so it never moves like a loop
     - blinking at random intervals, eyes that follow the pointer
     - landing on parts of the page (cards, headings) to rest, then taking off
     ========================================================= */
  const W = () => bot.offsetWidth || 110, H = () => bot.offsetHeight || 104;
  const pos = { x: 30, y: Math.max(140, window.innerHeight * 0.6) };
  const vel = { x: 0, y: 0 };
  let goal = { x: pos.x, y: pos.y }, perchEl = null, perchDx = 0;
  let mode = 'hover';               // hover | fly | perch
  let modeUntil = performance.now() + 1500;
  let face = 1, faceS = 1, bank = 0, squash = 0, squashV = 0;
  let propA = 0, propSpeed = 0.5, armLA = 0, armRA = 0, legA = 0;
  let pointer = { x: -999, y: -999, t: 0 };
  let blinkAt = performance.now() + 2000, blinkT = -1;
  let mood = 'smile', moodUntil = 0, wave = 0, spin = 0, lookX = 0, lookY = 0;
  let lastT = 0, seed = Math.random() * 100;

  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const lerp = (a, b, k) => a + (b - a) * k;

  function bounds() {
    const small = window.innerWidth < 700;
    return { minX: 6, maxX: window.innerWidth - W() - 6, minY: 96, maxY: window.innerHeight - H() - (small ? 70 : 24) };
  }
  function flightGoal() {
    const b = bounds();
    const r = Math.random();
    if (r < 0.35) return { x: lerp(b.minX, b.minX + 60, Math.random()), y: lerp(b.minY, b.maxY, Math.random()) };
    if (r < 0.7) return { x: lerp(b.maxX - 60, b.maxX, Math.random()), y: lerp(b.minY, b.maxY, Math.random()) };
    return { x: lerp(b.minX, b.maxX, Math.random()), y: lerp(b.maxY - 120, b.maxY, Math.random()) };
  }
  const PERCH = '.statement, .sub-title, .offer, .sc-window, .process-wrap, .media-slot, .contact-card, .section-head h2, .card, .blog-card, .p-card, .faq-list';
  function findPerch() {
    const b = bounds();
    const options = Array.from(document.querySelectorAll(PERCH)).filter(el => {
      const r = el.getBoundingClientRect();
      return r.width > 180 && r.top > b.minY + H() && r.top < b.maxY && r.bottom > 0;
    });
    if (!options.length) return null;
    const el = options[Math.floor(Math.random() * options.length)];
    const r = el.getBoundingClientRect();
    // stand near one end of the top edge, so it rarely covers text
    const atStart = Math.random() < 0.5;
    const x = atStart ? r.left + 10 + Math.random() * 60 : r.right - W() - 10 - Math.random() * 60;
    return { el, dx: clamp(x, b.minX, b.maxX) - r.left };
  }
  function perchPoint() {
    const r = perchEl.getBoundingClientRect();
    return { x: r.left + perchDx, y: r.top - H() + 8 };
  }
  function nextMove(now) {
    if (Math.random() < 0.55) {
      const p = findPerch();
      if (p) { perchEl = p.el; perchDx = p.dx; mode = 'fly'; goal = perchPoint(); return; }
    }
    perchEl = null; mode = 'fly'; goal = flightGoal();
  }
  function land(now) {
    mode = perchEl ? 'perch' : 'hover';
    squashV -= 0.09;                       // soft landing squash
    modeUntil = now + (perchEl ? 4500 + Math.random() * 4000 : 2500 + Math.random() * 2500);
    if (Math.random() < 0.35) { wave = 1; }
  }

  function render(now, dt) {
    const t = now / 1000 + seed;
    const b = bounds();
    const pointerNear = Math.hypot(pointer.x - (pos.x + W() / 2), pointer.y - (pos.y + H() / 2)) < 150 && now - pointer.t < 4000;

    /* goal and mode */
    if (!panel.hidden) { mode = 'hover'; goal = { x: pos.x, y: pos.y }; }
    else if (pointerNear && mode !== 'perch') { goal = { x: pos.x, y: pos.y }; }
    else if (mode === 'perch') {
      if (!perchEl || !perchEl.isConnected) { mode = 'hover'; }
      else {
        const p = perchPoint();
        if (p.y < b.minY || p.y > b.maxY) { perchEl = null; mode = 'hover'; modeUntil = now; squashV += 0.06; }
        else goal = p;
      }
      if (now > modeUntil && !pointerNear) { squashV += 0.08; nextMove(now); }
    } else if (mode === 'fly') {
      if (perchEl) goal = perchPoint();
      if (Math.hypot(goal.x - pos.x, goal.y - pos.y) < 4 && Math.hypot(vel.x, vel.y) < 0.6) land(now);
    } else if (mode === 'hover' && now > modeUntil && !pointerNear) {
      nextMove(now);
    }

    /* steering: accelerate toward the goal, brake inside the arrival radius */
    const dx = goal.x - pos.x, dy = goal.y - pos.y;
    const dist = Math.hypot(dx, dy) || 0.0001;
    const maxSpeed = mode === 'fly' ? 4.2 : 1.2;
    const arrive = Math.min(1, dist / 160);
    const want = { x: (dx / dist) * maxSpeed * arrive, y: (dy / dist) * maxSpeed * arrive };
    const steer = mode === 'perch' ? 0.35 : 0.06;
    const ax = clamp((want.x - vel.x) * steer, -0.25, 0.25);
    const ay = clamp((want.y - vel.y) * steer, -0.25, 0.25);
    vel.x = (vel.x + ax * dt) * Math.pow(0.97, dt);
    vel.y = (vel.y + ay * dt) * Math.pow(0.97, dt);
    pos.x = clamp(pos.x + vel.x * dt, b.minX, b.maxX);
    pos.y = clamp(pos.y + vel.y * dt, b.minY - 60, b.maxY);

    /* hover drift: layered sines (none while standing on something) */
    const drift = mode === 'perch' ? 0 : 1;
    const hx = drift * (Math.sin(t * 0.9) * 3 + Math.sin(t * 2.3) * 1.2);
    const hy = drift * (Math.sin(t * 1.7) * 5 + Math.sin(t * 3.1) * 1.6);

    /* facing and banking */
    if (Math.abs(vel.x) > 0.5) face = vel.x > 0 ? 1 : -1;
    faceS = lerp(faceS, face, 0.12 * dt);
    const targetBank = clamp(vel.x * 4 + ax * 40, -24, 24);
    bank = lerp(bank, targetBank, 0.12 * dt);

    /* squash and stretch as a spring */
    const stretch = clamp(-vel.y * 0.025, -0.08, 0.1);
    squashV += ((stretch) - squash) * 0.18 * dt;
    squashV *= Math.pow(0.78, dt);
    squash += squashV * dt;

    /* parts */
    const effort = mode === 'perch' ? 0.18 : clamp(0.55 + Math.hypot(vel.x, vel.y) * 0.25 - vel.y * 0.15, 0.4, 1.6);
    propSpeed = lerp(propSpeed, effort, 0.05 * dt);
    propA += propSpeed * 0.9 * dt;
    const propScale = Math.max(0.12, Math.abs(Math.cos(propA)));
    prop.setAttribute('transform', `translate(60 8) scale(${propScale.toFixed(3)} 1) translate(-60 -8)`);

    const swing = mode === 'perch' ? Math.sin(t * 1.4) * 4 : Math.sin(t * 5.2) * 6;
    armLA = lerp(armLA, clamp(-vel.y * 6 + vel.x * 3, -35, 35) + swing, 0.15 * dt);
    let rTarget = clamp(-vel.y * 6 - vel.x * 3, -35, 35) - swing;
    if (wave > 0) { rTarget = -95 + Math.sin(t * 16) * 22; wave -= 0.006 * dt; }
    armRA = lerp(armRA, rTarget, 0.18 * dt);
    armL.setAttribute('transform', `rotate(${armLA.toFixed(1)} 24 60)`);
    armR.setAttribute('transform', `rotate(${armRA.toFixed(1)} 96 60)`);
    legA = lerp(legA, mode === 'perch' ? 0 : clamp(-vel.x * 5, -25, 25) + Math.sin(t * 3) * 6, 0.12 * dt);
    legL.setAttribute('transform', `rotate(${(legA).toFixed(1)} 48 86)`);
    legR.setAttribute('transform', `rotate(${(legA * 0.8 + Math.sin(t * 3 + 1) * 3).toFixed(1)} 72 86)`);
    hat.setAttribute('transform', `rotate(${(-bank * 0.25).toFixed(1)} 60 26)`);

    /* eyes: look at the pointer when it is around, otherwise where it is going */
    let lx = clamp(vel.x * 0.6, -2.4, 2.4), ly = clamp(vel.y * 0.5, -2, 2);
    if (now - pointer.t < 3000) {
      const ex = pointer.x - (pos.x + W() / 2), ey = pointer.y - (pos.y + H() / 2);
      const d = Math.hypot(ex, ey) || 1;
      if (d < 500) { lx = (ex / d) * 2.6 * faceS; ly = (ey / d) * 2.2; }
    }
    if (mood === 'think') { lx = 2.2; ly = -2.2; }
    lookX = lerp(lookX, lx, 0.2 * dt); lookY = lerp(lookY, ly, 0.2 * dt);
    pupils.forEach(p => p.setAttribute('transform', `translate(${lookX.toFixed(2)} ${lookY.toFixed(2)})`));
    glints.forEach(g => g.setAttribute('transform', `translate(${(lookX * 0.6).toFixed(2)} ${(lookY * 0.6).toFixed(2)})`));

    /* blinking at random intervals, sometimes twice */
    if (blinkT < 0 && now > blinkAt) blinkT = 0;
    let lid = 0;
    if (blinkT >= 0) {
      blinkT += dt * 16.7;
      lid = blinkT < 70 ? blinkT / 70 : blinkT < 140 ? 1 - (blinkT - 70) / 70 : 0;
      if (blinkT >= 140) { blinkT = -1; blinkAt = now + (Math.random() < 0.2 ? 160 : 2200 + Math.random() * 4200); }
    }
    lids.forEach(l => l.setAttribute('transform', `translate(0 ${(-15 + lid * 15).toFixed(2)})`));

    /* mouth */
    if (moodUntil && now > moodUntil) { mood = 'smile'; moodUntil = 0; }
    const fast = Math.hypot(vel.x, vel.y) > 3.4;
    const m = mood === 'happy' || !panel.hidden ? 'M51 68 Q60 79 69 68' : mood === 'think' ? 'M55 71 Q60 69 65 71' : fast ? 'M56 70 Q60 75 64 70 Q60 67 56 70' : 'M53 69 Q60 75 67 69';
    if (mouth.getAttribute('d') !== m) mouth.setAttribute('d', m);

    /* compose: position, then a rig with facing, bank, squash and a click spin */
    if (spin > 0) spin = Math.max(0, spin - 0.035 * dt);
    const spinDeg = (1 - spin) * 360 * (spin > 0 ? 1 : 0);
    const sx = (1 + squash * -0.9) * (faceS < 0 ? -1 : 1) * Math.max(0.25, Math.abs(faceS));
    const sy = 1 + squash;
    bot.style.transform = `translate3d(${(pos.x + hx).toFixed(1)}px, ${(pos.y + hy).toFixed(1)}px, 0)`;
    rig.style.transform = `rotate(${(bank + spinDeg).toFixed(2)}deg) scale(${sx.toFixed(3)}, ${sy.toFixed(3)})`;
    const ground = mode === 'perch' ? 1 : 0.55;
    shadow.style.opacity = ground.toFixed(2);
    shadow.style.transform = `translateY(${mode === 'perch' ? 0 : 14 + Math.abs(hy)}px) scale(${(mode === 'perch' ? 1 : 0.7 - hy * 0.01).toFixed(2)})`;
  }

  function frame(now) {
    const dt = lastT ? clamp((now - lastT) / 16.7, 0.2, 3) : 1;
    lastT = now;
    if (!document.hidden && !motionOff()) render(now, dt);
    requestAnimationFrame(frame);
  }
  function restingPose() {
    const b = bounds();
    pos.x = b.minX + 10; pos.y = b.maxY - 10;
    bot.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0)`;
    rig.style.transform = 'none';
  }

  window.addEventListener('pointermove', (e) => { pointer = { x: e.clientX, y: e.clientY, t: performance.now() }; }, { passive: true });
  window.addEventListener('resize', () => { const b = bounds(); pos.x = clamp(pos.x, b.minX, b.maxX); pos.y = clamp(pos.y, b.minY, b.maxY); });
  document.addEventListener('a11y-change', () => { if (motionOff()) restingPose(); });

  bot.addEventListener('click', () => {
    if (!panel.hidden) { closePanel(); return; }
    if (!motionOff()) { spin = 1; mood = 'happy'; moodUntil = performance.now() + 1200; }
    setTimeout(openPanel, motionOff() ? 0 : 380);
  });

  if (motionOff()) restingPose();
  requestAnimationFrame(frame);

  /* one short greeting per visit */
  if (!store.get('pixel-hello')) {
    setTimeout(() => {
      if (!panel.hidden) return;
      bubble.textContent = 'היי! אני פיקסל. יש שאלה על אתרים? 👋';
      bubble.hidden = false; wave = 1;
      store.set('pixel-hello', '1');
      setTimeout(() => { bubble.hidden = true; }, 5500);
    }, 6000);
  }
})();
