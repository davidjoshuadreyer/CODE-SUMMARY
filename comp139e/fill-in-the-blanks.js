(() => {
  'use strict';
  const key = 'tesselate-comp139e-rectangle-blanks-v1';
  const fields = [...document.querySelectorAll('.paper input')];
  const status = document.getElementById('status');
  function progress(message) {
    status.textContent = `${fields.filter(field => field.value.trim()).length} / ${fields.length} filled · ${message}`;
  }
  try {
    const saved = JSON.parse(localStorage.getItem(key) || '{}');
    fields.forEach(field => { if (typeof saved?.[field.id] === 'string') field.value = saved[field.id]; });
    progress('Saved in this browser');
  } catch { progress('Browser saving unavailable'); }
  function save() {
    try {
      localStorage.setItem(key, JSON.stringify(Object.fromEntries(fields.map(field => [field.id, field.value]))));
      progress('Saved in this browser');
    } catch { progress('Could not save; keep this page open'); }
  }
  const feedback = document.getElementById('feedback');
  const results = document.getElementById('results');
  function resetFeedback() {
    feedback.hidden = true;
    fields.forEach(field => {
      delete field.dataset.result;
      field.removeAttribute('aria-invalid');
      field.removeAttribute('aria-describedby');
    });
  }
  fields.forEach(field => field.addEventListener('input', () => { resetFeedback(); save(); }));
  document.getElementById('check').addEventListener('click', () => {
    results.replaceChildren();
    let correct = 0, empty = 0;
    fields.forEach((field, index) => {
      const result = RectangleWorksheet.check(index, field.value);
      correct += result.state === 'correct';
      empty += result.state === 'empty';
      field.dataset.result = result.state;
      field.setAttribute('aria-invalid', String(result.state === 'retry'));
      const row = document.createElement('li');
      row.id = `feedback-${index + 1}`;
      field.setAttribute('aria-describedby', row.id);
      const link = document.createElement('a');
      link.href = `#${field.id}`;
      link.textContent = `Blank ${index + 1}: ${result.state === 'correct' ? 'Correct' : result.state === 'empty' ? 'Not answered' : 'Try again'}`;
      link.addEventListener('click', () => field.focus());
      row.append(link, document.createTextNode(` — ${result.explanation} `));
      if (result.state !== 'correct') {
        const details = document.createElement('details');
        const summary = document.createElement('summary');
        summary.textContent = 'Show an answer';
        const answer = document.createElement('code');
        answer.textContent = result.answer;
        details.append(summary, answer);
        row.append(details);
      }
      results.append(row);
    });
    document.getElementById('score').textContent = `${correct} / ${fields.length} correct · ${fields.length - correct - empty} to revisit · ${empty} unanswered`;
    feedback.hidden = false;
  });
  document.getElementById('clear').addEventListener('click', () => {
    if (fields.some(field => field.value) && !confirm('Clear all worksheet answers?')) return;
    fields.forEach(field => { field.value = ''; });
    resetFeedback();
    save();
    fields[0].focus();
  });
  document.getElementById('print').addEventListener('click', () => window.print());
})();
