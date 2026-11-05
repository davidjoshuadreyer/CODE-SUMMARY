const questions = [...document.querySelectorAll('fieldset')];
const progress = document.querySelector('#progress');
const score = document.querySelector('#score');
const mark = document.querySelector('#mark');
const storageKey = 'ecet250e-quiz2-mixed-practice-v1';
let saved = {};
try { saved = JSON.parse(localStorage.getItem(storageKey)) || {}; } catch {}
let marked = saved.marked === true;
const selected = q => q.querySelector('input:checked');
function update() {
  const answers = questions.map(q => selected(q)?.value ?? null);
  progress.textContent = answers.filter(a => a !== null).length + ' of ' + questions.length + ' checkpoints answered';
  let correct = 0;
  questions.forEach((q, i) => {
    const right = answers[i] === q.dataset.answer;
    if (right) correct++;
    q.querySelector('.status').textContent = marked
      ? (right ? 'Correct' : (answers[i] === null ? 'Unanswered' : 'Incorrect') + ' · answer ' + 'ABCD'[Number(q.dataset.answer)])
      : '';
    q.querySelectorAll('input').forEach(input => { input.disabled = marked; });
  });
  score.textContent = marked ? correct + ' / ' + questions.length + ' checkpoints correct' : '';
  mark.disabled = marked;
  try { localStorage.setItem(storageKey, JSON.stringify({answers, marked})); } catch {}
}
questions.forEach((q, i) => {
  const answer = saved.answers?.[i];
  q.querySelectorAll('input').forEach(input => { input.checked = input.value === answer; });
  q.addEventListener('change', update);
});
mark.onclick = () => { marked = true; update(); };
document.querySelector('#reset').onclick = () => {
  marked = false;
  questions.forEach(q => {
    if (selected(q)) selected(q).checked = false;
    q.querySelector('details').open = false;
  });
  update();
  questions[0].scrollIntoView();
};
update();
