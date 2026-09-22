"""Exercise the real local HTTP dashboard and C++ processes; no browser required.

Run: python scripts/check_dashboard.py. Requires a previously built project.
"""
import importlib.util
import json
from pathlib import Path
import threading
import time
import unittest
from urllib.error import HTTPError
from urllib.request import Request, urlopen
import uuid

ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location("course_dashboard", ROOT / "dashboard/server.py")
dashboard = importlib.util.module_from_spec(spec)
spec.loader.exec_module(dashboard)


class DashboardTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.server = dashboard.ThreadingHTTPServer(("127.0.0.1", 0), dashboard.Handler)
        cls.url = f"http://127.0.0.1:{cls.server.server_address[1]}"
        cls.thread = threading.Thread(target=cls.server.serve_forever, daemon=True)
        cls.thread.start()

    @classmethod
    def tearDownClass(cls):
        dashboard.RUNNER.stop()
        cls.server.shutdown()
        cls.server.server_close()

    def tearDown(self):
        dashboard.RUNNER.stop()

    def request(self, path, body=None, expected=200, authorized=True, headers=None):
        values = {"Content-Type": "application/json"}
        if authorized:
            values["X-Dashboard-Token"] = dashboard.TOKEN
        values.update(headers or {})
        request = Request(self.url + path, data=None if body is None else json.dumps(body).encode(), headers=values)
        try:
            response = urlopen(request, timeout=20)
        except HTTPError as error:
            response = error
        self.assertEqual(response.status, expected, response.read() if response.status != expected else "")
        return json.loads(response.read())

    def wait(self, condition, timeout=10):
        deadline = time.monotonic() + timeout
        while time.monotonic() < deadline:
            state = self.request("/api/session")
            if condition(state):
                return state
            time.sleep(0.04)
        self.fail(f"Timed out waiting for program: {state}")

    def test_catalog_and_source(self):
        result = self.request("/api/catalog")
        self.assertEqual(len(result["programs"]), 85)
        self.assertEqual(len([p for p in result["programs"] if p["kind"] == "examples"]), 58)
        program = next(p for p in result["programs"] if p["id"] == "example:testCircleWithPrivateDataFields")
        self.assertIn("reference/examples/Objects_and_Classes/CircleWithPrivateDataFields.cpp", program["files"])
        source = self.request("/api/source?id=example:testCircleWithPrivateDataFields")
        self.assertIn("testCircleWithPrivateDataFields", source["content"])
        self.request("/api/source?id=example:testCircleWithPrivateDataFields&file=main.cpp", expected=400)
        self.request("/api/source?id=example:testCircleWithPrivateDataFields&file=../../secret", expected=400)

    def test_run_reference(self):
        self.request("/api/run", {"id": "example:testCircleWithHeader"})
        result = self.wait(lambda s: s["status"] != "running")
        self.assertEqual(result["exitCode"], 0)
        self.assertIn("radius 100 is 31415.9", result["output"])

    def test_live_input_and_concurrency(self):
        session = self.request("/api/run", {"id": "lab:1"})
        self.wait(lambda s: "radius of curvature" in s["output"])
        self.request("/api/run", {"id": "tutorial:1"}, expected=400)
        self.request("/api/input", {"session": session["id"], "text": "100"})
        self.wait(lambda s: "distance between" in s["output"])
        self.request("/api/input", {"session": session["id"], "text": "100\n30"})
        result = self.wait(lambda s: s["status"] != "running")
        self.assertEqual(result["exitCode"], 0)
        self.assertIn("5 streetlights", result["output"])
        self.request("/api/input", {"session": session["id"], "text": "123"}, expected=400)

    def test_eof_and_stop(self):
        session = self.request("/api/run", {"id": "tutorial:2"})
        self.wait(lambda s: "Enter temperature" in s["output"])
        self.request("/api/input", {"session": session["id"], "close": True})
        result = self.wait(lambda s: s["status"] != "running")
        self.assertEqual(result["status"], "success")
        self.assertIn("Input finished", result["output"])
        session = self.request("/api/run", {"id": "tutorial:2"})
        self.request("/api/stop", {"session": session["id"]})
        self.wait(lambda s: s["status"] == "stopped")
        self.wait(lambda s: s["exitCode"] is not None)

    def test_file_output_preview(self):
        target = ROOT / "tutorials/output" / f"dashboard-check-{uuid.uuid4().hex}.txt"
        try:
            self.request("/api/run", {"id": "tutorial:12", "outputFile": target.relative_to(ROOT).as_posix()})
            result = self.wait(lambda s: s["status"] != "running")
            self.assertEqual(result["status"], "success")
            files = self.request("/api/outputs?id=tutorial:12")
            self.assertIn(target.relative_to(ROOT).as_posix(), files)
            output = self.request(f"/api/output?id=tutorial:12&file={files[0]}")
            self.assertIn("Word: apple (5 letters)", output["content"])
            self.request("/api/run", {"id": "tutorial:12", "outputFile": "main.cpp"}, expected=400)
            self.request("/api/run", {"id": "tutorial:12", "outputFile": "../../outside.txt"}, expected=400)
        finally:
            self.assertEqual(target.resolve().parent, (ROOT / "tutorials/output").resolve())
            target.unlink(missing_ok=True)

    def test_request_limits_and_matlab(self):
        self.request("/api/run", {"id": "tutorial:1"}, expected=403, authorized=False)
        self.request("/api/catalog", expected=403, headers={"Host": "untrusted.example"})
        self.request("/api/run", {"id": "not-a-program"}, expected=400)
        self.request("/api/run", {"id": ["tutorial:1"]}, expected=400)
        self.request("/api/run", {"id": "lab:8"}, expected=400)
        self.request("/api/input", {"text": 123}, expected=400)

    def test_build(self):
        self.request("/api/build", {})
        result = self.wait(lambda s: s["status"] != "running", timeout=180)
        self.assertEqual(result["status"], "success", result["output"][-3000:])
        self.assertIn("main.exe", result["output"])


if __name__ == "__main__":
    unittest.main(verbosity=2)
