(function (root) {
  'use strict';
  const rows = [
    ['double *', [], 'Return a pointer to the dynamically allocated array of doubles.'],
    ['double *dimensions', ['double dimensions[]', 'double dimensions[2]', 'double *', 'double[]'], 'This parameter represents an array of doubles. In a function parameter, double[] and double * are equivalent; a name is optional in this declaration.'],
    ['double *', [], 'The result is a dynamically allocated array of areas, so return a pointer to double.'],
    ['Rectangle *rectangles', ['Rectangle rectangles[]', 'Rectangle *', 'Rectangle[]'], 'Accept an array of Rectangle objects. A pointer or array parameter works; the parameter name is optional in this declaration.'],
    ['Rectangle::', [], 'A constructor defined outside its class needs the Rectangle:: scope qualifier and no return type.'],
    ['Rectangle::', [], 'Qualify this constructor with Rectangle::; constructors do not have return types.'],
    ['d', ['&d[0]'], 'Pass the local array d, which converts to a pointer to its first element.'],
    ['double Rectangle::', [], 'getArea returns double and is a member of Rectangle. Include both the return type and class scope.'],
    ['double *Rectangle::', [], 'getDimensions returns a pointer to double and belongs to Rectangle.'],
    ['double *', ['auto', 'auto *'], 'new double[2] produces a pointer to double, which dimensions must store.'],
    ['void Rectangle::', [], 'This setter returns no value and is defined outside the Rectangle class.'],
    ['double *', [], 'The name dimensions is already printed. Put only its pointer type in this blank.'],
    ['dimensions[0]', ['*dimensions', '*(dimensions + 0)', '0[dimensions]'], 'The first array element (index 0) stores the length.'],
    ['dimensions[1]', ['*(dimensions + 1)', '1[dimensions]'], 'The second array element (index 1) stores the width.'],
    ['double *Rectangle::', [], 'Return a pointer to the areas array and qualify this member with Rectangle::.'],
    ['double *', ['auto', 'auto *'], 'new double[size] produces a pointer to the first double in the allocated array.'],
    ['rectangles[i].', ['(rectangles + i)->', '(*(rectangles + i)).'], 'rectangles[i] is an object, so use a dot. Alternatively, (rectangles + i) is a pointer, so use ->.'],
    ['rectanglePtr->', ['(*rectanglePtr).'], 'rectanglePtr is a pointer. Use -> to call its member, or dereference it before using a dot.'],
    ['Rectangle *r', ['auto r', 'auto *r'], 'Store the allocated array in a pointer named r, matching the later printed references to r[i].'],
    ['r + i', ['&r[i]', '&i[r]', 'i + r'], 'The function expects a pointer to the ith rectangle, not the rectangle object itself.'],
    ['[] r', [], 'Pair new Rectangle[num] with delete[] r. The name r must match the allocated array.']
  ];
  // Compare C++ tokens rather than deleting whitespace: "doubleRectangle" is not "double Rectangle".
  function tokens(value) {
    return (value.match(/[A-Za-z_][A-Za-z_0-9]*|\d+|::|->|[^\s]/g) || []).join(' ');
  }
  const answers = rows.map(([answer, alternatives, explanation]) => ({answer, alternatives, explanation}));
  function check(index, value) {
    const item = answers[index];
    if (!item) throw new RangeError('Unknown worksheet blank');
    if (!value.trim()) return {state: 'empty', ...item};
    const accepted = [item.answer, ...item.alternatives];
    // Parameter names in declarations can differ from names in the definitions.
    if (index === 1 || index === 3) {
      const type = index === 1 ? 'double' : 'Rectangle';
      const declaration = new RegExp('^' + type + ' \\* [A-Za-z_][A-Za-z_0-9]*$');
      const array = new RegExp('^' + type + ' [A-Za-z_][A-Za-z_0-9]* \\[ (?:[0-9]+ )?\\]$');
      if (declaration.test(tokens(value)) || array.test(tokens(value))) return {state:'correct', ...item};
    }
    return {state: accepted.some(answer => tokens(answer) === tokens(value)) ? 'correct' : 'retry', ...item};
  }
  const api = {answers, check};
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.RectangleWorksheet = api;
})(typeof window === 'undefined' ? globalThis : window);
