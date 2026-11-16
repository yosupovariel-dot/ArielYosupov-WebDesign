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
  ship.innerHTML = `<span class="dani-bob">${SVG}</span><span class="dani-bubble" hidden>היי! יש לכם שאלה? 👋</span>`;

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

  /* ---------- gentle flight along the side of the screen ---------- */
  function fly() {
    if (motionOff() || !panel.hidden) return;
    const small = window.innerWidth < 768;
    const top = small ? 0.45 + Math.random() * 0.2 : 0.3 + Math.random() * 0.4; // stay in the side band
    const side = 12 + Math.random() * (small ? 8 : 40);
    ship.style.setProperty('--y', `${Math.round(top * 100)}vh`);
    ship.style.setProperty('--x', `${Math.round(side)}px`);
  }
  fly();
  setInterval(fly, 9000);

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
