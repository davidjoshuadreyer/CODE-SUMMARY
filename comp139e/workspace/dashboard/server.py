"""Local COMP 139E dashboard. Standard library only; run through scripts/dashboard.ps1."""
from __future__ import annotations

import argparse
import codecs
import json
import os
from pathlib import Path
import re
import secrets
import signal
import subprocess
import threading
import time
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import parse_qs, urlparse
import webbrowser

ROOT = Path(__file__).resolve().parents[1]
ASSETS = Path(__file__).resolve().parent
MAIN = ROOT / "build/bin/main.exe"
WORK_FILES = ROOT / "build/reference-work/src/Files_and_Exception_Handling/Files"
TOKEN = secrets.token_urlsafe(32)
MAX_OUTPUT = 2_000_000
LABS = ["Surveying & streetlights", "Grades & input validation", "Spherical coordinates",
        "Files & text processing", "Digital controllers", "Linked stacks", "STL vectors",
        "Harmonic motion", "Numerical integration"]
TUTORIALS = ["Variables & arithmetic", "Input & decisions", "Functions & references",
             "Arrays & strings", "Pointers & memory", "Modules & testing", "Objects & classes",
             "Inheritance & polymorphism", "Templates", "Linked lists", "Stacks & queues",
             "Files & text processing", "Exceptions", "Vectors & iterators", "Feedback control",
             "Harmonic motion", "Numerical integration", "The CircleX reference demo"]
INPUTS = {
    "checkFile": ("scores.txt", "Enter a filename from the copied reference data, for example scores.txt."),
    "computeAverage": ("3 6 9", "Enter three numbers, separated by spaces."),
    "computeAreaWithConsoleInput": ("2", "Enter a radius."),
    "testVoidFunction": ("85", "Enter a score from 0 to 100."),
    "testLoanClass": ("8.25\n5\n120000.95", "Enter an interest rate, number of years, and loan amount, in that order."),
    "testStringClass": ("banana na NA", "Enter a word, the text to replace, and the replacement, separated by spaces."),
}
for _name in ("testQuotientWithFunction", "testQuotientWithException", "testQuotientThrowRuntimeError"):
    INPUTS[_name] = ("12 3", "Enter two integers. Try 12 0 to see the exception example.")


def relative(path: Path) -> str:
    return path.relative_to(ROOT).as_posix()


def inside(path: str) -> Path:
    result = (ROOT / path).resolve()
    if not result.is_relative_to(ROOT):
        raise ValueError("Choose a file inside this course folder.")
    return result


def source_files(source: str) -> list[str]:
    """Follow local headers and their matching implementations, staying in this workspace."""
    queue = [inside(source)]
    found = []
    while queue and len(found) < 40:
        path = queue.pop(0)
        if not path.is_file() or not path.is_relative_to(ROOT) or relative(path) in found:
            continue
        if path.suffix not in {".cpp", ".hpp", ".h", ".m"}:
            continue
        found.append(relative(path))
        content = path.read_text(encoding="utf-8-sig", errors="replace")
        for include in re.findall(r'^\s*#include\s+"([^"]+)"', content, re.M):
            for candidate in [path.parent / include, ROOT / include]:
                candidate = candidate.resolve()
                if candidate.is_file() and candidate.is_relative_to(ROOT):
                    queue.append(candidate)
                    if candidate.suffix in {".hpp", ".h"}:
                        queue.append(candidate.with_suffix(".cpp"))
                    break
    return found


def pretty(name: str) -> str:
    name = re.sub(r"^Test(?=[A-Z])", "", name)
    name = re.sub(r"([a-z0-9])([A-Z])", r"\1 \2", name)
    return name.replace("_", " ").replace("Obejcts", "Objects")


