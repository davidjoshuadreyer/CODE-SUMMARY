# COMP 139E: learn it, run it, change it

These 18 lessons follow the topics in this workspace's lab handouts and reference
examples. Each numbered `.cpp` file starts with prerequisites, expected results,
and an exercise. Comments explain the new ideas beside the code.

**Predict the output, run the example, then change one thing.** Start with lesson 1.
Use a breakpoint and F10 to watch variables change. For linked lists, draw the
nodes and arrows before stepping through the code.

## Run from main.cpp with F5

At the top of the project's [main.cpp](../main.cpp), set:

```cpp
constexpr int ACTIVE_TUTORIAL = 5; // Run the pointers lesson.
constexpr int ACTIVE_LAB = 1;
```

Press **Ctrl+Shift+B** to build, then **F5**. The existing debugger configuration
uses no arguments, so it follows these constants. Set `ACTIVE_TUTORIAL` back to
`0` to run `ACTIVE_LAB` again. Explicit command-line arguments take priority.
If you previously selected a reference example, first set `ACTIVE_EXAMPLE = ""`.
See [the reference example guide](../examples/README.md) to run the original demos.

You can also call a lesson directly at the start of `main()` inside `try`:

```cpp
return tutorials::pointers();
// Or: return tutorials::classes();
// Or: return lab01::run();
```

Use just ONE active `return` there. Remove or comment it out to use the normal
selector again. All lesson declarations are in [Tutorials.hpp](Tutorials.hpp).
`tutorials::` identifies our functions; `using namespace std;` only shortens
names from the standard library, such as `cout` and `string`.

## Run from the terminal

