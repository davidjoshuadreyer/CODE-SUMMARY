const assert = require('node:assert/strict');
const {answers, check} = require('../comp139e/worksheet-checker.js');
assert.equal(answers.length, 21);
answers.forEach((item, i) => {
  assert.equal(check(i, '').state, 'empty');
  assert.equal(check(i, item.answer).state, 'correct');
  for (const answer of item.alternatives) assert.equal(check(i, answer).state, 'correct');
  assert.equal(check(i, 'wrong').state, 'retry');
});
for (const [index, answer] of [[1, 'double values[2]'], [3, 'Rectangle *items'], [7, 'double  Rectangle ::'], [16, '( rectangles + i ) ->'], [20, '[ ] r']]) assert.equal(check(index, answer).state, 'correct', answer);
for (const [index, answer] of [[7, 'doubleRectangle::'], [16, 'rectangles[i]->'], [17, 'rectanglePtr.'], [18, 'Rectangle *p'], [19, 'r[i]'], [20, '[] p'], [20, 'r'], [0, 'Double *']]) assert.equal(check(index, answer).state, 'retry', answer);
console.log('21 answers, alternatives, empty fields and common mistakes passed.');
