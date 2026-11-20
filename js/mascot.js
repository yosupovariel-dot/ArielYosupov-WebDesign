// =========================================================
// DA Web Design | "פיקסל": רובוט קטן בצבעי האתר (כחול כהה, כחול, לבן) עם מנוע ריחוף,
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

  /* ---------- the character: layered artwork (body + two arms) so each part can move ---------- */
  const SRC = document.currentScript && document.currentScript.src;
  const BASE = SRC ? new URL('../assets/mascot/', SRC).href : '/assets/mascot/';
  /* Drawn in the site's own colours: navy, blue, white, one orange accent.
     Separate layers (arms, body, eyelids) so each part can move. */
  const NAVY = '#14213D', BLUE = '#1F5FD1', SKY = '#8DB8FF', ORANGE = '#F2994A';
  const BODY = `
    <svg class="px-img px-body-img" viewBox="0 0 300 276" aria-hidden="true">
      <defs>
        <linearGradient id="pxShell" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFFFFF"/><stop offset="1" stop-color="#E6ECF5"/></linearGradient>
        <radialGradient id="pxCore" cx="40%" cy="35%" r="70%"><stop offset="0" stop-color="#BFD6FF"/><stop offset=".5" stop-color="${BLUE}"/><stop offset="1" stop-color="#1747A0"/></radialGradient>
      </defs>
      <rect x="138" y="156" width="24" height="18" rx="5" fill="#D5DCE8" stroke="${NAVY}" stroke-width="5"/>
      <rect x="104" y="170" width="92" height="64" rx="32" fill="url(#pxShell)" stroke="${NAVY}" stroke-width="6"/>
      <circle cx="150" cy="202" r="11" fill="url(#pxCore)" stroke="${NAVY}" stroke-width="3"/>
      <line x1="150" y1="42" x2="150" y2="18" stroke="${NAVY}" stroke-width="6" stroke-linecap="round"/>
      <circle cx="150" cy="15" r="10" fill="${ORANGE}" stroke="${NAVY}" stroke-width="4"/>
      <circle cx="56" cy="104" r="15" fill="${BLUE}" stroke="${NAVY}" stroke-width="5"/>
      <circle cx="244" cy="104" r="15" fill="${BLUE}" stroke="${NAVY}" stroke-width="5"/>
      <rect x="60" y="40" width="180" height="128" rx="50" fill="url(#pxShell)" stroke="${NAVY}" stroke-width="6"/>
      <path d="M84 60 Q100 48 124 47" fill="none" stroke="#fff" stroke-width="6" stroke-linecap="round" opacity=".9"/>
      <rect x="82" y="62" width="136" height="86" rx="34" fill="${NAVY}"/>
      <ellipse cx="122" cy="100" rx="15" ry="18" fill="#fff"/>
      <ellipse cx="178" cy="100" rx="15" ry="18" fill="#fff"/>
      <circle cx="127" cy="93" r="4.5" fill="${NAVY}" opacity=".18"/>
      <circle cx="183" cy="93" r="4.5" fill="${NAVY}" opacity=".18"/>
      <path class="px-smile" d="M134 124 Q150 139 166 124" fill="none" stroke="${SKY}" stroke-width="5.5" stroke-linecap="round"/>
    </svg>`;
  const ARM_L = `<svg class="px-img px-arm-l" viewBox="0 0 300 276" aria-hidden="true"><path d="M108 192 Q88 202 80 224" fill="none" stroke="${NAVY}" stroke-width="10" stroke-linecap="round"/><circle cx="78" cy="230" r="11" fill="#fff" stroke="${NAVY}" stroke-width="5"/></svg>`;
  const ARM_R = `<svg class="px-img px-arm-r" viewBox="0 0 300 276" aria-hidden="true"><path d="M194 194 Q232 190 250 170" fill="none" stroke="${NAVY}" stroke-width="10" stroke-linecap="round"/><circle cx="254" cy="164" r="11" fill="#fff" stroke="${NAVY}" stroke-width="5"/></svg>`;
  const LIDS = `
    <svg class="px-lids" viewBox="0 0 300 276" aria-hidden="true">
      <defs>
        <clipPath id="pxClipL"><ellipse cx="122" cy="100" rx="16" ry="19"/></clipPath>
        <clipPath id="pxClipR"><ellipse cx="178" cy="100" rx="16" ry="19"/></clipPath>
      </defs>
      <g class="px-blush"><ellipse cx="99" cy="130" rx="11" ry="6" fill="#FF8FA3"/><ellipse cx="201" cy="130" rx="11" ry="6" fill="#FF8FA3"/></g>
      <g clip-path="url(#pxClipL)"><rect class="px-lid" x="104" y="80" width="36" height="50" fill="${NAVY}" transform="translate(0 -50)"/></g>
      <g clip-path="url(#pxClipR)"><rect class="px-lid" x="160" y="80" width="36" height="50" fill="${NAVY}" transform="translate(0 -50)"/></g>
      <path class="px-lash" d="M109 103 Q122 112 135 103" fill="none" stroke="#fff" stroke-width="4.5" stroke-linecap="round"/>
      <path class="px-lash" d="M165 103 Q178 112 191 103" fill="none" stroke="#fff" stroke-width="4.5" stroke-linecap="round"/>
      <path class="px-joy" d="M109 106 Q122 92 135 106" fill="none" stroke="#fff" stroke-width="4.5" stroke-linecap="round"/>
      <path class="px-joy" d="M165 106 Q178 92 191 106" fill="none" stroke="#fff" stroke-width="4.5" stroke-linecap="round"/>
    </svg>`;
  const SVG = `<span class="dp-robot">${ARM_L}${ARM_R}${BODY}</span>`;

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
  bot.innerHTML = `<span class="px-rig"><span class="px-glow"></span>${ARM_L}${ARM_R}${BODY}${LIDS}</span><span class="px-shadow"></span><span class="px-bubble" hidden></span>`;

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
  const glowEl = $('.px-glow'), faceImg = $('.px-body-img'), lidsSvg = $('.px-lids'), smileEl = $('.px-smile');
  const armL = $('.px-arm-l'), armR = $('.px-arm-r');
  const lids = bot.querySelectorAll('.px-lid'), lashes = bot.querySelectorAll('.px-lash'), joys = bot.querySelectorAll('.px-joy'), blush = $('.px-blush');

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
    joyUntil = performance.now() + 900; heart();
    busy = false;
    input.focus();
  }
  function openPanel() {
    panel.hidden = false;
    bot.classList.add('is-open');
    bot.setAttribute('aria-expanded', 'true');
    bubble.hidden = true;
    if (!log.children.length) add('bot', 'היי! אני פיקסל 🤖, הרובוט של DA Web Design. אשמח לענות על כל שאלה על אתרים ועל DA Web Design.');
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
  const W = () => bot.offsetWidth || 120, H = () => bot.offsetHeight || 104;
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
  let joyUntil = 0, blushAmt = 0, hop = 0, nextCharm = performance.now() + 9000, tiltHead = 0;

  /* little hearts that float up when he is happy */
  function heart() {
    if (motionOff()) return;
    const h = document.createElement('span');
    h.className = 'px-heart';
    h.textContent = '♥';
    h.style.setProperty('--dx', `${Math.round((Math.random() - 0.5) * 40)}px`);
    h.style.left = `${40 + Math.random() * 20}%`;
    bot.appendChild(h);
    setTimeout(() => h.remove(), 1400);
  }
  function delight(hearts = 1) {
    joyUntil = performance.now() + 1100;
    wave = 1;
    hop = 1;
    for (let i = 0; i < hearts; i++) setTimeout(heart, i * 180);
  }

  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const lerp = (a, b, k) => a + (b - a) * k;

  function bounds() {
    const small = window.innerWidth < 700;
    // on phones he peeks in from the screen edge so he covers as little text as possible
    return { minX: small ? -W() * 0.32 : 4, maxX: window.innerWidth - W() * (small ? 0.68 : 1) - (small ? 0 : 4), minY: small ? 80 : 96, maxY: window.innerHeight - H() - (small ? 126 : 24) };
  }
  function flightGoal() {
    const b = bounds();
    if (isPhone()) {   // hug the left or right edge, lower half of the screen
      const left = Math.random() < 0.5;
      return { x: left ? b.minX + Math.random() * 8 : b.maxX - Math.random() * 8, y: lerp(b.minY + (b.maxY - b.minY) * 0.45, b.maxY - 60, Math.random()) };
    }
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
  const isPhone = () => window.innerWidth < 700;
  function nextMove(now) {
    if (!isPhone() && Math.random() < 0.55) {
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
    propA += dt * 0.25;
    const flicker = 0.9 + Math.sin(propA * 3.1) * 0.06 + Math.sin(propA * 7.3) * 0.04;
    const glow = clamp(propSpeed * flicker, 0.15, 1.6);
    glowEl.style.transform = `translate(-50%, -50%) scale(${(0.7 + glow * 0.5).toFixed(3)}, ${(0.6 + glow * 0.8).toFixed(3)})`;
    glowEl.style.opacity = clamp(0.3 + glow * 0.5, 0, 1).toFixed(2);

    const swing = mode === 'perch' ? Math.sin(t * 1.4) * 4 : Math.sin(t * 5.2) * 6;
    armLA = lerp(armLA, clamp(-vel.y * 5 - vel.x * 2, -25, 25) + swing, 0.15 * dt);
    let rTarget = clamp(vel.y * 4 + Math.abs(vel.x) * 5, -10, 45) - swing * 0.6;   // tucks in when flying fast
    if (wave > 0) { rTarget = Math.sin(t * 15) * 16 - 6; wave -= 0.006 * dt; }
    armRA = lerp(armRA, rTarget, 0.18 * dt);
    armL.style.transform = `rotate(${armLA.toFixed(1)}deg)`;
    armR.style.transform = `rotate(${armRA.toFixed(1)}deg)`;

    /* eyes: look at the pointer when it is around, otherwise where it is going */
    let lx = clamp(vel.x * 0.4, -1.5, 1.5), ly = clamp(vel.y * 0.3, -1.2, 1.2);
    if (now - pointer.t < 3000) {
      const ex = pointer.x - (pos.x + W() / 2), ey = pointer.y - (pos.y + H() / 2);
      const d = Math.hypot(ex, ey) || 1;
      if (d < 500) { lx = (ex / d) * 1.6 * Math.sign(faceS || 1); ly = (ey / d) * 1.3; }
    }
    lookX = lerp(lookX, lx, 0.15 * dt); lookY = lerp(lookY, ly, 0.15 * dt);
    faceImg.style.transform = `translate(${lookX.toFixed(2)}px, ${lookY.toFixed(2)}px)`;
    lidsSvg.style.transform = faceImg.style.transform;

    /* blinking at random intervals, sometimes twice */
    if (blinkT < 0 && now > blinkAt) blinkT = 0;
    let lid = 0;
    if (blinkT >= 0) {
      blinkT += dt * 16.7;
      lid = blinkT < 70 ? blinkT / 70 : blinkT < 140 ? 1 - (blinkT - 70) / 70 : 0;
      if (blinkT >= 140) { blinkT = -1; blinkAt = now + (Math.random() < 0.2 ? 160 : 2200 + Math.random() * 4200); }
    }
    const joyful = now < joyUntil;
    if (joyful) lid = 1;
    lids.forEach(l => l.setAttribute('transform', `translate(0 ${(-50 + lid * 50).toFixed(2)})`));
    lashes.forEach(l => { l.style.opacity = !joyful && lid > 0.85 ? '1' : '0'; });
    joys.forEach(j => { j.style.opacity = joyful ? '1' : '0'; });
    blushAmt = lerp(blushAmt, joyful || !panel.hidden ? 0.75 : 0.18, 0.08 * dt);
    blush.style.opacity = blushAmt.toFixed(2);

    /* every so often, a small friendly gesture */
    if (now > nextCharm && panel.hidden && mode !== 'fly') {
      const r = Math.random();
      if (r < 0.45) delight(1); else if (r < 0.75) { wave = 1; } else { joyUntil = now + 900; heart(); }
      nextCharm = now + 11000 + Math.random() * 9000;
    }

    if (moodUntil && now > moodUntil) { mood = 'smile'; moodUntil = 0; }
    const sm = mood === 'think' ? 'M138 127 Q150 129 162 127' : (joyful || mood === 'happy' || !panel.hidden) ? 'M130 121 Q150 145 170 121' : 'M134 124 Q150 139 166 124';
    if (smileEl.getAttribute('d') !== sm) smileEl.setAttribute('d', sm);

    /* compose: position, then a rig with facing, bank, squash and a click spin */
    tiltHead = lerp(tiltHead, pointerNear ? clamp(lookX * 6, -10, 10) : 0, 0.1 * dt);
    if (hop > 0) { vel.y -= 1.6 * hop; squashV += 0.05 * hop; hop = 0; }
    if (spin > 0) spin = Math.max(0, spin - 0.035 * dt);
    const spinDeg = (1 - spin) * 360 * (spin > 0 ? 1 : 0);
    const sx = (1 + squash * -0.9) * (faceS < 0 ? -1 : 1) * Math.max(0.25, Math.abs(faceS));
    const sy = 1 + squash;
    bot.style.transform = `translate3d(${(pos.x + hx).toFixed(1)}px, ${(pos.y + hy).toFixed(1)}px, 0)`;
    rig.style.transform = `rotate(${(bank + spinDeg + tiltHead).toFixed(2)}deg) scale(${sx.toFixed(3)}, ${sy.toFixed(3)})`;
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
  let lastHover = 0;
  bot.addEventListener('pointerenter', () => {
    const now = performance.now();
    if (now - lastHover > 2500) { delight(2); lastHover = now; }
  });
  window.addEventListener('resize', () => { const b = bounds(); pos.x = clamp(pos.x, b.minX, b.maxX); pos.y = clamp(pos.y, b.minY, b.maxY); });
  document.addEventListener('a11y-change', () => { if (motionOff()) restingPose(); });

  bot.addEventListener('click', () => {
    if (!panel.hidden) { closePanel(); return; }
    if (!motionOff()) { spin = 1; mood = 'happy'; moodUntil = performance.now() + 1200; delight(3); }
    setTimeout(openPanel, motionOff() ? 0 : 380);
  });

  if (motionOff()) restingPose();
  requestAnimationFrame(frame);

  /* no floating greeting: he just waves when the page opens */
  setTimeout(() => { if (panel.hidden) delight(1); }, 2500);
})();
