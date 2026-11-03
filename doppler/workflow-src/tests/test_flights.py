import gzip
import json

import numpy as np
import pytest

from doppler_lab.flights import candidate_grid, load_tracks


def write_json(tmp_path, data):
    path = tmp_path / "tracks.json"
    path.write_text(json.dumps(data))
    return path


def test_csv_iso_time_sort_and_unknown_datum(tmp_path):
    path = tmp_path / "tracks.csv"
    path.write_text("flight_id,time_utc,latitude,longitude,altitude_m\n"
                    "A,2026-01-01T00:00:10Z,49.1,-123,1000\n"
                    "A,2026-01-01T00:00:00+00:00,49,-123,999\n")
    track, = load_tracks(path)
    np.testing.assert_allclose(np.diff(track["times_utc"]), [10])
    assert track["latitudes"].tolist() == [49, 49.1]
    assert track["altitude_datum"] == "unknown"
    assert any("sorted" in w for w in track["warnings"])


def test_normalized_json_and_duplicate_time_rejection(tmp_path):
    data = {"tracks": [{"flight_id": "A", "times_utc": [0, 10],
                       "latitudes": [0, 0], "longitudes": [0, 0.1],
                       "altitudes_m": [1000, 1000], "altitude_datum": "geometric"}]}
    track, = load_tracks(write_json(tmp_path, data))
    assert track["altitude_datum"] == "geometric"
    data["tracks"][0]["times_utc"] = [0, 0]
    with pytest.raises(ValueError, match="duplicate"):
        load_tracks(write_json(tmp_path, data))


def test_readsb_gzip_magic_units_sources_and_stale_filter(tmp_path):
    data = {"icao": "abc123", "timestamp": 1000, "trace": [
        [0, 49, -123, 10000, 200, 90, 0, 0, None, "adsb", 11000],
        [5, 49, -122.99, 10000, 200, 90, 1, 0, None, "adsb", 11000],
        [10, 49, -122.98, 10100, 200, 90, 0, 0, {"alt_geom": 11100}],
        [15, 49, -122.97, "ground", 0, 90, 0],
    ]}
    path = tmp_path / "trace_full_abc123.json"
    path.write_bytes(gzip.compress(json.dumps(data).encode()))
    track, = load_tracks(path)
    assert track["altitude_datum"] == "geometric"
    np.testing.assert_allclose(track["times_utc"], [1000, 1010])
    np.testing.assert_allclose(track["altitudes_m"], np.array([11000, 11100]) * 0.3048)
    baro, = load_tracks(path, altitude_source="barometric")
    np.testing.assert_allclose(baro["altitudes_m"], np.array([10000, 10100]) * 0.3048)


def test_readsb_geometric_flag_and_no_mixed_fallback(tmp_path):
    data = {"icao": "abc123", "timestamp": 0, "trace": [
        [0, 0, 0, 10000, 200, 90, 8],
        [10, 0, 0.01, 11000, 200, 90, 8],
        [20, 0, 0.02, 12000, 200, 90, 0],
    ]}
    track, = load_tracks(write_json(tmp_path, data))
    assert len(track["times_utc"]) == 2
    assert track["altitude_datum"] == "geometric"
    assert any("lacking geometric" in w for w in track["warnings"])


@pytest.mark.parametrize("replacement,match", [
    ({"latitudes": [91, 0]}, "latitude"),
    ({"altitudes_m": [float("nan"), 0]}, "finite"),
    ({"times_utc": ["2026-01-01T00:00:00", "2026-01-01T00:00:10"]}, "timezone"),
    ({"times_utc": [1793620800000, 1793620810000]}, "seconds"),
    ({"longitudes": [0]}, "equal"),
    ({"altitude_datum": "MSL"}, "datum"),
])
def test_invalid_normalized(tmp_path, replacement, match):
    item = {"flight_id": "A", "times_utc": [0, 1], "latitudes": [0, 0],
            "longitudes": [0, 0], "altitudes_m": [0, 0]}
    item.update(replacement)
    with pytest.raises(ValueError, match=match):
        load_tracks(write_json(tmp_path, {"tracks": [item]}))


def test_csv_mixed_datums_rejected(tmp_path):
    path = tmp_path / "tracks.csv"
    path.write_text("flight_id,time_utc,latitude,longitude,altitude_m,altitude_datum\n"
                    "A,0,0,0,1000,geometric\nA,10,0,0,1000,barometric\n")
    with pytest.raises(ValueError, match="mixed"):
        load_tracks(path)


def test_grid_bounds_endpoints_and_cap():
    points = candidate_grid(49, 49.01, -123, -122.99, 500, elevation_m=52)
    assert points[0] == {"latitude": 49, "longitude": -123, "elevation_m": 52}
    assert points[-1]["latitude"] == 49.01
    assert points[-1]["longitude"] == -122.99
    assert len(candidate_grid(49, 49, -123, -123, 1)) == 1
    with pytest.raises(ValueError, match="limit|max_points"):
        candidate_grid(49, 50, -123, -122, 1)
    with pytest.raises(ValueError):
        candidate_grid(49, 50, 179, -179, 1000)
    with pytest.raises(ValueError):
        candidate_grid(49, 50, -123, -122, float("nan"))
