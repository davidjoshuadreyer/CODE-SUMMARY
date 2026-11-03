"""Independent physical and negative-control checks for date-wide proposals."""
import json
import numpy as np
import pytest
from doppler_lab.day_search import fit_event_shape, search_unknown_clock
from doppler_lab.demo import make_demo


@pytest.mark.parametrize('harmonic', [1, 2])
def test_shape_recovers_emission_geometry_not_arrival_heuristic(harmonic):
    # Generate from emission time, then map to arrivals, independently of the
    # inverse quadratic used by the estimator. Harmonics cannot change geometry.
    speed, slant, c, tc = 140., 6500., 343., 2100.
    emission = np.linspace(tc-120, tc+120, 321)
    along = speed*(emission-tc)
    distance = np.hypot(slant, along)
    arrival = emission+distance/c
    frequency = harmonic*113./(1+speed*along/distance/c)
    fitted = fit_event_shape({'times_s': arrival, 'frequencies_hz': frequency})
    assert fitted['speed_m_s'] == pytest.approx(speed, abs=.05)
    assert fitted['closest_slant_range_m'] == pytest.approx(slant, abs=3)
    assert fitted['closest_emission_time_s'] == pytest.approx(tc, abs=.02)
    assert fitted['closest_arrival_time_s'] == pytest.approx(tc+slant/c, abs=.02)


def test_wrong_day_is_no_candidate_not_a_localization(tmp_path):
    demo = make_demo()
    path = tmp_path/'tracks.jsonl'
    def convert(value):
        return value.tolist() if isinstance(value, np.ndarray) else value
    path.write_text(''.join(json.dumps(t, default=convert)+'\n' for t in demo['tracks']))
    result = search_unknown_clock(demo['events'], path, date_utc='2023-11-15',
                                  max_hypotheses=1000, max_curve_fits=5,
                                  max_refinements=0)
    assert result['best'] is None
    assert result['work']['tracks_read'] == 2
    assert result['work']['hypotheses_generated'] == [0, 0]
    assert any('not proof' in warning for warning in result['warnings'])
