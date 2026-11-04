(() => {
  const bank = window.ENGR_REPS;
  const byId = new Map(bank.map(q => [q.id, q]));
  const find = id => document.getElementById(id);
  const storageKey = 'engr290-midterm-paper-v1';
  const pageSize = 5;
  const letters = 'ABCD';
  const fresh = ids => ({ ids, answers: {}, revealed: {}, page: 0, marked: false });
  let test = fresh(bank.map(q => q.id));
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey));
    if (saved?.ids?.length && saved.ids.every(id => byId.has(id)) && saved.answers && saved.revealed &&
        Number.isInteger(saved.page) && saved.page >= 0 && saved.page * pageSize < saved.ids.length) test = saved;
  } catch {}
  function save() {
    try { localStorage.setItem(storageKey, JSON.stringify(test)); } catch {}
  }
  function shuffle(ids) {
    const items = [...ids];
    for (let i = items.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [items[i], items[j]] = [items[j], items[i]];
    }
    return items;
  }
  const missed = () => test.ids.filter(id => test.answers[id] !== byId.get(id).correct || test.revealed[id]);
  function progress() {
    find('progress').textContent = Object.keys(test.answers).length + ' of ' + test.ids.length + ' answered';
  }
  function question(id) {
    const q = byId.get(id);
    const field = document.createElement('fieldset');
    const legend = document.createElement('legend');
    legend.textContent = q.source + '.  ' + q.prompt;
    field.append(legend);
    q.options.forEach((option, i) => {
      const label = document.createElement('label');
      label.className = 'choice';
      const input = document.createElement('input');
      input.type = 'radio';
      input.name = id;
      input.checked = test.answers[id] === i;
      input.disabled = test.marked;
      input.onchange = () => { test.answers[id] = i; save(); progress(); };
      label.append(input, letters[i] + '.  ' + option);
      field.append(label);
    });
    if (test.marked) {
      const status = document.createElement('p');
      status.className = 'status';
      status.textContent = test.revealed[id] ? 'Solution used' : test.answers[id] === q.correct ? 'Correct' : test.answers[id] === undefined ? 'Unanswered' : 'Incorrect';
      field.append(status);
    }
    const details = document.createElement('details');
    details.className = 'solution';
    const summary = document.createElement('summary');
    summary.textContent = 'Solution';
    const explanation = document.createElement('p');
    explanation.textContent = letters[q.correct] + '. ' + q.options[q.correct] + ' — ' + q.steps.join(' ');
    details.append(summary, explanation);
    details.ontoggle = () => { if (details.open && !test.marked) { test.revealed[id] = true; save(); } };
    field.append(details);
    return field;
  }
  function render(move = false) {
    const start = test.page * pageSize;
    const end = Math.min(start + pageSize, test.ids.length);
    find('range').textContent = 'Questions ' + (start + 1) + ' to ' + end + ' of ' + test.ids.length;
    find('questions').replaceChildren(...test.ids.slice(start, end).map(question));
    find('prev').disabled = start === 0;
    find('next').hidden = end === test.ids.length;
    find('mark').hidden = end !== test.ids.length || test.marked;
    find('review').hidden = !test.marked;
    find('score').textContent = test.marked ? (test.ids.length - missed().length) + ' / ' + test.ids.length + ' correct without opening a solution' : '';
    find('retry').hidden = test.marked && !missed().length;
    progress();
    if (move) find('range').focus();
  }
  function begin(ids) { test = fresh(ids); save(); render(true); }
  for (const topic of new Set(bank.map(q => q.topic))) find('topic').add(new Option(topic, topic));
  find('start').onclick = () => {
    const pool = bank.filter(q => !find('topic').value || q.topic === find('topic').value);
    find('start').closest('details').open = false;
    begin(shuffle(pool.map(q => q.id)).slice(0, Number(find('length').value)));
  };
  find('prev').onclick = () => { test.page--; save(); render(true); };
  find('next').onclick = () => { test.page++; save(); render(true); };
  find('mark').onclick = () => { test.marked = true; test.page = 0; save(); render(); find('score').scrollIntoView({block:'center'}); };
  find('retry').onclick = () => begin(shuffle(missed()));
  find('reset').onclick = () => begin(bank.map(q => q.id));
  render();
})();
