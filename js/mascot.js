// =========================================================
// DA Web Design | "פיקסל": רובוט כדור חמוד עם כיפת זכוכית ומנוע ריחוף,
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
    <defs>
      <radialGradient id="pxBody" cx="38%" cy="30%" r="75%"><stop offset="0" stop-color="#8DBBE3"/><stop offset=".55" stop-color="#4F82B3"/><stop offset="1" stop-color="#2C5680"/></radialGradient>
      <radialGradient id="pxFace" cx="45%" cy="35%" r="70%"><stop offset="0" stop-color="#9CCAEC"/><stop offset=".7" stop-color="#5E93C4"/><stop offset="1" stop-color="#3F6F9E"/></radialGradient>
      <radialGradient id="pxIris" cx="50%" cy="45%" r="60%"><stop offset="0" stop-color="#5A8FD8"/><stop offset=".6" stop-color="#26407A"/><stop offset="1" stop-color="#121D3C"/></radialGradient>
      <linearGradient id="pxMetal" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7FA6C9"/><stop offset="1" stop-color="#3A6189"/></linearGradient>
      <radialGradient id="pxGlow" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#E8FFFF"/><stop offset=".45" stop-color="#7FE6F7"/><stop offset="1" stop-color="#7FE6F7" stop-opacity="0"/></radialGradient>
      <clipPath id="pxEyeL"><ellipse cx="51" cy="62" rx="11.5" ry="12.5"/></clipPath><clipPath id="pxEyeR"><ellipse cx="89" cy="62" rx="11.5" ry="12.5"/></clipPath>
      <radialGradient id="pxCheek" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#F28B8B" stop-opacity=".85"/><stop offset="1" stop-color="#F28B8B" stop-opacity="0"/></radialGradient>
    </defs>
    <g class="px-legs"><g class="px-leg px-leg-l"></g><g class="px-leg px-leg-r"></g></g>
    <g class="px-prop"><ellipse cx="70" cy="130" rx="26" ry="9" fill="url(#pxGlow)"/><path d="M58 122 L82 122 L76 138 L64 138 Z" fill="url(#pxGlow)" opacity=".7"/></g>
    <g class="px-arm px-arm-l">
      <path d="M26 86 Q14 92 12 104" fill="none" stroke="#3A6189" stroke-width="8" stroke-linecap="round"/>
      <path d="M26 86 Q14 92 12 104" fill="none" stroke="#6E9CC6" stroke-width="4" stroke-linecap="round"/>
      <g transform="translate(11 107)"><ellipse rx="7.5" ry="7" fill="#5C8DBD" stroke="#3A6189" stroke-width="1.6"/><ellipse cx="-6.5" cy="-2" rx="2.6" ry="3.6" fill="#5C8DBD" stroke="#3A6189" stroke-width="1.4"/><path d="M-3 4 L-3 7 M1 4.5 L1 7.5 M4.5 3.5 L4.5 6.5" stroke="#3A6189" stroke-width="1.6" stroke-linecap="round"/></g>
    </g>
    <g class="px-arm px-arm-r">
      <path d="M114 84 Q126 90 128 102" fill="none" stroke="#3A6189" stroke-width="8" stroke-linecap="round"/>
      <path d="M114 84 Q126 90 128 102" fill="none" stroke="#6E9CC6" stroke-width="4" stroke-linecap="round"/>
      <g transform="translate(129 105)"><ellipse rx="7.5" ry="7" fill="#5C8DBD" stroke="#3A6189" stroke-width="1.6"/><ellipse cx="6.5" cy="-2" rx="2.6" ry="3.6" fill="#5C8DBD" stroke="#3A6189" stroke-width="1.4"/><path d="M3 4 L3 7 M-1 4.5 L-1 7.5 M-4.5 3.5 L-4.5 6.5" stroke="#3A6189" stroke-width="1.6" stroke-linecap="round"/></g>
    </g>
    <g class="px-body">
      <circle cx="70" cy="72" r="48" fill="url(#pxBody)"/>
      <path d="M36 100 Q70 114 104 100" fill="none" stroke="#2C5680" stroke-width="1.4" opacity=".6"/>
      <path d="M64 96 L64 112 M84 95 L82 110" stroke="#2C5680" stroke-width="1.4" opacity=".5"/>
      <rect x="86" y="88" width="10" height="7" rx="2" fill="#46739F" stroke="#2C5680" stroke-width="1"/>
      <ellipse cx="70" cy="116" rx="17" ry="5.5" fill="#2A4F78"/>
      <ellipse cx="70" cy="115" rx="11" ry="3.4" fill="#BDF6FF"/>
      <circle cx="70" cy="66" r="40" fill="url(#pxFace)"/>
      <path d="M24 84 Q70 100 116 84 L116 90 Q70 106 24 90 Z" fill="url(#pxMetal)" stroke="#2C5680" stroke-width="1.2"/>
      <g fill="#2C5680"><circle cx="34" cy="89" r="1.4"/><circle cx="48" cy="93" r="1.4"/><circle cx="62" cy="95" r="1.4"/><circle cx="78" cy="95" r="1.4"/><circle cx="92" cy="93" r="1.4"/><circle cx="106" cy="89" r="1.4"/></g>
      <g fill="#fff" opacity=".7"><circle cx="46" cy="40" r=".9"/><circle cx="52" cy="46" r=".6"/><circle cx="40" cy="52" r=".7"/><path d="M58 38 l1 2.4 2.4 1 -2.4 1 -1 2.4 -1 -2.4 -2.4 -1 2.4 -1z"/></g>
      <g class="px-face">
        <path d="M44 47 Q50 43 56 46" fill="none" stroke="#2E5A86" stroke-width="2.2" stroke-linecap="round"/>
        <path d="M84 46 Q90 43 96 47" fill="none" stroke="#2E5A86" stroke-width="2.2" stroke-linecap="round"/>
        <g class="px-eye px-eye-l">
          <ellipse cx="51" cy="62" rx="11" ry="12" fill="#152447"/>
          <g class="px-pupil"><ellipse cx="51" cy="63" rx="8.6" ry="9.6" fill="url(#pxIris)"/><circle cx="48" cy="67" r="1" fill="#B9D8FF"/><circle cx="55" cy="68" r=".8" fill="#B9D8FF"/></g>
          <g class="px-glint"><circle cx="54.5" cy="57.5" r="4" fill="#fff"/><circle cx="47" cy="66" r="1.8" fill="#fff"/></g>
          <g clip-path="url(#pxEyeL)"><rect class="px-lid" x="38" y="49" width="26" height="27" fill="#6FA4D2"/></g>
        </g>
        <g class="px-eye px-eye-r">
          <ellipse cx="89" cy="62" rx="11" ry="12" fill="#152447"/>
          <g class="px-pupil"><ellipse cx="89" cy="63" rx="8.6" ry="9.6" fill="url(#pxIris)"/><circle cx="86" cy="67" r="1" fill="#B9D8FF"/><circle cx="93" cy="68" r=".8" fill="#B9D8FF"/></g>
          <g class="px-glint"><circle cx="92.5" cy="57.5" r="4" fill="#fff"/><circle cx="85" cy="66" r="1.8" fill="#fff"/></g>
          <g clip-path="url(#pxEyeR)"><rect class="px-lid" x="76" y="49" width="26" height="27" fill="#6FA4D2"/></g>
        </g>
        <ellipse cx="38" cy="76" rx="8" ry="5" fill="url(#pxCheek)"/>
        <ellipse cx="102" cy="76" rx="8" ry="5" fill="url(#pxCheek)"/>
        <clipPath id="pxMouthClip"><path class="px-mouth-clip" d="M60 73 Q70 89 80 73 Q70 77 60 73 Z"/></clipPath><path class="px-mouth" d="M60 73 Q70 89 80 73 Q70 77 60 73 Z" fill="#7A2430" stroke="#4A1A24" stroke-width="1.2" stroke-linejoin="round"/><ellipse cx="70" cy="85" rx="7" ry="5" fill="#E8707A" clip-path="url(#pxMouthClip)"/>
      </g>
      <circle cx="26" cy="68" r="8" fill="url(#pxMetal)" stroke="#2C5680" stroke-width="1.2"/><circle cx="26" cy="68" r="3.6" fill="#5C8DBD" stroke="#2C5680" stroke-width="1"/>
      <circle cx="114" cy="68" r="8" fill="url(#pxMetal)" stroke="#2C5680" stroke-width="1.2"/><circle cx="114" cy="68" r="3.6" fill="#5C8DBD" stroke="#2C5680" stroke-width="1"/>
      <path d="M26 64 A44 44 0 0 1 114 64" fill="#DFF3FF" opacity=".16" stroke="#E9F7FF" stroke-width="1.6" stroke-opacity=".7"/>
      <path d="M36 40 Q48 24 70 22" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity=".6"/><path d="M30 56 Q31 48 35 43" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".4"/>
      <ellipse cx="92" cy="30" rx="7" ry="4" fill="#fff" opacity=".35" transform="rotate(25 92 30)"/>
    </g>
    <g class="px-hat">
      <ellipse cx="42" cy="27" rx="11" ry="6" fill="url(#pxMetal)" stroke="#2C5680" stroke-width="1.2" transform="rotate(-35 42 27)"/>
      <ellipse cx="40" cy="23" rx="8" ry="4.4" fill="#5C8DBD" stroke="#2C5680" stroke-width="1.2" transform="rotate(-35 40 23)"/>
      <circle cx="40" cy="23" r="1.6" fill="#2C5680"/>
    </g>`;
  const SVG = `<svg viewBox="0 0 140 140" aria-hidden="true">${BODY}</svg>`;

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
  const lids = bot.querySelectorAll('.px-lid'), mouth = $('.px-mouth'), mouthClip = $('.px-mouth-clip');

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
    propA += dt * 0.25;
    const flicker = 0.9 + Math.sin(propA * 3.1) * 0.06 + Math.sin(propA * 7.3) * 0.04;
    const glow = clamp(propSpeed * flicker, 0.15, 1.6);
    prop.setAttribute('transform', `translate(70 118) scale(${(0.6 + glow * 0.45).toFixed(3)} ${(0.4 + glow * 0.7).toFixed(3)}) translate(-70 -118)`);
    prop.style.opacity = clamp(0.25 + glow * 0.55, 0, 1).toFixed(2);

    const swing = mode === 'perch' ? Math.sin(t * 1.4) * 4 : Math.sin(t * 5.2) * 6;
    armLA = lerp(armLA, clamp(-vel.y * 6 + vel.x * 3, -35, 35) + swing, 0.15 * dt);
    let rTarget = clamp(-vel.y * 6 - vel.x * 3, -35, 35) - swing;
    if (wave > 0) { rTarget = -95 + Math.sin(t * 16) * 22; wave -= 0.006 * dt; }
    armRA = lerp(armRA, rTarget, 0.18 * dt);
    armL.setAttribute('transform', `rotate(${armLA.toFixed(1)} 26 86)`);
    armR.setAttribute('transform', `rotate(${armRA.toFixed(1)} 114 84)`);
    legA = lerp(legA, mode === 'perch' ? 0 : clamp(-vel.x * 5, -25, 25) + Math.sin(t * 3) * 6, 0.12 * dt);
    
    hat.setAttribute('transform', `rotate(${(-bank * 0.3).toFixed(1)} 70 70)`);

    /* eyes: look at the pointer when it is around, otherwise where it is going */
    let lx = clamp(vel.x * 0.6, -2.4, 2.4), ly = clamp(vel.y * 0.5, -2, 2);
    if (now - pointer.t < 3000) {
      const ex = pointer.x - (pos.x + W() / 2), ey = pointer.y - (pos.y + H() / 2);
      const d = Math.hypot(ex, ey) || 1;
      if (d < 500) { lx = (ex / d) * 2.6 * faceS; ly = (ey / d) * 2.2; }
    }
    if (mood === 'think') { lx = 2.2; ly = -2.2; }
    lookX = lerp(lookX, lx, 0.2 * dt); lookY = lerp(lookY, ly, 0.2 * dt);
    pupils.forEach(p => p.setAttribute('transform', `translate(${(lookX * 0.9).toFixed(2)} ${(lookY * 0.9).toFixed(2)})`));
    glints.forEach(g => g.setAttribute('transform', `translate(${(lookX * 0.6).toFixed(2)} ${(lookY * 0.6).toFixed(2)})`));

    /* blinking at random intervals, sometimes twice */
    if (blinkT < 0 && now > blinkAt) blinkT = 0;
    let lid = 0;
    if (blinkT >= 0) {
      blinkT += dt * 16.7;
      lid = blinkT < 70 ? blinkT / 70 : blinkT < 140 ? 1 - (blinkT - 70) / 70 : 0;
      if (blinkT >= 140) { blinkT = -1; blinkAt = now + (Math.random() < 0.2 ? 160 : 2200 + Math.random() * 4200); }
    }
    lids.forEach(l => l.setAttribute('transform', `translate(0 ${(-27 + lid * 27).toFixed(2)})`));

    /* mouth */
    if (moodUntil && now > moodUntil) { mood = 'smile'; moodUntil = 0; }
    const fast = Math.hypot(vel.x, vel.y) > 3.4;
    const m = mood === 'happy' || !panel.hidden ? 'M57 72 Q70 93 83 72 Q70 77 57 72 Z' : mood === 'think' ? 'M64 77 Q70 75 76 77 Q70 79 64 77 Z' : fast ? 'M64 73 Q70 86 76 73 Q70 69 64 73 Z' : 'M60 73 Q70 89 80 73 Q70 77 60 73 Z';
    if (mouth.getAttribute('d') !== m) { mouth.setAttribute('d', m); mouthClip && mouthClip.setAttribute('d', m); }

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
