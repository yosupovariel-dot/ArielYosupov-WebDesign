// =========================================================
// DA Web Design | העוזר הדיגיטלי: שלוש שאלות והמלצה על סוג האתר
// (תסריט קבוע בדפדפן, בלי שליחת מידע לשום מקום)
// =========================================================
(function assistant() {
  const log = document.getElementById('chatLog');
  const opts = document.getElementById('chatOptions');
  const reset = document.getElementById('chatReset');
  if (!log || !opts) return;
  const motionOff = () => matchMedia('(prefers-reduced-motion: reduce)').matches ||
    document.documentElement.classList.contains('a11y-motion');

  const QUESTIONS = [
    { key: 'biz', text: 'מה סוג העסק שלכם?', options: ['נותני שירות', 'מוכרים מוצרים', 'עצמאי / מקצוע חופשי', 'משהו אחר'] },
    { key: 'goal', text: 'מה הכי חשוב לכם שהאתר יעשה?', options: ['יביא פניות ושיחות', 'ימכור ישירות באתר', 'ישמש לקמפיין ממומן', 'יציג את העסק באמינות'] },
    { key: 'when', text: 'ואחרונה: מתי תרצו לעלות לאוויר?', options: ['כמה שיותר מהר', 'בחודש הקרוב', 'אין לחץ'] },
  ];
  const RECS = {
    landing: { name: 'דף נחיתה', time: 'יומיים', why: 'עמוד ממוקד שמוביל את מי שמגיע מהקמפיין לפעולה אחת: השארת פרטים או שיחה.' },
    site: { name: 'אתר תדמית', time: 'שבוע', why: 'אתר שמציג את העסק באמינות ונותן דרך לפנות אליכם מכל עמוד.' },
    shop: { name: 'חנות אונליין', time: 'שבועיים', why: 'חנות עם ניהול מוצרים, עגלה ותשלום מאובטח, כדי למכור ישירות באתר.' },
  };
  let answers = {}, step = 0, busy = false, started = false;

  function add(cls, html) {
    const el = document.createElement('div');
    el.className = 'msg ' + cls;
    el.innerHTML = html;
    log.appendChild(el);
    log.scrollTop = log.scrollHeight;
    return el;
  }
  const esc = (t) => t.replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  function bot(html, delay = 900) {
    return new Promise(resolve => {
      if (motionOff()) { add('bot', html); return resolve(); }
      const dots = add('bot typing', '<i></i><i></i><i></i>');
      setTimeout(() => { dots.remove(); add('bot', html); resolve(); }, delay);
    });
  }

  function choices(list) {
    opts.innerHTML = '';
    list.forEach(({ label, onClick, main, href }) => {
      const el = document.createElement(href ? 'a' : 'button');
      if (href) el.href = href; else el.type = 'button';
      el.textContent = label;
      if (main) el.className = 'opt-main';
      el.addEventListener('click', onClick);
      opts.appendChild(el);
    });
  }

  function recommend() {
    if (answers.goal === 'ימכור ישירות באתר') return RECS.shop;
    if (answers.goal === 'ישמש לקמפיין ממומן') return RECS.landing;
    if (answers.biz === 'מוכרים מוצרים' && answers.goal !== 'יציג את העסק באמינות') return RECS.shop;
    return RECS.site;
  }

  async function ask() {
    const q = QUESTIONS[step];
    await bot(q.text);
    choices(q.options.map(o => ({
      label: o,
      onClick: () => answer(q.key, o),
    })));
  }

  async function answer(key, value) {
    if (busy) return;
    busy = true;
    opts.innerHTML = '';
    answers[key] = value;
    add('user', esc(value));
    step++;
    if (step < QUESTIONS.length) { await ask(); busy = false; return; }
    const r = recommend();
    await bot('רגע, בודק מה הכי מתאים…', 700);
    await bot(`לפי מה שסיפרתם, הייתי ממליץ על <b>${r.name}</b>. ${r.why} זמן ביצוע משוער: <b>${r.time}</b>.`, 1300);
    await bot('רוצים שנחזור אליכם עם הצעת מחיר? ההמלצה כבר תמולא בטופס.', 800);
    choices([
      { label: 'כן, להשאיר פרטים', main: true, href: '#contact', onClick: () => fillForm(r) },
      { label: 'להתחיל מחדש', onClick: restart },
    ]);
    busy = false;
  }

  function fillForm(r) {
    const select = document.getElementById('lf-type');
    const note = document.getElementById('lf-note');
    if (select) select.value = r.name;
    if (note && !note.value) note.value = `${answers.biz} · ${answers.goal} · ${answers.when}`;
    setTimeout(() => document.getElementById('lf-name')?.focus({ preventScroll: true }), 700);
  }

  async function restart() {
    answers = {}; step = 0; busy = false;
    log.innerHTML = '';
    opts.innerHTML = '';
    add('bot', 'היי! אני העוזר של DA Web Design. אעזור לכם להבין איזה אתר מתאים לעסק, בשלוש שאלות קצרות.');
    await ask();
  }

  reset?.addEventListener('click', restart);
  // first message is there from the start; the questions begin when the chat is on screen
  add('bot', 'היי! אני העוזר של DA Web Design. אעזור לכם להבין איזה אתר מתאים לעסק, בשלוש שאלות קצרות.');
  choices([{ label: 'בואו נתחיל', main: true, onClick: () => { if (!started) { started = true; ask(); } } }]);
  new IntersectionObserver((entries, io) => {
    if (entries[0].isIntersecting && !started) { started = true; io.disconnect(); setTimeout(ask, 600); }
  }, { threshold: 0.6 }).observe(log);
})();
