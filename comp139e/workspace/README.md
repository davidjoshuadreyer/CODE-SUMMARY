# COMP 139E course template

## Course dashboard

Run **Terminal → Run Task → Open course dashboard** in VS Code for a browser
interface with a program library, live console, keyboard input, source previews,
generated files, and a Build button. See [the dashboard guide](dashboard/README.md).
You can also start it with:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/dashboard.ps1
```

Open `http://127.0.0.1:13900` and keep the dashboard terminal running.

## Run reference examples

Set `ACTIVE_EXAMPLE` in `main.cpp` to a filename such as `"TestCircleWithHeader"`,
or run `.\build\bin\main.exe example TestCircleWithHeader` after building.
Use `main.exe example --list` for the choices. See [the example guide](examples/README.md)
for input, file output, and stepping through examples with the debugger.

## Runnable learning tutorials

Start with [the tutorial guide](tutorials/README.md) for 18 commented lessons covering
the course topics in this workspace. Set `ACTIVE_TUTORIAL` in `main.cpp` to 1-18
and press F5, or run `.\build\bin\main.exe tutorial 1`. Set it to `0` to return to
`ACTIVE_LAB`. Use `.\build\bin\main.exe --list` to see both labs and tutorials.
MATLAB practice files for Labs 8-9 are included in `tutorials/matlab`.

Use `main.cpp` as your scratchpad for calling and testing lab functions. Implement the
coursework inside `labs/`. The C++ project builds immediately; unfinished functions
throw a descriptive TODO exception instead of returning misleading results.

## Everyday workflow

1. Open the lab folder and read its `README.md`.
2. Replace TODOs in its `.cpp` files with your logic. `lab.cpp` is the lab's driver
   (the code that would normally go in that lab's standalone `main()`).
3. Set `ACTIVE_LAB` in top-level `main.cpp`, or add direct calls in its test area.
   `labs/AllLabs.hpp` already exposes the C++ lab interfaces.
4. Press **Ctrl+Shift+B** to build, then **F5** to debug, or use the commands below.
   VS Code builds the whole project regardless of which file is open.
   With no debugger arguments, `ACTIVE_TUTORIAL` takes priority when it is nonzero.

From a PowerShell terminal in the project root:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/build.ps1
.\build\bin\main.exe --list
.\build\bin\main.exe 2
.\build\bin\main.exe 4 labs/lab04/data/textAndNumbers.txt labs/lab04/output.txt
```

With no argument, the runner uses `ACTIVE_EXAMPLE` if nonempty, then
`ACTIVE_TUTORIAL` if nonzero, otherwise `ACTIVE_LAB`.
With a number, it runs that lab. With `tutorial NUMBER`, it runs that tutorial.
The runner removes the lab selector before passing arguments to lab 4, so its
input filename is `argv[1]` and output filename is `argv[2]`.
Keep your working directory at the project root for relative file paths.
In `.vscode/launch.json`, you can set `"args": ["4", "labs/lab04/data/textAndNumbers.txt", "labs/lab04/output.txt"]`
when debugging lab 4.

If CMake is on your PATH, the Windows / Visual Studio build commands are:

```text
cmake -S . -B build -A x64
cmake --build build --config Debug
```

On Linux/macOS, omit `-A x64`. The executable goes into `build/bin/` (with `.exe` on Windows). The PowerShell build
helper also finds CMake installed with Visual Studio; it does not need a particular
Visual Studio version or compiler path hard-coded into your task.
F5 uses the Microsoft C/C++ VS Code extension and the Visual Studio debugger.

## Layout

```text
main.cpp                    Your C++ scratchpad / lab selector
CMakeLists.txt              Builds all working C++ labs together (C++17)
labs/
  AllLabs.hpp               One include for the C++ lab interfaces
  lab01/ ... lab07/         C++ headers, implementations, and lab drivers
  lab08/                    MATLAB harmonic motion
  lab09/                    MATLAB numerical integration
  common/shapes/            Shared supplied shapes for labs 6 and 7
reference/
  course/                   Original course export, handouts, and supplied files
  examples/                 Original lecture examples, grouped by topic
  original-setup/           Original main, CMake, task, and old build artifacts
tutorials/                 Numbered C++ lessons, guide, and MATLAB practice
scripts/build.ps1           Windows build helper
build/                      Generated build files; no coursework here
```

| Lab | Topic | Where you write logic |
| --- | --- | --- |
| 1 | Surveying / streetlight spacing | `lab01/survey.cpp`, `lab01/lab.cpp` |
| 2 | Weighted marks and grades | `lab02/grades.cpp`, `lab02/lab.cpp` |
| 3 | Coordinate conversion | `lab03/spherical.cpp`, inline `getRadius` in `spherical.hpp` |
| 4 | File parsing | `lab04/text_processing.cpp`, `lab04/lab.cpp` |
| 5 | PID controller | `lab05/PID_Controller.cpp`; select controller in `controllerMain.cpp` |
| 6 | Linked stack and square | `lab06/Stack.hpp`, `lab06/Square.cpp`, `lab06/lab.cpp` |
| 7 | STL vector of shapes | `lab07/lab.cpp` |
| 8 | Harmonic motion | `lab08/harmonicMotion.m`, `lab08/harmonicScript.m` |
| 9 | Numerical integration | `lab09/simpsonsRuleSum.m`, `lab09/simpsonsRuleLoop.m` |

Labs 8 and 9 are MATLAB assignments in the supplied materials. Run them in MATLAB
from their own folders; the C++ selector just tells you which script to run.

## Function calls and adding code

The `lab01`, `lab02`, etc. namespaces keep lab drivers and helper functions distinct.
For example, after you implement it:

```cpp
std::cout << lab02::gradeFromMark(89.1) << '\n';
```

Lab 3's functions and the supplied classes keep their original global names for
compatibility with the instructor's code. You can call `getRadius(3.0, 4.0)` or
instantiate `PID_Controller`, `Circle`, `Square`, and `Stack<Shape*>` from `main.cpp`.
Use `return 0;` after your scratch tests if you do not want to run the selected driver.

Each C++ function already has both a declaration and a definition, so there are no
missing-symbol errors while you work. Most logic belongs in `.cpp` files. Two
assignment-required exceptions are `getRadius` (inline) and `Stack<T>` (template):
their implementations belong in their headers. Add new declarations to the relevant
header when you invent additional helpers. CMake discovers new `.cpp` files under
`labs/` on the next build. Do not add another `main()` there: use the lab's `run()`.

The reference examples are compiled as separate executables to avoid conflicting
class and function names. The example launcher selects one without combining it
with lab classes. Tutorial 18 also links the original Demo/CricleX.cpp into main.
The original course export is intact, including relative links between its files.
Working copies of supplied files live beside the relevant lab. Shared shape code
has a virtual destructor added so deleting through `Shape*` is safe.

## What is and is not finished

The template supplies wiring, signatures, constants, starter classes, instructor
helpers/tests, and data. It intentionally does not solve the assignments.
Unfinished C++ calls print a TODO and exit with status 1; MATLAB starters raise a
`COMP139E:NotImplemented` error. Lab 5 initially runs the supplied proportional
controller, so you can build and run a complete example before implementing PID.
Lab 3 runs the original instructor tests; their driver returns success even when
it reports failed comparisons, so inspect its printed results after implementation.

When submitting a lab, follow its handout: this combined course workspace is not
a submission package. Where a standalone `main()` is required, copy the lab's driver
into a separate submission and rename it, including the needed headers and sources.