def catalog() -> list[dict]:
    programs = []
    for index, title in enumerate(LABS, 1):
        folder = f"labs/lab{index:02}"
        source = f"{folder}/lab.cpp"
        if index == 5:
            source = f"{folder}/controllerMain.cpp"
        if index >= 8:
            source = f"{folder}/" + ("harmonicScript.m" if index == 8 else "integrationError.m")
        programs.append(dict(id=f"lab:{index}", kind="labs", title=title, label=f"Lab {index:02}",
                             group="Course assignments", source=source, command=[str(MAIN), str(index)],
                             runnable=index < 8, note="Open this script in MATLAB to run it." if index >= 8 else "",
                             files=[relative(p) for p in sorted((ROOT / folder).glob("*"))
                                    if p.suffix in {".cpp", ".hpp", ".m"}]))
    for index, title in enumerate(TUTORIALS, 1):
        source = next((ROOT / "tutorials").glob(f"{index:02}_*.cpp"))
        programs.append(dict(id=f"tutorial:{index}", kind="tutorials", title=title, label=f"Lesson {index:02}",
                             group="Guided lessons", source=relative(source), command=[str(MAIN), "tutorial", str(index)],
                             runnable=True, note="", files=source_files(relative(source))))

    # Discover the same no-argument entry functions used by the CMake example build.
    for source in sorted((ROOT / "reference/examples").rglob("*.cpp")):
        content = source.read_text(encoding="utf-8-sig", errors="replace")
        entries = re.findall(r"^int\s+(\w+)\s*\(\s*(?:void)?\s*\)\s*\{", content, re.M)
        if source.name == "CricleX.cpp":
            entries = ["circleXDemo"]
        for entry in entries:
            title = pretty(source.stem) if len(entries) == 1 else pretty(entry[4:] if entry.startswith("test") else entry)
            programs.append(dict(id=f"example:{entry}", kind="examples", title=title, label=source.name,
                                 group=source.parent.name.replace("_", " "), source=relative(source),
                                 command=[str(ROOT / f"build/bin/examples/example_{entry}.exe")],
                                 runnable=True, note="", files=source_files(relative(source))))
    for entry, source, title in [
        ("shapeExample", "ShapeExample/shapeMain.cpp", "Shapes & polymorphism"),
        ("controllerExample", "DigitalController/controllerMain.cpp", "Proportional controller"),
        ("trigTests", "testTrigMain.cpp", "Lab 3 instructor tests"),
    ]:
        source = "reference/course/labs/files/" + source
        programs.append(dict(id=f"example:{entry}", kind="examples", title=title, label=Path(source).name,
                             group="Course reference drivers", source=source,
                             command=[str(ROOT / f"build/bin/examples/example_{entry}.exe")], runnable=True,
                             note="Uses your Lab 3 functions; unfinished functions report TODO errors." if entry == "trigTests" else "",
                             files=source_files(source)))
    for program in programs:
        name = program["id"].split(":")[1]
        sample, hint = INPUTS.get(name, ("", "This program normally runs without keyboard input."))
        if program["id"] == "lab:1":
            sample, hint = "100\n100\n30", "Enter the radius, peg distance, and maximum light spacing, in that order."
        if program["id"] == "tutorial:2":
            sample, hint = "-1\n25\nq", "Enter temperatures from 0 to 40. Enter q to finish."
        program.update(sample=sample, inputHint=hint, built=Path(program["command"][0]).is_file(),
                       fileArgs=program["id"] in {"lab:4", "tutorial:12"})
        if program["id"] == "example:testBadAllocExceptionDemo":
            program["note"] = "This demo uses a 1 MiB teaching allocation limit to demonstrate bad_alloc."
        if program["kind"] == "labs" and program["runnable"]:
            text = "\n".join(inside(p).read_text(errors="replace") for p in program["files"])
            if re.search(r'throw\s+(?:std::)?logic_error\("(?:TODO|Lab)', text):
                program["note"] = "Contains starter functions. A TODO message means that part of the lab still needs implementing."
        if program["fileArgs"]:
            program["inputFile"] = "labs/lab04/data/textAndNumbers.txt" if program["kind"] == "labs" else "tutorials/data/mixed.txt"
            program["outputFile"] = "labs/lab04/output.txt" if program["kind"] == "labs" else "tutorials/output/words-and-numbers.txt"
    return programs


def find_program(identifier: str) -> dict:
    return next((p for p in catalog() if p["id"] == identifier), None) or fail("Program not found.")


def fail(message):
    raise ValueError(message)


