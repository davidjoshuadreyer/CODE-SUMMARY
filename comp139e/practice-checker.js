(function (root) {
  'use strict';
  function tokens(value) { return (value.match(/[A-Za-z_][A-Za-z_0-9]*|\d+(?:\.\d+)?|::|->|\+\+|--|\+=|-=|<<|>>|[^\s]/g) || []).join(' '); }
  function create(exercise) {
    const answers = exercise.answers;
    return {answers, check(index, value) {
      const item = answers[index];
      if (!item) throw new RangeError('Unknown blank');
      const state = !value.trim() ? 'empty' : [item.answer, ...item.alternatives].some(answer => tokens(answer) === tokens(value)) ? 'correct' : 'retry';
      return {state, ...item};
    }};
  }
  if (typeof module !== 'undefined' && module.exports) module.exports = {create};
  else {
    const exercise = root.COMP_PRACTICE.find(item => item.slug === document.body.dataset.exercise);
    root.RectangleWorksheet = create(exercise);
  }
})(typeof window === 'undefined' ? globalThis : window);
