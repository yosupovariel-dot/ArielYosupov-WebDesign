// =========================================================
// DA Web Design | שאלון "איזה אתר מתאים לכם?"
// שלוש שאלות, המלצה, וסיכום מוכן לשליחה בוואטסאפ
// =========================================================
(function quiz() {
  const form = document.getElementById('quizForm');
  if (!form) return;
  const steps = Array.from(form.querySelectorAll('.quiz-step'));
  const bar = document.getElementById('quizBar');
  const back = document.getElementById('quizBack');
  const hint = document.getElementById('quizHint');
  const result = document.getElementById('quizResult');
  const recEl = document.getElementById('quizRec');
  const whyEl = document.getElementById('quizWhy');
  const send = document.getElementById('quizSend');
  const WA = 'https://wa.me/972556658131';
  let current = 0;

  const RECS = {
    landing: { name: 'דף נחיתה', time: 'יומיים', why: 'עמוד ממוקד שמוביל את מי שמגיע מהקמפיין לפעולה אחת: השארת פרטים או שיחה.' },
    site: { name: 'אתר תדמית', time: 'שבוע', why: 'אתר שמציג את העסק באמינות ונותן דרך לפנות אליכם מכל עמוד. זו הבחירה שמתאימה לרוב העסקים.' },
    shop: { name: 'חנות אונליין', time: 'שבועיים', why: 'חנות עם ניהול מוצרים, עגלה ותשלום מאובטח, כדי שתוכלו למכור ישירות באתר.' },
  };

  const value = (name) => form.querySelector(`input[name="${name}"]:checked`)?.value || '';

  function recommend() {
    const goal = value('goal'), biz = value('biz');
    if (goal === 'למכור באתר') return RECS.shop;
    if (goal === 'קמפיין ממומן') return RECS.landing;
    if (biz === 'מוכרים מוצרים' && goal !== 'להציג את העסק') return RECS.shop;
    return RECS.site;
  }

  function show(i) {
    current = i;
    const done = i >= steps.length;
    steps.forEach((s, k) => s.classList.toggle('is-current', k === i));
    result.hidden = !done;
    back.hidden = i === 0;
    hint.hidden = done;
    bar.style.width = `${Math.min(i + 1, steps.length) / steps.length * 100}%`;
    if (done) {
      const r = recommend();
      recEl.textContent = r.name;
      whyEl.textContent = `${r.why} מוכן תוך ${r.time}.`;
      const msg = `היי, מילאתי את השאלון באתר.\nסוג העסק: ${value('biz')}\nמטרה: ${value('goal')}\nמתי: ${value('when')}\nההמלצה שקיבלתי: ${r.name}`;
      send.href = `${WA}?text=${encodeURIComponent(msg)}`;
      send.focus({ preventScroll: true });
    } else {
      steps[i].querySelector('input:checked, input')?.focus({ preventScroll: true });
    }
  }

  form.addEventListener('change', (e) => {
    const step = e.target.closest('.quiz-step');
    if (!step) return;
    const i = steps.indexOf(step);
    // short pause so the selected answer is visible before moving on
    setTimeout(() => show(i + 1), 260);
  });
  back.addEventListener('click', () => show(Math.max(current - 1, 0)));
  form.addEventListener('submit', (e) => e.preventDefault());
})();
