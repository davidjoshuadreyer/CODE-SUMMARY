"""Build first, then run: python scripts/check_tutorials.py.

Checks the lessons' observable results and the shared runner. Generated file
reports stay in a temporary directory, not in the student's lab files.
"""
from pathlib import Path
import math
import re
import shutil
import subprocess
import tempfile

ROOT = Path(__file__).resolve().parents[1]
EXE = ROOT / "build" / "bin" / "main.exe"


def run(*args, text="", code=0, cwd=ROOT):
    result = subprocess.run(
        [str(EXE), *map(str, args)], input=text, capture_output=True,
        text=True, cwd=cwd, timeout=10,
    )
    assert result.returncode == code, (args, result.returncode, result.stdout, result.stderr)
    return result.stdout + result.stderr


def contains(output, *expected):
    for item in expected:
        assert item in output, (item, output)


expected = {
    1: ["3 / 2 = 1\n", "3.0 / 2 = 1.5", "Circle area = 12.5664"],
    2: ["Out of range. Try again.", "Cool", "Comfortable", "Input finished"],
    3: ["After value = 10", "After reference = 11", "After pointer = 12",
        "Default height: 4", "Given height: 12", "Call counter: 1", "Call counter: 2"],
    4: ["Total = 60", "Word length = 6", "Weighted result = 85"],
    5: ["Value = 9", "Array = 0 2 4", "Independent second array starts at 0"],
    6: ["PASS: 90 degrees gives (0, 2)", "PASS: 3-4-5 triangle", "PASS: default y = 0"],
    7: ["Original area = 12", "Copy area = 24", "Assigned area = 12",
        "Array total = 14", "Live objects inside block = 5", "Live objects after block = 0"],
    8: ["Beep\nDing"],
    9: ["7\n4.5\nStored value = 12"],
    10: ["Forward = 10 20 30", "Backward = 2 1"],
    11: ["Stack = 30 20 10", "Queue = 10 20 30", "Caught: Stack is empty"],
    13: ["Quotient = 4", "Caught: Cannot divide by zero", "Stream recovered = 42"],
    14: ["First = 30, last = 10", "Index 1 = 20", "Size = 3",
         "Sorted = 10 20 30", "Caught out-of-range access", "Grid value = 7"],
    15: ["Step 0: error=10 integral=10 derivative=0 command=6 output=1.5", "Step 4:"],
    16: ["b=0: undamped", "b=1: underdamped", "b=4: critical", "b=6: overdamped"],
    17: ["Trapezoid = 0.34375", "Simpson = 0.333333"],
    18: ["Default circle: Area size is: 78.5", "Changed circle: Area size is: 12.56"],
}

for number, fragments in expected.items():
    output = run("tutorial", number, text="-1\n10\n25\nq\n" if number == 2 else "")
    contains(output, *fragments)
    if number == 13:
        assert "This line is skipped" not in output
    if number == 16:
        positions = [float(value) for value in re.findall(r", x=([^\n]+)", output)]
        assert len(positions) == 5
        assert all(math.isclose(a, b, abs_tol=1e-5) for a, b in zip(positions, [1, 0, -1, 0, 1]))
    if number == 17:
        error = float(re.search(r"Simpson error = ([^\n]+)", output)[1])
        assert error < 1e-12
    print(f"PASS tutorial {number}")

with tempfile.TemporaryDirectory(prefix="comp139-tutorials-") as folder:
    folder = Path(folder)
    data = folder / "tutorials" / "data"
    reports = folder / "tutorials" / "output"
    data.mkdir(parents=True)
    reports.mkdir()
    shutil.copyfile(ROOT / "tutorials" / "data" / "mixed.txt", data / "mixed.txt")
    output = run("tutorial", 12, cwd=folder)
    contains(output, "Word: apple (5 letters)", "Integer: -3", "Integer: 7")
    report = reports / "words-and-numbers.txt"
    first_report = report.read_text()
    run("tutorial", 12, cwd=folder)
    assert report.read_text() == first_report * 2, "Append mode lost or changed earlier output"

    custom_input = folder / "custom input.txt"
    custom_output = folder / "custom output.txt"
    custom_input.write_text("\n  kiwi\t-12 +8\n0")
    run("tutorial", 12, custom_input, custom_output)
    assert custom_output.read_text().splitlines() == [
        "New tutorial run", "Word: kiwi (4 letters)", "Integer: -12", "Integer: 8", "Integer: 0"
    ]
    contains(run("tutorial", 12, folder / "missing.txt", custom_output, code=1), "Cannot open input")
    contains(run("tutorial", 12, custom_input, folder / "missing" / "out.txt", code=1), "Cannot open output")
    custom_input.write_text("+\n")
    contains(run("tutorial", 12, custom_input, custom_output, code=1), "Expected an integer")
print("PASS tutorial 12: default paths, custom paths with spaces, append, and file errors")

contains(run("--list"), "1 Surveying", "18  Using the original CircleX")
assert run("tutorial") == run("tutorial", "--list")
for args in [("tutorial", "0"), ("tutorial", "19"), ("tutorial", "3oops"),
             ("tutorial", "1", "extra"), ("tutorial", "12", "missing-output"), ("unknown",)]:
    contains(run(*args, code=1), "Usage:")
contains(run("tutorial", 2, text=""), "Input finished")
contains(run(1, text="100 100 30\n"), "5 streetlights are required.", "Angle=15 degrees")
contains(run(1, text="100 100 0\n", code=1), "All values must be greater than zero.")
contains(run(4, "input.txt", "output.txt", code=1), "Lab 04: implement")
contains(run(5), "Y = [", "];")
contains(run(8), "In MATLAB")
contains(run(9), "In MATLAB")
print("PASS runner selection, invalid arguments, and existing lab routes")
print("All 18 C++ tutorials passed. MATLAB scripts require separate MATLAB verification.")