Open PowerShell in the project root:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/build.ps1
.\build\bin\main.exe --list
.\build\bin\main.exe tutorial 1
.\build\bin\main.exe tutorial 18
.\build\bin\main.exe 1
```

`main.exe tutorial` lists the lessons. `main.exe 1` runs Lab 1 even when
`ACTIVE_TUTORIAL` selects something else. Existing lab arguments still work:

```powershell
.\build\bin\main.exe 4 labs/lab04/data/textAndNumbers.txt labs/lab04/output.txt
```

Some labs still contain TODO functions; tutorials do not complete those labs.
Lesson 2 asks for keyboard input; type `q` when finished. Other C++ lessons run
without keyboard input. Lesson 12 appends a report in `tutorials/output/` and
expects your working directory to be the project root. For custom files:

```powershell
.\build\bin\main.exe tutorial 12 "my input.txt" "my output.txt"
```

The output's parent folder must exist. Here `argc` is 5 and `argv` contains
`[executable, tutorial, 12, input path, output path]`. The runner passes the last
two strings to `tutorials::files()`. `argv[0]` is the executable name.

## Learning path

| Lesson and code | Main idea | Course connection |
|---|---|---|
| [1. Basics](01_basics.cpp) | Variables, constants, arithmetic, output | Lab 1; Introduction |
| [2. Input](02_input_and_decisions.cpp) | `cin`, `if`, `while`, validation | Lab 2 |
| [3. Functions](03_functions.cpp) | Values, references, pointers, defaults, overloads, scope | Labs 1-3 |
| [4. Arrays and strings](04_arrays_and_strings.cpp) | Indices, loops, totals, string operations | Labs 1, 4 |
| [5. Pointers](05_pointers.cpp) | Addresses, dynamic arrays, ownership, cleanup | Labs 1, 3 |
| [6. Modules and tests](06_modules_and_testing.cpp) | Headers, structs, radians, inline, tests | Lab 3 |
| [7. Classes](07_classes.cpp) | Constructors, access, static data, copies, destructors | Objects_and_Classes; Lab 5 |
| [8. Inheritance](08_inheritance.cpp) | Abstract classes and virtual calls | Labs 5-7 |
| [9. Templates](09_templates.cpp) | Functions and classes for different types | Lab 6 |
| [10. Linked lists](10_linked_lists.cpp) | Nodes, forward/backward links, traversal, deletion | Lab 6; Linked_Lists |
| [11. Stacks and queues](11_stacks_and_queues.cpp) | LIFO, FIFO, a linked template stack | Lab 6; Stacks_and_Queues |
| [12. Files](12_files.cpp) | Streams, append, peek, text classification, arguments | Lab 4 |
| [13. Exceptions](13_exceptions.cpp) | Throw, try, catch, stream recovery | Labs 2, 4, 6, 7 |
| [14. Vectors](14_vectors.cpp) | Methods, iterators, checked access, sorting, 2-D data | Lab 7 |
| [15. Feedback control](15_control.cpp) | Error, integral, derivative, stored state | Lab 5 |
| [16. Motion](16_harmonic_motion.cpp) | Time samples and damping cases | Lab 8 |
| [17. Integration](17_integration.cpp) | Trapezoid and Simpson weights, error | Lab 9 |
| [18. Reference demo](18_reference_demo.cpp) | Use the original CircleX class | Demo references |

## Concepts to understand

### 1. Variables store values

`int` stores whole numbers; `double` keeps fractional parts. `3 / 2` produces
`1`, while `3.0 / 2` produces `1.5`. `const` marks a value that cannot be reassigned.
Predict the circle's area when its radius doubles: it becomes four times as large.

### 2. Input failure differs from a value outside the allowed range

`-1` is a number outside our allowed range; `q` cannot be read as a number.
The example retries the first and stops on the second. `||` means OR, `&&` means
AND, and `!` means NOT. Numeric extraction may accept a prefix: `12abc` can read
12 before a later read fails. This is not a strict whole-line number parser.

### 3. Parameters decide what a function can change

`int value` receives a copy; `int& value` refers to the original variable.
`int* value` receives an address; `*value` accesses the original value. At a call,
`&number` obtains that address. A return value sends a result back. Overloads
choose functions by parameter types. A static local retains its value between calls.

### 4. Array indices start at zero

Three items use indices 0, 1, 2. Index 3 is outside the array. Use `i < SIZE`,
not `i <= SIZE`. Strings also support indexing and provide `size()` and `substr()`.
Running totals combine values without storing them all: Lab 2 requires no arrays.

### 5. Pointers require a clear owner

`new double[count]` creates an array that survives a function return until its
owner uses `delete[]`. Each call to `makeReadings` creates an independent array.
Returning a local array's address would be invalid. Never delete a borrowed
pointer to a local variable, and never access an object after deleting it.

### 6. Declarations and definitions connect separate files

Read [Geometry.hpp](support/Geometry.hpp) beside [Geometry.cpp](support/Geometry.cpp).
The header tells callers what exists; the source provides the implementation.
`Point` names related values. Trigonometric functions use radians. Compare numerical
results with a tolerance. `inline` allows certain definitions in shared headers;
it does not force the compiler to replace calls with the function's instructions.

### 7. Classes manage data and behavior together

Private fields are changed through public functions. Constructors initialize;
destructors clean up. Each Tile has its own dimensions, but all share `liveCount`.
A copy constructor creates an object; assignment updates an existing one. The
extra braces demonstrate when objects leave scope and destructors run. Copying
numbers is simple; a class owning pointers needs a deliberate deep-copy policy.

### 8. Virtual functions select behavior at run time

A `Sound*` pointing to a Bell calls Bell's `play()`. `override` checks that the
derived function matches the base interface. An abstract class cannot be created
directly. Use pointers or references for polymorphism: copying into a base value
can discard derived behavior (slicing). A virtual destructor supports deleting
a dynamically allocated derived object through its base pointer.

### 9. Templates leave the type open until use

`Box<int>` stores an integer; `Box<double>` stores a double. The type used with
`larger` must support `>`. Templates do not make every operation valid for every
type. Shared template definitions normally belong in headers; see the example
in [LearningStack.hpp](support/LearningStack.hpp).

### 10. Linked lists follow addresses

Draw `head -> 10 -> 20 -> 30 -> nullptr`. Moving a traversal pointer does not move
or delete nodes. During deletion, advance the head before deleting its old node.
A doubly linked node also points backward. The example's backward-linked nodes
are local objects, so they need no `delete`.

### 11. Stacks and queues differ in removal order

A stack removes the most recently added item; a queue removes the oldest.
`top()` or `front()` looks; `pop()` removes. Our empty stack throws. Copying the
stack is disabled because sharing owning node pointers would cause double deletion.
A stack of raw pointers owns its nodes but does not automatically delete the
separate objects that those stored pointers refer to.

### 12. File streams use familiar operators

`ifstream` reads; `ofstream` writes. Check opening succeeded. `ios::app` preserves
earlier output. `ws` skips whitespace, then `peek()` examines one character without
consuming it. Extract the complete word or integer after classifying. The example
assumes valid word/integer tokens, not arbitrary punctuation or decimals. Avoid
`while (!input.eof())`: check the read itself because a read can discover EOF.

### 13. Throwing skips to a matching catch

Statements remaining in the `try` block are skipped after a throw. Catch errors
by `const ...&` to avoid copying. Stream failures usually set flags instead of
throwing: `clear()` resets flags and `ignore()` discards unwanted input.
`istringstream` makes parsing testable with fixed text instead of keyboard input.

### 14. Vectors manage resizable sequences

`size()` counts items; `capacity()` reports reserved storage; `max_size()` is a
theoretical limit, not free memory. `at()` checks bounds; `[]` does not. Iterators
walk from `begin()` to `end()`, but must never dereference `end()`. Insertion can
invalidate iterators. For Lab 7's `vector<Shape*>`, draw with `(*it)->draw()`.
Destroying a vector of raw pointers does not delete the objects they point to.

### 15. Controllers retain information between steps

Error is target minus measured output. Proportional action responds to current
error, integral accumulates it, and derivative responds to its change. Resetting
the integral each iteration would erase its memory. Our derivative begins at zero
because no previous sample exists. This teaching model differs from Lab 5's
specific PID expression and plant: use its handout when implementing that lab.

### 16. A signal can be sampled at selected times

For our undamped example, `omega = sqrt(k/m)` and `x = cos(omega*t)`. For nonzero
damping, `b*b - 4*m*k` identifies underdamped, critical, or overdamped behavior.
The C++ example samples motion and classifies damping. The MATLAB companion
plots all four fixed examples with the same initial position and velocity.

### 17. Integration adds weighted samples

N intervals need N+1 points. Trapezoid weights are `1,2,2,...,2,1`, times `h/2`.
Simpson weights are `1,4,2,4,...,2,4,1`, times `h/3`; N must be even. Compare with
an independently known exact integral. Simpson integrates the quadratic example
exactly apart from rounding. The MATLAB error plot uses a quartic to show convergence.

### 18. Reference code needs both a header and its implementation

The tutorial includes the original `AllTests.h`, constructs a CircleX, and calls
its methods. CMake explicitly compiles `CricleX.cpp` (the original spelling).
Including the header alone would leave definitions missing at link time.
Do not include `.cpp` files or compile every reference together: they can reuse
names or define their own `main()`. Each executable needs one `main()`.

## MATLAB practice for Labs 8-9

C++ tutorials 16 and 17 run from main like the other lessons. Actual MATLAB files
need MATLAB; the C++ runner does not execute them. Set MATLAB's Current Folder
to `tutorials/matlab`, then run:

```matlab
learnMotion
learnIntegration
```

[learnMotion.m](matlab/learnMotion.m) covers vectors, one-based indexing, `.*`,
plots, subplots, and linked axes. [learnIntegration.m](matlab/learnIntegration.m)
and [learningSimpson.m](matlab/learningSimpson.m) cover function handles, `.^`,
sum and loop forms, validation, assertions, timing, and a log-log error plot.
These are practice files; assignment code remains in `labs/lab08` and `labs/lab09`.

Use the [course handouts](../reference/course/Table%20of%20Contents.html) as the final
assignment checklist. These lessons cover the topics visible in this workspace;
additional lecture or exam requirements may not appear in the provided materials.

## Check the examples after editing

After building, run `python scripts/check_tutorials.py` from the project root.
This checks the expected C++ outputs, file append behavior, and runner selections.
The checks describe the original examples; update them if you intentionally change
an exercise's output. They do not execute MATLAB or complete unfinished labs.