class Runner:
    def __init__(self):
        self.lock = threading.RLock()
        self.process = None
        self.session = None
        self.output_files = {}

    def snapshot(self):
        with self.lock:
            return dict(self.session) if self.session else None

    def start(self, identifier: str, options: dict):
        with self.lock:
            if self.session and self.session["status"] == "running":
                raise ValueError("A program is already running. Stop it before starting another.")
            if identifier == "build":
                command = ["powershell.exe", "-NoProfile", "-ExecutionPolicy", "Bypass", "-File", str(ROOT / "scripts/build.ps1")]
            else:
                program = find_program(identifier)
                if not program["runnable"]:
                    raise ValueError("This is a MATLAB script. Open it in MATLAB to run it.")
                command = list(program["command"])
                if not Path(command[0]).is_file():
                    raise ValueError("Build the course programs first using the Build button.")
                if program["fileArgs"]:
                    input_file = inside(options.get("inputFile") or program["inputFile"])
                    output_file = inside(options.get("outputFile") or program["outputFile"])
                    if input_file == output_file:
                        raise ValueError("Choose different input and output files.")
                    if output_file.suffix != ".txt":
                        raise ValueError("Use a .txt file for output.")
                    # The dashboard only allows output in the lab's or tutorial's own folder.
                    allowed = ROOT / ("labs/lab04" if identifier == "lab:4" else "tutorials/output")
                    if not output_file.is_relative_to(allowed.resolve()):
                        raise ValueError(f"Save output inside {relative(allowed)}.")
                    if not input_file.is_file() or not output_file.parent.is_dir():
                        raise ValueError("The input file and output folder must exist.")
                    command += [str(input_file), str(output_file)]
                    self.output_files[identifier] = output_file
            process = subprocess.Popen(command, cwd=ROOT, stdin=subprocess.PIPE, stdout=subprocess.PIPE,
                                       stderr=subprocess.STDOUT, bufsize=0,
                                       creationflags=subprocess.CREATE_NO_WINDOW if os.name == "nt" else 0,
                                       start_new_session=os.name != "nt")
            self.process = process
            self.session = dict(id=secrets.token_hex(8), program=identifier, status="running", output="",
                                exitCode=None, started=time.time(), ended=None, inputClosed=identifier == "build",
                                truncated=False)
            if identifier == "build":
                process.stdin.close()
            session = self.session
            threading.Thread(target=self.read, args=(process, session), daemon=True).start()
            return dict(session)

    def read(self, process, session):
        decoder = codecs.getincrementaldecoder("utf-8")("replace")
        try:
            while True:
                chunk = process.stdout.read(4096)
                if not chunk:
                    break
                text = decoder.decode(chunk)
                with self.lock:
                    remaining = MAX_OUTPUT - len(session["output"])
                    session["output"] += text[:max(0, remaining)]
                    if len(text) > remaining:
                        session["truncated"] = True
            with self.lock:
                session["output"] += decoder.decode(b"", final=True)
        finally:
            code = process.wait()
            process.stdout.close()
            if not process.stdin.closed:
                process.stdin.close()
            with self.lock:
                session["exitCode"] = code
                session["ended"] = time.time()
                if session["status"] != "stopped":
                    session["status"] = "success" if code == 0 else "error"

    def input(self, session_id, text="", close=False):
        with self.lock:
            if not isinstance(text, str) or not isinstance(close, bool):
                raise ValueError("Input must be text; the EOF flag must be true or false.")
            if not self.session or self.session["id"] != session_id or self.session["status"] != "running":
                raise ValueError("This program is no longer running.")
            if self.session["inputClosed"]:
                raise ValueError("Input is already closed.")
            if len(text.encode("utf-8")) > 2048:
                raise ValueError("Send up to 2,048 bytes of input at a time.")
            process = self.process
            session = self.session
        # A program can stop reading its pipe. Do not hold the runner lock while
        # writing: Stop must remain available even if this write has to wait.
        try:
            if close:
                process.stdin.close()
                with self.lock:
                    session["inputClosed"] = True
            else:
                process.stdin.write((text + "\n").encode("utf-8"))
                process.stdin.flush()
        except (BrokenPipeError, OSError, ValueError):
            raise ValueError("The program has finished reading input.")

    def stop(self, session_id=None):
        with self.lock:
            if not self.session or self.session["status"] != "running":
                return
            if session_id and self.session["id"] != session_id:
                raise ValueError("This run has already ended.")
            process = self.process
            # Kill only the process tree belonging to this dashboard run.
            if os.name == "nt":
                subprocess.run(["taskkill.exe", "/PID", str(process.pid), "/T", "/F"],
                               capture_output=True, creationflags=subprocess.CREATE_NO_WINDOW, timeout=15)
            else:
                os.killpg(process.pid, signal.SIGTERM)
            self.session["status"] = "stopped"
            self.session["ended"] = time.time()


RUNNER = Runner()


def outputs(identifier: str):
    program = find_program(identifier)
    paths = []
    if program["group"] == "Files and Exception Handling":
        paths = sorted(WORK_FILES.glob("*.txt"))
    elif program["fileArgs"]:
        paths = [RUNNER.output_files.get(identifier, inside(program["outputFile"]))]
    return [relative(p) for p in paths if p.is_file() and p.resolve().is_relative_to(ROOT)]


