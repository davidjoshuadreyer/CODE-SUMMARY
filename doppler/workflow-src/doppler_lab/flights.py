"""Bounded local flight-data ingestion; no network requests or implicit units."""
from __future__ import annotations

import csv
from datetime import datetime, timezone
import gzip
import io
import json
import math
from pathlib import Path

import numpy as np

MAX_BYTES = 64 * 1024 * 1024
MAX_SAMPLES = 500_000
DATUMS = {"geometric", "barometric", "unknown"}


def _number(value, name):
    if isinstance(value, bool):
        raise ValueError(f"{name} must be a finite number")
    try:
        result = float(value)
    except (TypeError, ValueError) as exc:
        raise ValueError(f"{name} must be a finite number") from exc
    if not math.isfinite(result):
        raise ValueError(f"{name} must be a finite number")
    return result


def _time(value):
    if isinstance(value, str):
        try:
            return _unix_seconds(value)
        except ValueError:
            try:
                parsed = datetime.fromisoformat(value.strip().replace("Z", "+00:00"))
                if parsed.tzinfo is None or parsed.utcoffset() is None:
                    raise ValueError("ISO time requires an explicit timezone")
                return parsed.timestamp()
            except (ValueError, OverflowError) as exc:
                raise ValueError("time_utc must be Unix seconds or ISO 8601 with timezone") from exc
    return _unix_seconds(value)


def _unix_seconds(value):
    timestamp = _number(value, "time_utc")
    try:
        datetime.fromtimestamp(timestamp, timezone.utc)
    except (ValueError, OverflowError, OSError) as exc:
        raise ValueError("time_utc is outside supported calendar range; supply Unix seconds, not milliseconds") from exc
    return timestamp


def _track(flight_id, rows, datum="unknown", warnings=None):
    if not isinstance(flight_id, str) or not flight_id.strip():
        raise ValueError("Each track requires a nonempty string flight_id")
    if not isinstance(datum, str) or datum not in DATUMS:
        raise ValueError("altitude_datum must be geometric, barometric, or unknown")
    if len(rows) < 2 or len(rows) > MAX_SAMPLES:
        raise ValueError(f"Track {flight_id}: requires 2–{MAX_SAMPLES} points")
    values = np.asarray([[_time(r[0]), _number(r[1], "latitude"),
                          _number(r[2], "longitude"), _number(r[3], "altitude_m")]
                         for r in rows], dtype=float)
    if np.any(np.abs(values[:, 1]) > 90) or np.any(np.abs(values[:, 2]) > 180):
        raise ValueError(f"Track {flight_id}: latitude/longitude outside WGS84 degree bounds")
    if np.any((values[:, 3] < -1000) | (values[:, 3] > 100_000)):
        raise ValueError(f"Track {flight_id}: altitude outside supported -1000 to 100000 metres")
    notes = list(warnings or [])
    if np.any(np.diff(values[:, 0]) < 0):
        notes.append("Input points were sorted by UTC time.")
    values = values[np.argsort(values[:, 0], kind="stable")]
    if np.any(np.diff(values[:, 0]) <= 0):
        raise ValueError(f"Track {flight_id}: duplicate timestamps; resolve them before import")
    if np.any(np.diff(values[:, 0]) > 30):
        notes.append("Track contains gaps over 30 seconds; do not interpolate across them.")
    if datum != "geometric":
        notes.append(f"Altitude datum is {datum}; heights are not verified WGS84 ellipsoid heights. No conversion was applied.")
    return dict(flight_id=flight_id.strip(), times_utc=values[:, 0],
                latitudes=values[:, 1], longitudes=values[:, 2],
                altitudes_m=values[:, 3], altitude_datum=datum, warnings=notes)


