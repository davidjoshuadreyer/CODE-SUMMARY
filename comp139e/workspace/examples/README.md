# Run the reference examples

All 55 lecture demos in `reference/examples` have their own executable. The
course's shape, controller, and trigonometry drivers are also selectable.
The original example files are compiled directly, so edits to them take effect
after rebuilding. Classes and helper files are built with the demos that use them;
a header or helper without an entry function is not a standalone program.

## Choose an example in main.cpp

At the top of [main.cpp](../main.cpp), set:

```cpp
const string ACTIVE_EXAMPLE = "TestCircleWithHeader";
```

Press **Ctrl+Shift+B**, then **F5** using **Run selected lab, tutorial, or example**.
This prints the circle areas from the original reference example. To choose another:

```cpp
const string ACTIVE_EXAMPLE = "TestArrayOfObejctsTotalArea";
```

Use the original filename spelling, including `Obejcts`. File names may include
`.cpp`, but don't have to. You can also use a function name such as
`testCircleWithHeader`. Set `ACTIVE_EXAMPLE = ""` to return to the existing
`ACTIVE_TUTORIAL` / `ACTIVE_LAB` selection. The example setting takes priority
over both; explicit command-line selections take priority over all defaults.

You can also call the launcher yourself inside main's `try` block:

```cpp
return examples::run("TestCircleWithHeader");
```

The runner starts a separate process and waits for it. This is necessary because
different examples and labs define incompatible classes named `Circle`, `Stack`,
and so on. The examples inherit your terminal for input and output.

## Choose an example in the terminal

From the project root, build once and select a demo:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/build.ps1
.\build\bin\main.exe example --list
.\build\bin\main.exe example TestCircleWithHeader
.\build\bin\main.exe example ComputeAverage
.\build\bin\main.exe example TestVector.cpp
```

`ComputeAverage` asks you to type three numbers. Other examples may prompt for
input too. Invalid or missing keyboard input stops cleanly with an explanation.
The filenames and function names are case-sensitive.

Some files contain several demos. Select the specific function:

```powershell
.\build\bin\main.exe example testArrayStack
.\build\bin\main.exe example testSinglyLinkedStack
.\build\bin\main.exe example testVectorStack
.\build\bin\main.exe example testListStack
.\build\bin\main.exe example testArrayQueue
.\build\bin\main.exe example testListQueue
```

Selecting `TestStack` or `TestQueue` lists their choices instead of guessing.
`CricleX` selects the original CircleX class demo. The extra course drivers are:

```powershell
.\build\bin\main.exe example shapeMain
.\build\bin\main.exe example controllerMain
.\build\bin\main.exe example testTrigMain
```

The trigonometry tests depend on your Lab 3 functions. They report a TODO error
until you implement those functions. The controller example runs the supplied
proportional controller; it does not implement your PID assignment.

## Step through the actual reference code

The usual main runner launches an example as a child process, so its debugger
does not automatically step into that child. For breakpoints inside reference code:

1. Open the reference `.cpp` and click beside a line to set a breakpoint.
2. In VS Code's **Run and Debug** dropdown, select **Debug reference example directly**.
3. Press **F5** and enter its **function name**, such as `testCircleWithHeader`.
4. Use F10 to step over a statement, F11 to enter a function, and F5 to continue.

Use `main.exe example --list` to find the function name. The debugger prompt expects
that name, not the filename. Executables are in `build/bin/examples/`.

## File examples and the allocation demo

The old programs expect paths starting with `src/Files_and_Exception_Handling/Files`.
The build creates that layout under `build/reference-work/` and seeds it with copies
of the supplied data. File reads and writes go to these working copies, preserving
the reference data. Runs share this working folder, so an output demo can create
data for an input demo. Rebuilding keeps existing working files.

For example, after `TextFileOutput`, inspect:

```text
build/reference-work/src/Files_and_Exception_Handling/Files/scores.txt
```

To reset one working data file, copy its original from
`reference/examples/Files_and_Exception_Handling/Files/` over the working copy.

`TestBadAllocExceptionDemo` originally attempts about 28 GB of array allocations.
Its standalone executable uses a teaching allocator that throws `bad_alloc` for
arrays larger than 1 MiB. It still executes the original demo's catch block and
prints the limit; it does not actually exhaust your system's memory.

The reference code otherwise retains its original behavior, including deliberate
teaching mistakes such as the incorrect EOF loop. Successful execution is not a
claim that every original algorithm is correct or production-ready.

## How the build connects everything

[CMakeLists.txt](CMakeLists.txt) finds the existing no-argument `int` entry functions
and pairs the demos with their supporting `.cpp` files. Generated wrappers live
under `build/examples`; edit the original source, not generated wrappers. Older
examples compile as C++14 (for `random_shuffle`); labs/tutorials stay on C++17.
The first build is larger; later builds update changed files.

For a new demo using the same no-argument entry pattern, adding its `.cpp` under
`reference/examples` makes it discoverable on rebuild. If it needs extra implementation
files, add their mapping to `examples/CMakeLists.txt`, following the Circle example.
MATLAB `.m` files and historical setup files are not C++ example entry points.

After building, run `python scripts/check_examples.py` to verify the example
launcher and lecture demos. The check supplies input to interactive examples and
restores the working data afterward.
