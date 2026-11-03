import numpy as np
import pytest
from doppler_lab.physics import geodetic_to_ecef, predict_received_curve, score_candidate, search_candidates
from doppler_lab.demo import make_demo


def straight_ecef_track():
    # Independent analytic geometry: observer at (a,0,0), plane (a+1000,100t,0).
    t = np.arange(-30., 31., 2.)
    x, y = 6378137.+1000., 100.*t
    return {'flight_id': 'analytic', 'times_utc': 1000.+t,
            'latitudes': np.zeros_like(t), 'longitudes': np.rad2deg(np.arctan2(y, x)),
            'altitudes_m': np.sqrt(x*x+y*y)-6378137., 'altitude_datum': 'geometric'}


def test_wgs84_known_axes():
    np.testing.assert_allclose(geodetic_to_ecef(0, 0, 0), [6378137, 0, 0], atol=1e-7)
    np.testing.assert_allclose(geodetic_to_ecef(90, 0, 0), [0, 0, 6356752.314245], atol=1e-5)


def test_independent_straight_flyby_and_sound_delay():
    curve = predict_received_curve(straight_ecef_track(), {'latitude': 0, 'longitude': 0})
    t = curve['emission_times_utc']-1000.
    r = np.sqrt(1000.**2 + (100.*t)**2)
    expected = 343./(343.+10000.*t/r)
    np.testing.assert_allclose(curve['ranges_m'], r, atol=2e-8)
    np.testing.assert_allclose(curve['times_utc'], 1000.+t+r/343., atol=1e-9)
    np.testing.assert_allclose(curve['frequency_ratio'], expected, atol=1e-10)
    assert expected[0] > 1 and expected[-1] < 1
    closest = np.argmin(abs(t))
    assert curve['times_utc'][closest] == pytest.approx(1000.+1000./343.)


def test_fits_emitted_frequency_and_rejects_extrapolation():
    track = straight_ecef_track()
    obs = {'latitude': 0., 'longitude': 0.}
    curve = predict_received_curve(track, obs)
    event = {'flight_id': 'analytic', 'times_s': curve['times_utc']-900., 'frequencies_hz': 170.*curve['frequency_ratio']}
    result = score_candidate([event], [track], obs, 900.)
    assert result['valid'] and result['rmse_hz'] < 1e-9
    assert result['per_event'][0]['f0_hz'] == pytest.approx(170.)
    assert not score_candidate([event], [track], obs, 950.)['valid']


def test_no_missing_gap_bridging():
    track = straight_ecef_track()
    keep = [0, 1, -2, -1]
    for key in ('times_utc', 'latitudes', 'longitudes', 'altitudes_m'):
        track[key] = track[key][keep]
    curve = predict_received_curve(track, {'latitude': 0, 'longitude': 0}, max_gap_s=5.)
    assert len(np.unique(curve['segment_ids'])) == 2
    event = {'flight_id': 'analytic', 'times_s': [98., 100., 102.], 'frequencies_hz': [150., 150., 150.]}
    assert not score_candidate([event], [track], {'latitude': 0, 'longitude': 0}, 900., max_gap_s=5.)['valid']


def test_synthetic_two_flight_location_and_shared_offset_recovery():
    demo = make_demo()
    results = search_candidates(demo['events'], demo['tracks'], demo['candidates'], demo['recording_start_utc']-3., time_offsets_s=[0., 3., 6.])
    assert results[0]['observer'] == demo['observer']
    assert results[0]['recording_start_utc'] == demo['recording_start_utc']
    assert results[0]['score'] < 1e-9
    assert results[1]['score'] > .01


def test_auto_assignment_and_limits():
    demo = make_demo()
    events = [{**event, 'flight_id': 'auto'} for event in demo['events']]
    result = score_candidate(events, demo['tracks'], demo['observer'], demo['recording_start_utc'])
    assert [e['flight_id'] for e in result['per_event']] == ['SYNTHETIC-A', 'SYNTHETIC-B']
    assert result['rmse_hz'] < 1e-9
    with pytest.raises(ValueError, match='limited'):
        search_candidates(events, demo['tracks'], [demo['observer']]*20001, demo['recording_start_utc'])


def test_invalid_inputs():
    track = straight_ecef_track()
    with pytest.raises(ValueError):
        predict_received_curve(track, {'latitude': 91, 'longitude': 0})
    with pytest.raises(ValueError):
        predict_received_curve(track, {'latitude': 0, 'longitude': 0}, sound_speed_m_s=0)
    track['times_utc'][1] = track['times_utc'][0]
    with pytest.raises(ValueError, match='strictly'):
        predict_received_curve(track, {'latitude': 0, 'longitude': 0})


def test_search_summaries_are_compact_and_preserve_best_rank():
    import json
    demo = make_demo()
    summaries = search_candidates(demo['events'], demo['tracks'], demo['candidates'], demo['recording_start_utc'])
    assert summaries[0]['observer'] == demo['observer']
    assert all('per_event' not in result for result in summaries)
    assert summaries[0]['event_fits'][0]['flight_id'] == 'SYNTHETIC-A'
    detailed = score_candidate(demo['events'], demo['tracks'], summaries[0]['observer'], summaries[0]['recording_start_utc'])
    assert summaries[0]['score'] == detailed['score']
    # No ndarray encoder is needed: ranking exports contain no curve arrays.
    json.dumps(summaries, allow_nan=False)


def test_bad_track_failure_identifies_track_in_auto_mode():
    demo = make_demo()
    bad = {**demo['tracks'][0], 'flight_id': 'BAD-TRACK'}
    bad['times_utc'] = bad['times_utc'].copy()
    bad['times_utc'][1] = bad['times_utc'][0]
    events = [{**demo['events'][0], 'flight_id': 'auto'}]
    with pytest.raises(ValueError, match='BAD-TRACK.*Remove or correct'):
        score_candidate(events, [demo['tracks'][0], bad], demo['observer'], demo['recording_start_utc'])