def _normalized_json(data):
    tracks = data.get("tracks")
    if not isinstance(tracks, list) or not tracks:
        raise ValueError("Normalized JSON requires a nonempty tracks list")
    output = []
    total = 0
    keys = ("times_utc", "latitudes", "longitudes", "altitudes_m")
    for item in tracks:
        if not isinstance(item, dict) or any(not isinstance(item.get(k), list) for k in keys):
            raise ValueError("Each track requires times_utc, latitudes, longitudes, altitudes_m arrays")
        lengths = [len(item[k]) for k in keys]
        total += lengths[0]
        if len(set(lengths)) != 1 or total > MAX_SAMPLES:
            raise ValueError("Track arrays must have equal lengths and at most 500000 total points")
        output.append(_track(item.get("flight_id"), list(zip(*(item[k] for k in keys))),
                             item.get("altitude_datum", "unknown")))
    return output


def _readsb(data, altitude_source):
    base = _time(data.get("timestamp"))
    entries = data.get("trace")
    if not isinstance(entries, list) or len(entries) > MAX_SAMPLES:
        raise ValueError("readsb trace must be a list of at most 500000 points")
    buckets = {"geometric": [], "barometric": []}
    stale = missing = ground = 0
    for entry in entries:
        if not isinstance(entry, list) or len(entry) < 7:
            raise ValueError("Malformed readsb trace row: at least seven entries required")
        flag_value = _number(entry[6], "readsb flags")
        if flag_value < 0 or not flag_value.is_integer():
            raise ValueError("readsb flags must be a nonnegative integer")
        flags = int(flag_value)
        if flags & 1:
            stale += 1
            continue
        if entry[3] == "ground":
            ground += 1
            continue
        if entry[1] is None or entry[2] is None:
            missing += 1
            continue
        row = [base + _number(entry[0], "trace time offset"), entry[1], entry[2]]
        geom = entry[10] if len(entry) > 10 else None
        extras = entry[8] if len(entry) > 8 and isinstance(entry[8], dict) else {}
        if geom is None:
            geom = extras.get("alt_geom")
        if geom is None and flags & 8:
            geom = entry[3]
        baro = entry[3] if not flags & 8 else extras.get("alt_baro")
        for source, altitude in (("geometric", geom), ("barometric", baro)):
            if altitude is not None and altitude != "ground":
                buckets[source].append(row + [_number(altitude, "readsb altitude feet") * 0.3048])
    selected = altitude_source
    if selected == "auto":
        selected = "geometric" if len(buckets["geometric"]) >= 2 else "barometric"
    notes = [f"readsb {selected} altitude selected uniformly; feet converted to metres.",
             f"Excluded {stale} stale, {ground} ground, and {missing} missing-position points."]
    excluded = len(entries) - stale - ground - missing - len(buckets[selected])
    if excluded:
        notes.append(f"Excluded {excluded} points lacking {selected} altitude; no mixed-datum fallback.")
    return [_track(data.get("icao") or data.get("hex") or data.get("flight_id"),
                   buckets[selected], selected, notes)]


