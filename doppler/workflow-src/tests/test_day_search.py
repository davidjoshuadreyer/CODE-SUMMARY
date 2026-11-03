import datetime as dt
import json
import numpy as np
import pytest
from doppler_lab.day_search import fit_event_shape, search_unknown_clock
from test_workflow_solver import synthetic_truth


def archive_fixture(tmp_path):
    events, tracks, old_epoch = synthetic_truth()
    epoch = dt.datetime(2026, 9, 8, 10, tzinfo=dt.timezone.utc).timestamp()
    tracks = [{**t, 'times_utc': t['times_utc']+epoch-old_epoch} for t in tracks]
    path = tmp_path/'tracks.jsonl'
    path.write_text(''.join(json.dumps(t, default=lambda v: v.tolist())+'\n' for t in tracks))
    return events, tracks, epoch, path


def test_physical_shape_is_invariant_to_harmonic_frequency():
    events, _, _ = synthetic_truth()
    original = fit_event_shape(events[0])
    harmonic = fit_event_shape({**events[0], 'frequencies_hz': events[0]['frequencies_hz']*2})
    assert original['speed_m_s'] == pytest.approx(90., abs=.1)
    assert original['closest_slant_range_m'] == pytest.approx(np.hypot(2200,1200), abs=3.)
    assert harmonic['speed_m_s'] == pytest.approx(original['speed_m_s'], abs=.05)
    assert harmonic['closest_arrival_time_s'] == pytest.approx(original['closest_arrival_time_s'], abs=.02)


def test_unknown_clock_pair_recovers_known_truth_without_receiver_grid(tmp_path):
    events, tracks, epoch, path = archive_fixture(tmp_path)
    result = search_unknown_clock(events, path, date_utc='2026-09-08', output_dir=tmp_path/'out',
                                  sample_step_s=10., elevations_m=(0.,), max_hypotheses=20000,
                                  max_pairs=300, max_curve_fits=40, max_refinements=3)
    best = result['best']
    assert best is not None
    assert best['flight_assignment'] == ['north','east']
    assert np.hypot(best['observer']['latitude'],best['observer']['longitude'])*111320 < 75
    assert best['recording_start_utc'] == pytest.approx(epoch+2.75, abs=.2)
    assert best['rmse_hz'] < .05
    assert result['shape_fits'][0]['speed_m_s'] == pytest.approx(90., abs=.1)
    assert result['work']['curve_fits_attempted'] <= 40
    assert result['work']['refinements_attempted'] <= 3
    assert (tmp_path/'out/day-search-progress.json').exists()
    assert result['coverage']['sound_speed_m_s'] == 343
    assert result['coverage']['receiver_elevations_m'] == [0.]
    assert 'confidence' not in best and 'verified' not in best


def test_wrong_day_and_missing_track_have_no_verified_result(tmp_path):
    events, tracks, epoch, path = archive_fixture(tmp_path)
    empty = search_unknown_clock(events, path, date_utc='2026-09-09', elevations_m=(0.,), max_refinements=0)
    assert empty['best'] is None
    assert empty['work']['hypotheses_retained'] == [0,0]
    # An explicitly bound missing aircraft cannot be silently rebound to a survivor.
    events[0]['flight_id'] = 'absent'
    missing = search_unknown_clock(events, path, elevations_m=(0.,), max_refinements=0)
    assert missing['best'] is None
    assert any('not proof' in warning for warning in missing['warnings'])


def test_limits_and_uniform_reservoir_are_disclosed(tmp_path):
    events, tracks, epoch, path = archive_fixture(tmp_path)
    result = search_unknown_clock(events, path, max_hypotheses=100, elevations_m=(0.,),
                                  max_pairs=20, max_curve_fits=2, max_refinements=0)
    assert sum(result['work']['hypotheses_retained']) <= 100
    assert result['coverage']['reservoir_sampling_applied']
    assert result['work']['tracks_read'] == 2
    with pytest.raises(ValueError, match='exactly two'):
        search_unknown_clock(events[:1], path)
    with pytest.raises(ValueError, match='max_hypotheses'):
        search_unknown_clock(events, path, max_hypotheses=50)