class Handler(BaseHTTPRequestHandler):
    def log_message(self, *args):
        pass

    def send(self, value, status=200, kind="application/json; charset=utf-8"):
        data = json.dumps(value).encode() if kind.startswith("application/json") else value
        self.send_response(status)
        self.send_header("Content-Type", kind)
        self.send_header("Content-Length", str(len(data)))
        self.send_header("Cache-Control", "no-store")
        self.send_header("X-Content-Type-Options", "nosniff")
        self.send_header("Content-Security-Policy", "default-src 'self'; style-src 'self'; script-src 'self'; connect-src 'self'; img-src 'self' data:; frame-ancestors 'none'")
        try:
            self.end_headers()
            self.wfile.write(data)
        except (ConnectionError, BrokenPipeError):
            # Navigation or closing a tab may cancel an in-flight preview.
            self.close_connection = True

    def local(self):
        port = self.server.server_address[1]
        return self.headers.get("Host") in {f"127.0.0.1:{port}", f"localhost:{port}"}

    def do_GET(self):
        if not self.local():
            return self.send({"error": "Use the dashboard's localhost address."}, 403)
        url = urlparse(self.path)
        query = parse_qs(url.query)
        try:
            if url.path == "/api/catalog":
                programs = catalog()
                # Keep launch commands server-side; the browser selects only catalog IDs.
                public = [{k: v for k, v in p.items() if k != "command"} for p in programs]
                default = "example:testCircleWithPrivateDataFields"
                active = re.search(r'ACTIVE_EXAMPLE\s*=\s*"([^"]+)"', (ROOT / "main.cpp").read_text())
                if active:
                    match = next((p for p in programs if p["id"].split(":")[1] == active[1] or Path(p["source"]).stem == active[1]), None)
                    if match:
                        default = match["id"]
                return self.send(dict(programs=public, token=TOKEN, default=default))
            if url.path == "/api/session":
                return self.send(RUNNER.snapshot())
            if url.path in {"/api/source", "/api/output"}:
                identifier = query.get("id", [""])[0]
                program = find_program(identifier)
                allowed = program["files"] if url.path == "/api/source" else outputs(identifier)
                name = query.get("file", [program["source"]])[0]
                if name not in allowed:
                    raise ValueError("That file is not part of this program.")
                path = inside(name)
                if path.stat().st_size > 512_000:
                    raise ValueError("This file is too large to preview. Open it in your editor.")
                return self.send(dict(file=name, content=path.read_text(encoding="utf-8-sig", errors="replace")))
            if url.path == "/api/outputs":
                return self.send(outputs(query.get("id", [""])[0]))
            assets = {"/": ("index.html", "text/html; charset=utf-8"),
                      "/app.js": ("app.js", "text/javascript; charset=utf-8"),
                      "/style.css": ("style.css", "text/css; charset=utf-8"),
                      "/favicon.svg": ("favicon.svg", "image/svg+xml")}
            if url.path in assets:
                name, kind = assets[url.path]
                return self.send((ASSETS / name).read_bytes(), kind=kind)
            self.send({"error": "Not found"}, 404)
        except (ValueError, OSError) as error:
            self.send({"error": str(error)}, 400)

    def do_POST(self):
        if not self.local() or self.headers.get("X-Dashboard-Token") != TOKEN:
            return self.send({"error": "Reload the local dashboard and try again."}, 403)
        try:
            length = int(self.headers.get("Content-Length", 0))
            if not 0 < length <= 16384:
                raise ValueError("Request is too large or empty.")
            data = json.loads(self.rfile.read(length))
            if not isinstance(data, dict):
                raise ValueError("Expected a JSON object.")
            for field in ("id", "session", "inputFile", "outputFile"):
                if field in data and not isinstance(data[field], str):
                    raise ValueError(f"{field} must be text.")
            if self.path == "/api/run":
                return self.send(RUNNER.start(data.get("id", ""), data))
            if self.path == "/api/build":
                return self.send(RUNNER.start("build", {}))
            if self.path == "/api/input":
                RUNNER.input(data.get("session"), data.get("text", ""), data.get("close", False))
            elif self.path == "/api/stop":
                RUNNER.stop(data.get("session"))
            else:
                return self.send({"error": "Not found"}, 404)
            self.send({"ok": True})
        except (ValueError, OSError, TypeError, subprocess.SubprocessError) as error:
            self.send({"error": str(error)}, 400)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--port", type=int, default=13900)
    parser.add_argument("--no-browser", action="store_true")
    args = parser.parse_args()
    try:
        server = ThreadingHTTPServer(("127.0.0.1", args.port), Handler)
    except OSError:
        raise SystemExit(f"Port {args.port} is already in use. Open http://127.0.0.1:{args.port} or choose --port 13901.")
    url = f"http://127.0.0.1:{server.server_address[1]}"
    print(f"COMP 139E dashboard: {url}\nKeep this terminal open. Press Ctrl+C to stop.", flush=True)
    if not args.no_browser:
        webbrowser.open(url)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        RUNNER.stop()
        server.server_close()


if __name__ == "__main__":
    main()
