(() => {
  'use strict';
  const exercise = document.body.dataset.exercise || 'rectangle';
  const key = `tesselate-comp139e-${exercise}-blanks-v1`;
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
    const solutionButton = document.createElement('button');
    solutionButton.type = 'button';
    solutionButton.className = 'hint-button';
    solutionButton.textContent = 'Solution';
    solutionButton.setAttribute('aria-label', `Solution for blank ${index + 1}`);
    solutionButton.setAttribute('aria-expanded', 'false');
    const solution = document.createElement('div');
    solution.className = 'hint-explanation';
    solution.id = `solution-${index + 1}`;
    solution.hidden = true;
    const answer = document.createElement('code');
    answer.textContent = RectangleWorksheet.answers[index].answer;
    solution.append(document.createTextNode(`Blank ${index + 1} solution: `), answer);
    const reasoning = document.createElement('div');
    reasoning.textContent = RectangleWorksheet.answers[index].explanation;
    solution.append(reasoning);
    solutionButton.setAttribute('aria-controls', solution.id);
    line.append(solution);
    wrapper.append(state, hint, solutionButton);
    function describe() {
      field.setAttribute('aria-describedby', [state.id, !explanation.hidden && explanation.id, !solution.hidden && solution.id].filter(Boolean).join(' '));
    }
    solutionButton.addEventListener('click', () => {
      solution.hidden = !solution.hidden;
      solutionButton.setAttribute('aria-expanded', String(!solution.hidden));
      describe();
    });
    hint.addEventListener('click', () => {
      explanation.hidden = !explanation.hidden;
      hint.setAttribute('aria-expanded', String(!explanation.hidden));
      describe();
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
  const notesKey = `tesselate-comp139e-${exercise}-canvas-v1`;
  const geometryKey = notesKey + '-position';
  const notepad = document.querySelector('.notepad');
  const note = document.getElementById('notes-canvas');
  const handle = document.querySelector('.note-handle');
  const notesStatus = document.getElementById('notes-status');
  try {
    const saved = localStorage.getItem(notesKey);
    if (saved !== null) note.value = saved;
    else if (exercise === 'rectangle') {
      const old = JSON.parse(localStorage.getItem('tesselate-comp139e-rectangle-notes-v1') || '{}');
      note.value = ['notes-knowns', 'notes-unknowns', 'notes-functions'].map(key => typeof old?.[key] === 'string' ? old[key] : '').filter(Boolean).join('\n\n');
    }
    notesStatus.textContent = 'Saved in this browser';
  } catch { notesStatus.textContent = 'Unable to load saved notes'; }
  note.addEventListener('input', () => {
    try { localStorage.setItem(notesKey, note.value); notesStatus.textContent = 'Saved in this browser'; }
    catch { notesStatus.textContent = 'Unable to save — copy notes before leaving'; }
  });
  function place(x, y) {
    const rect = notepad.getBoundingClientRect();
    notepad.style.left = Math.max(8, Math.min(x, window.innerWidth - rect.width - 8)) + 'px';
    notepad.style.top = Math.max(8, Math.min(y, window.innerHeight - rect.height - 8)) + 'px';
    notepad.style.right = 'auto';
  }
  function savePosition() {
    const r = notepad.getBoundingClientRect();
    try { localStorage.setItem(geometryKey, JSON.stringify({x:r.x,y:r.y,width:r.width,height:r.height})); } catch {}
  }
  try {
    const saved = JSON.parse(localStorage.getItem(geometryKey));
    if (saved && ['x','y','width','height'].every(key => Number.isFinite(saved[key]))) {
      notepad.style.width = Math.max(220, saved.width) + 'px';
      notepad.style.height = Math.max(180, saved.height) + 'px';
      place(saved.x, saved.y);
    }
  } catch {}
  let drag = null;
  handle.addEventListener('pointerdown', event => {
    if (event.button !== 0) return;
    const rect = notepad.getBoundingClientRect();
    drag = {x:event.clientX - rect.x, y:event.clientY - rect.y};
    handle.setPointerCapture(event.pointerId);
    event.preventDefault();
  });
  handle.addEventListener('pointermove', event => {
    if (drag) place(event.clientX - drag.x, event.clientY - drag.y);
  });
  function finishDrag() { if (drag) { drag = null; savePosition(); } }
  handle.addEventListener('pointerup', finishDrag);
  handle.addEventListener('pointercancel', finishDrag);
  handle.addEventListener('lostpointercapture', finishDrag);
  handle.addEventListener('keydown', event => {
    const moves = {ArrowLeft:[-20,0],ArrowRight:[20,0],ArrowUp:[0,-20],ArrowDown:[0,20]};
    if (!moves[event.key]) return;
    event.preventDefault();
    const rect = notepad.getBoundingClientRect(), [dx,dy] = moves[event.key];
    place(rect.x + dx, rect.y + dy); savePosition();
  });
  new ResizeObserver(() => {
    const r = notepad.getBoundingClientRect();
    place(r.x, r.y); savePosition();
  }).observe(notepad);
  window.addEventListener('resize', () => {
    const r = notepad.getBoundingClientRect(); place(r.x, r.y); savePosition();
  });
  document.getElementById('print').addEventListener('click', () => window.print());
})();
