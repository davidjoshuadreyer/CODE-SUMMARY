"""Independent analytic synthetic truths, not real-world accuracy validation."""
import numpy as np
import pytest
from scipy.optimize import brentq
from doppler_lab.workflow_solver import solve_workflow


def synthetic_truth():
    a, e2, epoch = 6378137., 6.69437999014e-3, 1700000000.
    emission = np.arange(-60., 281., 2.)
    tracks, events = [], []
    definitions = [('east', 50., 110., 1700., 900., 155., 20., 100.),
                   ('north', 150., 90., 2200., -1200., 205., 120., 200.)]
    for name, centre, speed, height, lateral, tone, begin, end in definitions:
        if name == 'east':
            xyz = np.column_stack((np.full(len(emission), a+height), speed*(emission-centre), np.full(len(emission), lateral)))
        else:
            xyz = np.column_stack((np.full(len(emission), a+height), np.full(len(emission), lateral), speed*(emission-centre)))
        p = np.hypot(xyz[:, 0], xyz[:, 1]); lat = np.arctan2(xyz[:, 2], p*(1-e2))
        for _ in range(12):
            n = a/np.sqrt(1-e2*np.sin(lat)**2)
            altitude = p/np.cos(lat)-n
            lat = np.arctan2(xyz[:, 2], p*(1-e2*n/(n+altitude)))
        tracks.append({'flight_id': name, 'times_utc': epoch+emission,
                       'latitudes': np.rad2deg(lat), 'longitudes': np.rad2deg(np.arctan2(xyz[:, 1], xyz[:, 0])),
                       'altitudes_m': altitude, 'altitude_datum': 'geometric', 'warnings': ['SYNTHETIC analytic test trajectory']})
        times = np.arange(begin, end+.01, 1.)
        frequencies = []
        for recording_time in times:
            arrival = recording_time+2.75
            def distance(t):
                return np.sqrt(height**2+lateral**2+(speed*(t-centre))**2)
            te = brentq(lambda t: t+distance(t)/343.-arrival, -60., 280.)
            radial = speed**2*(te-centre)/distance(te)
            frequencies.append(tone*343./(343.+radial)+.01*np.sin(recording_time*.71))
        events.append({'flight_id': 'auto', 'times_s': times, 'frequencies_hz': np.array(frequencies)})
    return events[::-1], tracks, epoch


def grid():
    return [{'latitude': lat, 'longitude': lon, 'elevation_m': 0.}
            for lat in [-.012, .004, .020] for lon in [-.012, .004, .020]]


def test_joint_refinement_recovers_off_grid_independent_truth_and_order():
    events, tracks, epoch = synthetic_truth()
    original_times = [e['times_s'].copy() for e in events]
    result = solve_workflow(events, tracks, grid(), epoch,
                            time_offsets_s=[-2., 2., 6.], time_offset_bounds_s=(-5., 8.),
                            max_refinements=3, max_nfev=65)
    best = result['best']
    assert np.hypot(best['latitude'], best['longitude'])*111_320 < 30
    assert best['time_offset_s'] == pytest.approx(2.75, abs=.08)
    assert best['score'] < .04
    assert best['flight_assignment'] == ['north', 'east']
    assert [p['f0_hz'] for p in best['per_event']] == pytest.approx([205., 155.], abs=.1)
    assert result['comparison']['rmse_improvement_hz'] > .1
    assert result['work']['residual_evaluations'] <= 4000
    for original, event, fitted in zip(original_times, events, best['per_event']):
        np.testing.assert_array_equal(event['times_s'], original)
        np.testing.assert_array_equal(fitted['times_s'], original)
    assert 'confidence' not in best
    assert all('per_event' not in row for row in result['refinements'])


def test_fixed_assignment_does_not_switch_during_refinement():
    events, tracks, epoch = synthetic_truth()
    events = [{**event, 'flight_id': fid} for event, fid in zip(events, ['east', 'north'])]
    result = solve_workflow(events, tracks, grid(), epoch, time_offsets_s=[0., 5.], max_refinements=1, max_nfev=5)
    assert result['best']['flight_assignment'] == ['east', 'north']
    assert [e['flight_id'] for e in result['best']['per_event']] == ['east', 'north']
    assert result['best']['score'] > 1


def test_budget_and_bounds_are_explicit_and_best_seed_is_retained():
    events, tracks, epoch = synthetic_truth()
    result = solve_workflow(events, tracks, grid(), epoch, time_offsets_s=[0., 5.], max_refinements=3, max_evaluations=1)
    assert result['work']['residual_evaluations'] == 1
    assert result['best'] is not None
    assert result['best']['optimizer_status'] == 'budget_exhausted'
    assert result['best']['score'] <= result['comparison']['coarse_best_rmse_hz']+1e-10
    with pytest.raises(ValueError, match='Every coarse'):
        solve_workflow(events, tracks, grid(), epoch, bounds={'lat_min': 0, 'lat_max': .001, 'lon_min': 0, 'lon_max': .001})
    with pytest.raises(ValueError, match='comparisons'):
        solve_workflow(events, tracks, grid()*3000, epoch)
    with pytest.raises(ValueError, match='max_refinements'):
        solve_workflow(events, tracks, grid(), epoch, max_refinements=1000)


def test_no_coverage_and_fixed_parameter_cases():
    events, tracks, epoch = synthetic_truth()
    candidate = [{'latitude': 0., 'longitude': 0., 'elevation_m': 0.}]
    absent = solve_workflow(events, tracks, candidate, epoch+10000)
    assert absent['best'] is None and not absent['refinements']
    fixed = solve_workflow(events, tracks, candidate, epoch+2.75)
    assert fixed['best']['optimizer_status'] == 'fixed_parameters'
    assert fixed['best']['score'] < .04
    assert fixed['work']['residual_evaluations'] == 0