def load_tracks(path, altitude_source="auto"):
    """Read normalized CSV/JSON or a readsb trace, optionally gzip compressed.

    altitude_source selects auto/geometric/barometric for readsb only. Auto
    prefers geometric if at least two usable points exist, never mixes datums.
    Normalized timestamps are seconds or timezone-qualified ISO timestamps.
    """
    if not isinstance(altitude_source, str) or altitude_source not in {"auto", "geometric", "barometric"}:
        raise ValueError("altitude_source must be auto, geometric, or barometric")
    path = Path(path)
    if path.stat().st_size > MAX_BYTES:
        raise ValueError("Track file exceeds the 64 MiB input limit")
    with path.open("rb") as stream:
        compressed = stream.read(2) == b"\x1f\x8b"
    opener = gzip.open if compressed else open
    try:
        with opener(path, "rb") as stream:
            raw = stream.read(MAX_BYTES + 1)
        if len(raw) > MAX_BYTES:
            raise ValueError("Decompressed track data exceeds 64 MiB")
        content = raw.decode("utf-8-sig")
    except (OSError, UnicodeError, EOFError) as exc:
        raise ValueError(f"Cannot decode track file: {exc}") from exc
    if content.lstrip().startswith(("{", "[")):
        try:
            data = json.loads(content)
        except (json.JSONDecodeError, RecursionError) as exc:
            raise ValueError("Invalid track JSON") from exc
        if not isinstance(data, dict):
            raise ValueError("Track JSON must be an object")
        tracks = _readsb(data, altitude_source) if "trace" in data else _normalized_json(data)
    else:
        reader = csv.DictReader(io.StringIO(content))
        fields = {"flight_id", "time_utc", "latitude", "longitude", "altitude_m"}
        if not fields.issubset(reader.fieldnames or []):
            raise ValueError("CSV requires flight_id,time_utc,latitude,longitude,altitude_m columns")
        groups, datums = {}, {}
        for index, row in enumerate(reader):
            if index >= MAX_SAMPLES:
                raise ValueError("CSV exceeds 500000 points")
            identity = (row.get("flight_id") or "").strip()
            datum = (row.get("altitude_datum") or "unknown").strip()
            if identity in datums and datums[identity] != datum:
                raise ValueError(f"Track {identity}: mixed altitude datums")
            datums[identity] = datum
            groups.setdefault(identity, []).append([row.get(k) for k in
                ("time_utc", "latitude", "longitude", "altitude_m")])
        tracks = [_track(identity, rows, datums[identity]) for identity, rows in groups.items()]
    if not tracks:
        raise ValueError("File contains no tracks")
    identities = [t["flight_id"] for t in tracks]
    if len(identities) != len(set(identities)):
        raise ValueError("Track flight_id values must be unique")
    return tracks


def candidate_grid(lat_min, lat_max, lon_min, lon_max, spacing_m,
                   elevation_m=0.0, max_points=10000):
    """Small rectangular WGS84 grid with supplied constant ellipsoid elevation.

    Approximate metric spacing; endpoints included. No terrain/DEM inference.
    Bounds must not cross the antimeridian and spans cannot exceed 5 degrees.
    """
    lat_min, lat_max, lon_min, lon_max, spacing_m, elevation_m = [
        _number(v, n) for v, n in zip(
            (lat_min, lat_max, lon_min, lon_max, spacing_m, elevation_m),
            ("lat_min", "lat_max", "lon_min", "lon_max", "spacing_m", "elevation_m"))]
    if not (-85 <= lat_min <= lat_max <= 85 and -180 <= lon_min <= lon_max <= 180):
        raise ValueError("Grid requires ordered longitude bounds and latitudes within ±85°")
    if lat_max - lat_min > 5 or lon_max - lon_min > 5:
        raise ValueError("Local candidate grid spans must not exceed 5 degrees")
    if spacing_m <= 0 or not -1000 <= elevation_m <= 10000:
        raise ValueError("Spacing must be positive and elevation between -1000 and 10000 metres")
    if isinstance(max_points, bool) or not isinstance(max_points, int) or not 1 <= max_points <= 100000:
        raise ValueError("max_points must be an integer from 1 to 100000")
    lat_distance = (lat_max - lat_min) * 111_320
    lon_distance = (lon_max - lon_min) * 111_320 * math.cos(math.radians((lat_min + lat_max) / 2))
    if max(lat_distance, lon_distance) / spacing_m > max_points:
        raise ValueError("Grid exceeds max_points; enlarge spacing or reduce bounds")
    nlat = max(1, math.ceil(lat_distance / spacing_m) + 1)
    nlon = max(1, math.ceil(lon_distance / spacing_m) + 1)
    if nlat * nlon > max_points:
        raise ValueError(f"Grid would contain {nlat * nlon} points, above limit {max_points}")
    return [dict(latitude=float(lat), longitude=float(lon), elevation_m=elevation_m)
            for lat in np.linspace(lat_min, lat_max, nlat)
            for lon in np.linspace(lon_min, lon_max, nlon)]
