# Code desk · COMP 139E dashboard

A local browser interface for your labs, tutorials, and reference examples.
It runs on your computer and uses your existing C++ executables.

## Open the dashboard

In VS Code, select **Terminal → Run Task → Open course dashboard**.
Your browser opens automatically. Keep the task's terminal running while using it.

Or, from the course folder in PowerShell:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/dashboard.ps1
```

Then visit **http://127.0.0.1:13900**. To stop the dashboard, press Ctrl+C in its
terminal. Closing the browser tab does not stop the server or a running program.
To use another port, append `-Port 13901` to the command.

## Use it

1. Choose **Labs**, **Tutorials**, or **Reference examples**, or search by topic,
   filename, or function name. The library includes 85 entries.
2. Click **Run program**. Watch the output appear in the console.
3. When the program asks for input, type it in **Program input** and click
   **Send input**. Ctrl+Enter also sends it. You can send multiple lines at once.
4. **Use example input** fills in sample values where supplied. Click Run to
   start with those values, or Send input if the program is already running.
5. **Finish input (EOF)** closes keyboard input. **Stop** ends the running program.
6. Read the **Source code** panel alongside the results. The dropdown includes
   related headers and implementations. Edit code in VS Code, then click
   **Build programs** before running it again.

Only one program or build runs at a time. If you switch programs while one is
running, Stop still controls the active run. The console shows the last run of
the selected program; the bottom status identifies any other active program.
Run history is kept in the open page, not saved to disk. The server also retains
its latest run so refreshing the page can recover that output.

## Files and starter code

The file-processing lab and tutorial show input/output filename fields. Use paths
relative to the course folder. Output is restricted to `labs/lab04/` or
`tutorials/output/`, respectively. File output uses append mode where the program
implements it. **Output files** previews the files produced by these programs.

The original file examples use working data in:

```text
build/reference-work/src/Files_and_Exception_Handling/Files/
```

Their original fixtures are preserved. Those demos share working copies, so a
file created by one can be used by another.

A lab's TODO error is displayed in the console: the dashboard does not complete
unfinished assignments. MATLAB Labs 8 and 9 can be browsed, but their Run button
is disabled because they require MATLAB. C++ tutorials 16 and 17 provide runnable
introductions to those topics. The original allocation-failure example retains
the example runner's small teaching allocation limit.

The dashboard runs the **last compiled code**. Click Build after editing a `.cpp`
or header. Existing terminal commands, `main.cpp` settings, and debugger options
continue to work independently.

## Requirements and checks

The dashboard needs Python 3.10+ and a browser. Its server has no third-party
Python packages; the frontend uses local HTML, CSS, and JavaScript with no CDN.
Building uses the existing Visual Studio/CMake setup. The server listens only
on `127.0.0.1` and launches known course programs without constructing shell commands.

For development checks:

```powershell
python scripts/check_dashboard.py
```

This verifies real HTTP requests, compilation, live input, EOF, stopping, generated
files, and file-access restrictions. Optional isolated browser checks use Playwright:

```powershell
npm install --prefix build/dashboard-qa --no-save --package-lock=false playwright
node scripts/check_dashboard_ui.cjs
```

Those checks use the installed Edge browser in headless mode and save desktop
and mobile screenshots under `build/dashboard-qa/`. Playwright is only a testing
tool; it is not required to use the dashboard.
