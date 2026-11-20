// =========================================================
// DA Web Design | טופס השארת פרטים: בדיקה, וסיכום שנשלח בוואטסאפ
// =========================================================
(function lead() {
  const form = document.getElementById('leadForm');
  if (!form) return;
  const WA = 'https://wa.me/972556658131';
  const err = document.getElementById('lfError');
  const done = document.getElementById('lfDone');
  const waLink = document.getElementById('lfWa');
  const name = document.getElementById('lf-name');
  const phone = document.getElementById('lf-phone');
  const note = document.getElementById('lf-note');

  const select = document.getElementById('lf-type');
  function choose(type) {
    if (select) { select.value = type; return; }
    const input = Array.from(form.querySelectorAll('input[name="type"]')).find(i => i.value === type);
    if (input) input.checked = true;
  }

  // buttons elsewhere on the page carry the visitor's choice into the form
  document.querySelectorAll('[data-plan]').forEach(a => {
    a.addEventListener('click', () => choose(a.dataset.plan));
  });
  document.getElementById('quizSend')?.addEventListener('click', () => {
    const rec = document.getElementById('quizRec')?.textContent.trim();
    if (rec) choose(rec);
    const answers = ['biz', 'goal', 'when']
      .map(n => document.querySelector(`#quizForm input[name="${n}"]:checked`)?.value)
      .filter(Boolean);
    if (answers.length && !note.value) note.value = answers.join(' · ');
  });
  document.querySelectorAll('a[href="#lead"], a[href="#contact"]').forEach(a => {
    a.addEventListener('click', () => setTimeout(() => name.focus({ preventScroll: true }), 700));
  });

  function fail(input, msg) {
    input.setAttribute('aria-invalid', 'true');
    err.textContent = msg;
    err.hidden = false;
    input.focus();
  }

  form.addEventListener('input', (e) => {
    if (e.target.getAttribute('aria-invalid') === 'true') e.target.removeAttribute('aria-invalid');
    if (!err.hidden) err.hidden = true;
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const n = name.value.trim();
    const digits = phone.value.replace(/\D/g, '');
    if (n.length < 2) return fail(name, 'כתבו את השם שלכם כדי שנדע איך לפנות אליכם.');
    if (digits.length < 9 || digits.length > 12) return fail(phone, 'בדקו את מספר הטלפון. הוא צריך להכיל 9–10 ספרות.');
    const type = select ? select.value : (form.querySelector('input[name="type"]:checked')?.value || '');
    const lines = ['היי, השארתי פרטים באתר:', `שם: ${n}`, `טלפון: ${phone.value.trim()}`, `מה צריך: ${type}`];
    if (note.value.trim()) lines.push(`על העסק: ${note.value.trim()}`);
    const url = `${WA}?text=${encodeURIComponent(lines.join('\n'))}`;
    waLink.href = url;
    done.hidden = false;
    form.querySelector('.lf-submit').textContent = 'הפרטים מוכנים ✓';
    window.open(url, '_blank', 'noopener');
  });
})();
