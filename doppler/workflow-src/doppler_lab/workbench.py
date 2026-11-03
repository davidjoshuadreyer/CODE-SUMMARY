"""Small, UI-independent helpers for reproducible analysis sessions."""
from __future__ import annotations

import json
from datetime import datetime, timezone

import numpy as np


def json_ready(value):
    if isinstance(value, np.ndarray):
        return value.tolist()
    if isinstance(value, np.generic):
        return value.item()
    if isinstance(value, dict):
        return {str(k): json_ready(v) for k, v in value.items()}
    if isinstance(value, (list, tuple)):
        return [json_ready(v) for v in value]
    return value


def dump_json(value):
    return json.dumps(json_ready(value), indent=2, allow_nan=False)


def parse_utc(value: str) -> float:
    dt = datetime.fromisoformat(value.strip().replace("Z", "+00:00"))
    if dt.tzinfo is None:
        raise ValueError("Include a UTC offset or Z, for example 2026-11-02T20:37:00Z.")
    return dt.timestamp()


def format_utc(value: float) -> str:
    return datetime.fromtimestamp(float(value), timezone.utc).isoformat().replace("+00:00", "Z")


def parse_anchors(text: str) -> list[dict]:
    anchors = []
    for line_number, line in enumerate(text.splitlines(), 1):
        if not line.strip():
            continue
        try:
            t, f = (float(part.strip()) for part in line.split(","))
        except ValueError as exc:
            raise ValueError(f"Anchor line {line_number}: use time_seconds,frequency_hz.") from exc
        if not np.isfinite([t, f]).all() or t < 0 or f <= 0:
            raise ValueError(f"Anchor line {line_number}: values must be finite; time >= 0 and frequency > 0.")
        anchors.append({"time_s": t, "frequency_hz": f})
    return anchors


def make_demo_audio(demo, sample_rate=4000):
    """Audible synthetic flyovers, using the same labelled demo geometry.

    This is a plumbing demonstration, not independent physical validation.
    Independent analytic physics checks live in tests/test_physics.py.
    """
    from .physics import predict_received_curve

    end = max(float(np.max(e["times_s"])) for e in demo["events"]) + 8
    t = np.arange(int(end * sample_rate), dtype=float) / sample_rate
    samples = np.random.default_rng(2026).normal(0, 0.018, len(t))
    tracks = {track["flight_id"]: track for track in demo["tracks"]}
    for event in demo["events"]:
        curve = predict_received_curve(tracks[event["flight_id"]], demo["observer"])
        ct = np.asarray(curve["times_utc"]) - demo["recording_start_utc"]
        ratio = np.asarray(curve["frequency_ratio"])
        et = np.asarray(event["times_s"])
        observed = np.asarray(event["frequencies_hz"])
        er = np.interp(et, ct, ratio)
        f0 = float(np.dot(er, observed) / np.dot(er, er))
        valid = np.isfinite(ct) & np.isfinite(ratio)
        f = f0 * np.interp(t, ct[valid], ratio[valid])
        phase = 2 * np.pi * np.cumsum(f) / sample_rate
        envelope = np.clip((t - et[0] + 3) / 3, 0, 1) * np.clip((et[-1] + 3 - t) / 3, 0, 1)
        samples += envelope * (0.22 * np.sin(phase) + 0.045 * np.sin(2 * phase))
    return samples.astype(np.float32), sample_rate
