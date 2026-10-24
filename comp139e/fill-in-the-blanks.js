(() => {
  'use strict';
  const key = 'tesselate-comp139e-rectangle-blanks-v1';
  const fields = [...document.querySelectorAll('.paper input')];
  const status = document.getElementById('status');
  let storageMessage = 'Saved in this browser';
  try {
    const saved = JSON.parse(localStorage.getItem(key) || '{}');
    fields.forEach(field => { if (typeof saved?.[field.id] === 'string') field.value = saved[field.id]; });
  } catch { storageMessage = 'Browser saving unavailable'; }
  function progress() {
    const correct = fields.filter(field => field.dataset.result === 'correct').length;
    status.textContent = `${correct} / ${fields.length} correct · ${storageMessage}`;
  }
  function save() {
    try {
      localStorage.setItem(key, JSON.stringify(Object.fromEntries(fields.map(field => [field.id, field.value]))));
      storageMessage = 'Saved in this browser';
    } catch { storageMessage = 'Could not save; keep this page open'; }
    progress();
  }
  const refreshers = fields.map((field, index) => {
    const line = field.closest('.line');
    const wrapper = document.createElement('span');
    wrapper.className = 'blank';
    field.before(wrapper);
    wrapper.append(field);
    const state = document.createElement('span');
    state.className = 'answer-state';
    state.id = `state-${index + 1}`;
    state.setAttribute('role', 'status');
    state.setAttribute('aria-live', 'polite');
    const hint = document.createElement('button');
    hint.type = 'button';
    hint.className = 'hint-button';
    hint.textContent = 'Hint';
    hint.setAttribute('aria-label', `Hint for blank ${index + 1}`);
    hint.setAttribute('aria-expanded', 'false');
    const explanation = document.createElement('div');
    explanation.className = 'hint-explanation';
    explanation.id = `hint-${index + 1}`;
    explanation.hidden = true;
    explanation.textContent = `Blank ${index + 1}: ${RectangleWorksheet.answers[index].explanation}`;
    hint.setAttribute('aria-controls', explanation.id);
    field.setAttribute('aria-describedby', state.id);
    line.append(explanation);
    wrapper.append(state, hint);
    hint.addEventListener('click', () => {
      explanation.hidden = !explanation.hidden;
      hint.setAttribute('aria-expanded', String(!explanation.hidden));
      field.setAttribute('aria-describedby', state.id + (explanation.hidden ? '' : ` ${explanation.id}`));
    });
    function refresh() {
      // Reserve room for the expected answer, entered text, and caret.
      const characters = Math.max(18, RectangleWorksheet.answers[index].answer.length + 2, field.value.length + 2);
      field.style.setProperty('--answer-width', `${characters}ch`);
      const result = RectangleWorksheet.check(index, field.value);
      field.dataset.result = result.state;
      field.setAttribute('aria-invalid', String(result.state === 'retry'));
      state.dataset.result = result.state;
      state.textContent = result.state === 'correct' ? '✓' : result.state === 'retry' ? '×' : '';
      state.setAttribute('aria-label', result.state === 'correct' ? 'Correct' : result.state === 'retry' ? 'Try again' : 'Not answered');
    }
    field.addEventListener('input', () => { refresh(); save(); });
    refresh();
    return refresh;
  });
  progress();
  document.getElementById('clear').addEventListener('click', () => {
    if (fields.some(field => field.value) && !confirm('Clear all worksheet answers?')) return;
    fields.forEach(field => { field.value = ''; });
    refreshers.forEach(refresh => refresh());
    save();
    fields[0].focus();
  });
  document.getElementById('print').addEventListener('click', () => window.print());
})();
