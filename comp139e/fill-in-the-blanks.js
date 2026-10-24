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
  fields.forEach(field => field.addEventListener('input', save));
  document.getElementById('clear').addEventListener('click', () => {
    if (fields.some(field => field.value) && !confirm('Clear all worksheet answers?')) return;
    fields.forEach(field => { field.value = ''; });
    save();
    fields[0].focus();
  });
  document.getElementById('print').addEventListener('click', () => window.print());
})();
