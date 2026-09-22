"""Build first; run with python scripts/check_examples.py.

Exercise each original lecture demo, supplying its expected keyboard input.
Working data is restored; original reference sources and fixtures must not change.
"""
from pathlib import Path
import hashlib
import re
import subprocess
import tempfile

ROOT = Path(__file__).resolve().parents[1]
EXE = ROOT / "build/bin/main.exe"
WORK = ROOT / "build/reference-work/src/Files_and_Exception_Handling/Files"


def run(*args, text="", expected=0, cwd=ROOT):
    result = subprocess.run([str(EXE), *args], input=text, text=True,
                            capture_output=True, cwd=cwd, timeout=10)
    output = result.stdout + result.stderr
    assert result.returncode == expected, (args, result.returncode, output)
    return output


def fingerprints():
    return {str(p): hashlib.sha256(p.read_bytes()).hexdigest()
            for p in (ROOT / "reference").rglob("*")
            if p.is_file() and p.suffix in {".cpp", ".h", ".hpp", ".txt"}}


inputs = {
    "checkFile": "scores.txt\n",
    "testQuotientThrowRuntimeError": "12 3\n",
    "testQuotientWithException": "12 3\n",
    "testQuotientWithFunction": "12 3\n",
    "testVoidFunction": "85\n",
    "computeAreaWithConsoleInput": "2\n",
    "computeAverage": "3 6 9\n",
    "testLoanClass": "8.25 5 120000.95\n",
    "testStringClass": "banana na NA\n",
}
expected_fragments = {
    "testCircleWithHeader": ["radius 1 is 3.14159", "radius 5 is 78.5397", "radius 100 is 31415.9"],
    "testBadAllocExceptionDemo": ["Teaching allocation limit", "Exception:"],
    "testStringClass": ["The replaced string is baNANA"],
    "testTwoDArrayUsingVector": ["Sum of all elements is 78"],
    "testArrayQueue": ["Dequeuing: 10", "Dequeuing: 5", "Dequeuing: 15", "Dequeuing: 7"],
    "testListQueue": ["Dequeuing: 10", "Dequeuing: 5", "Dequeuing: 15", "Dequeuing: 7"],
    "circleXDemo": ["Area size is: 78.5"],
    "textFileInput": ["John T Smith 90", "Eric K Jones 85"],
    "controllerExample": ["Y = [", "];"],
    "shapeExample": ["Circle", "Rectangle"],
}

originals = fingerprints()
backup = {p: p.read_bytes() for p in WORK.iterdir() if p.is_file()}
try:
    listing = run("example", "--list")
    assert run("example") == listing
    entries = re.findall(r"^  (\w+)  --  (reference/[^\n]+)", listing, re.M)
    assert len(entries) == 58, f"Expected 55 lecture demos + 3 course drivers, found {len(entries)}"
    results = {}
    # Seed known file input without relying on the student's current working copy.
    run("example", "textFileOutput")
    for name, source in entries:
        if name == "trigTests":
            # The original Lab 3 test driver may rely on unfinished student work.
            result = subprocess.run([str(EXE), "example", name], text=True,
                                    capture_output=True, timeout=10)
            output = result.stdout + result.stderr
            assert result.returncode == 0 or (result.returncode == 1 and "TODO" in output), output
            print("PASS trigTests dispatch (Lab 3 completion is separate)")
            continue
        output = run("example", name, text=inputs.get(name, ""))
        assert source in output
        for fragment in expected_fragments.get(name, []):
            assert fragment in output, (name, fragment, output)
        results[name] = output
        print(f"PASS {name}")

    for alias in ["TestCircleWithHeader", "TestCircleWithHeader.cpp",
                  "reference/examples/Objects_and_Classes/TestCircleWithHeader.cpp"]:
        assert run("example", alias) == results["testCircleWithHeader"]
    # Paths are absolute in the generated catalog and each child sets its own cwd.
    with tempfile.TemporaryDirectory(prefix="reference-launch-") as temp:
        assert run("example", "TestCircleWithHeader", cwd=temp) == results["testCircleWithHeader"]
    assert "several examples" in run("example", "TestStack", expected=1)
    assert "testArrayQueue" in run("example", "TestQueue.cpp", expected=1)
    assert "Unknown example" in run("example", "does-not-exist", expected=1)
    assert "Usage:" in run("example", "TestCircleWithHeader", "extra", expected=1)
    for name in inputs:
        assert "Input ended" in run("example", name, expected=1)
    for name in ["testQuotientThrowRuntimeError", "testQuotientWithException", "testQuotientWithFunction"]:
        assert "zero" in run("example", name, text="12 0\n")
    # The original uses text streams: Windows converts LF to CRLF on output.
    assert (WORK / "state_copy.txt").read_text() == (WORK / "state.txt").read_text()
    assert "John" in (WORK / "formattedscores.txt").read_text()
    assert "Chicago" in (WORK / "city.txt").read_text()
    assert fingerprints() == originals, "An original reference file changed"
    print("PASS aliases, input, error handling, copied file output, and original-file preservation")
finally:
    for path in WORK.iterdir():
        if path.is_file() and path not in backup:
            assert path.resolve().parent == WORK.resolve()
            path.unlink()
    for path, data in backup.items():
        path.write_bytes(data)
