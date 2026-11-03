"""Bounded grid-to-continuous Doppler fitting; fit ranks are not location confidence.

The per-event emitted frequencies are profiled analytically at every least-squares
step. Aircraft assignments remain fixed within each local optimization. This is a
local search from coarse hypotheses, not an exhaustive global or identity proof.
"""
from __future__ import annotations

import numpy as np
from scipy.optimize import least_squares

from .physics import score_candidate, search_candidates

MAX_GRID_COMPARISONS = 100_000
MAX_OBSERVATIONS = 20_000
MAX_REFINEMENTS = 20
MAX_EVALUATIONS = 20_000


class _BudgetExhausted(Exception):
    pass


def _int_limit(value, name, maximum):
    try:
        valid = not isinstance(value, bool) and np.isfinite(value) and int(value) == value and 1 <= value <= maximum
    except (TypeError, ValueError, OverflowError):
        valid = False
    if not valid:
        raise ValueError(f'{name} must be an integer from 1 to {maximum}')
    return int(value)


def _compact(seed):
    return {key: value for key, value in seed.items() if key != 'per_event'}


def solve_workflow(events, tracks, candidates, recording_start_utc, *,
                   time_offsets_s=None, bounds=None, time_offset_bounds_s=None,
                   sound_speed_m_s=343.0, max_gap_s=30.0,
                   max_refinements=8, max_nfev=80, max_evaluations=4000):
    """Search a bounded grid and refine location plus one shared recording clock.

    ``bounds`` is {lat_min,lat_max,lon_min,lon_max}; omitted bounds use the
    supplied grid extrema. ``time_offset_bounds_s`` is (lower,upper), relative
    to recording_start_utc, and defaults to coarse offset extrema. Equal bounds
    keep a parameter fixed. Candidate elevation is fixed during each refinement.

    Returns best (with per_event arrays), compact grid_candidates/refinements,
    comparison, work and warnings. No valid coverage returns best=None.
    Event list order and original-recording timestamps are never changed.
    Up to max_refinements distinct coarse seeds are explored; this is not an
    exhaustive search over all possible flight-assignment combinations.
    """
    max_refinements = _int_limit(max_refinements, 'max_refinements', MAX_REFINEMENTS)
    max_nfev = _int_limit(max_nfev, 'max_nfev', 500)
    max_evaluations = _int_limit(max_evaluations, 'max_evaluations', MAX_EVALUATIONS)
    if not events or not tracks or not candidates:
        raise ValueError('Provide nonempty events, tracks and candidate grid')
    if not np.isfinite(recording_start_utc):
        raise ValueError('recording_start_utc must be finite Unix seconds')
    observations = sum(len(event.get('times_s', [])) for event in events)
    if observations > MAX_OBSERVATIONS:
        raise ValueError(f'Limit to {MAX_OBSERVATIONS} observed frequency points')
    offsets = np.asarray([0.] if time_offsets_s is None else time_offsets_s, float)
    if offsets.ndim != 1 or not len(offsets) or not np.all(np.isfinite(offsets)):
        raise ValueError('Time offsets must be a nonempty finite vector')
    choices = sum(len(tracks) if e.get('flight_id') in (None, '', 'auto') else 1 for e in events)
    grid_work = len(candidates)*len(offsets)*choices
    if grid_work > MAX_GRID_COMPARISONS:
        raise ValueError(f'Grid exceeds {MAX_GRID_COMPARISONS} event/track comparisons; narrow bounds or bind flights')
    if bounds is None:
        bounds = {'lat_min': min(c['latitude'] for c in candidates),
                  'lat_max': max(c['latitude'] for c in candidates),
                  'lon_min': min(c['longitude'] for c in candidates),
                  'lon_max': max(c['longitude'] for c in candidates)}
    low = np.asarray([bounds['lat_min'], bounds['lon_min']], float)
    high = np.asarray([bounds['lat_max'], bounds['lon_max']], float)
    if not np.all(np.isfinite([low, high])) or np.any(low > high) or max(abs(low[0]), abs(high[0])) > 89 or max(abs(low[1]), abs(high[1])) > 180:
        raise ValueError('Use finite ordered WGS84 bounds within ±89 latitude and ±180 longitude; no antimeridian crossing')
    if any(not (low[0] <= c['latitude'] <= high[0] and low[1] <= c['longitude'] <= high[1]) for c in candidates):
        raise ValueError('Every coarse candidate must lie inside refinement bounds')
    clock_bounds = np.asarray([offsets.min(), offsets.max()] if time_offset_bounds_s is None else time_offset_bounds_s, float)
    if clock_bounds.shape != (2,) or not np.all(np.isfinite(clock_bounds)) or clock_bounds[0] > clock_bounds[1] or offsets.min() < clock_bounds[0] or offsets.max() > clock_bounds[1]:
        raise ValueError('Clock bounds must be finite, ordered, and contain all coarse offsets')
    warnings = ['Fit errors and ranking differences are not calibrated confidence probabilities or a geographic accuracy radius.',
                'Local refinement explores a bounded set of coarse hypotheses; it can miss other locations or aircraft assignments.',
                'Wind, emitted-pitch variation, vertical datum errors and flight-track errors are not included in the residual model.']
    if len(events) < 2:
        warnings.append('A single flyover is often geometrically ambiguous; multiple independent flight paths are preferable.')
    grid = search_candidates(events, tracks, candidates, recording_start_utc, offsets,
                             sound_speed_m_s, max_gap_s)
    work = {'grid_event_track_comparisons': grid_work, 'residual_evaluations': 0,
            'evaluation_limit': max_evaluations, 'refinements_attempted': 0}
    if not grid:
        return {'best': None, 'grid_candidates': [], 'refinements': [], 'comparison': {},
                'work': work, 'warnings': warnings + ['No coarse candidate has complete arrival-time track coverage.']}
    # Prioritize a representative for each ordered assignment, then fill with
    # other spatial/clock starts. Assignments never switch during a local fit.
    seeds, seen = [], set()
    for seed in grid:
        assignment = tuple(e['flight_id'] for e in seed['event_fits'])
        if assignment not in seen:
            seeds.append(seed); seen.add(assignment)
            if len(seeds) == max_refinements:
                break
    for seed in grid:
        if len(seeds) >= max_refinements:
            break
        if not any(seed is existing for existing in seeds):
            seeds.append(seed)
    center = (low+high)/2
    scales = np.asarray([111_132., 111_320.*np.cos(np.deg2rad(center[0])), 1.])
    lower = np.r_[(low-center)*scales[:2], clock_bounds[0]]
    upper = np.r_[(high-center)*scales[:2], clock_bounds[1]]
    free = upper > lower
    refined = []
    details = []
    for seed in seeds:
        if work['residual_evaluations'] >= max_evaluations:
            warnings.append('Refinement evaluation budget reached; remaining starts were not explored.')
            break
        work['refinements_attempted'] += 1
        assignment = [e['flight_id'] for e in seed['event_fits']]
        bound_events = [{**event, 'flight_id': fid} for event, fid in zip(events, assignment)]
        elevation = float(seed['observer'].get('elevation_m', 0.))
        initial = np.r_[(np.asarray([seed['latitude'], seed['longitude']])-center)*scales[:2], seed['time_offset_s']]
        best_detail = score_candidate(bound_events, tracks, seed['observer'], seed['recording_start_utc'], sound_speed_m_s, max_gap_s)
        best_x = initial.copy()
        valid_evaluations, invalid_evaluations = 0, 0

        def unpack(x):
            full = initial.copy(); full[free] = x
            observer = {'latitude': float(center[0]+full[0]/scales[0]),
                        'longitude': float(center[1]+full[1]/scales[1]), 'elevation_m': elevation}
            return full, observer

        def residual(x):
            nonlocal best_detail, best_x, valid_evaluations, invalid_evaluations
            if work['residual_evaluations'] >= max_evaluations:
                raise _BudgetExhausted
            work['residual_evaluations'] += 1
            full, observer = unpack(x)
            result = score_candidate(bound_events, tracks, observer, recording_start_utc+full[2], sound_speed_m_s, max_gap_s)
            if not result['valid']:
                invalid_evaluations += 1
                return np.full(observations, 1e6)
            valid_evaluations += 1
            if result['score'] < best_detail['score']:
                best_detail, best_x = result, full.copy()
            return np.concatenate([event['residuals_hz'] for event in result['per_event']])

        # Absolute UTC ~1e9 makes tiny default finite differences ineffective for
        # clock offsets. Differences of 0.02 s and 0.5 m are explicit and bounded.
        def jacobian(x):
            columns = []
            for axis, step in enumerate(np.asarray([.5, .5, .02])[free]):
                plus, minus = x.copy(), x.copy()
                plus[axis] = min(upper[free][axis], x[axis]+step)
                minus[axis] = max(lower[free][axis], x[axis]-step)
                columns.append((residual(plus)-residual(minus))/(plus[axis]-minus[axis]))
            return np.column_stack(columns)

        status, message, converged = 'fixed_parameters', 'All refinement parameters fixed by bounds.', True
        if np.any(free):
            try:
                fit = least_squares(residual, initial[free], jac=jacobian,
                                    bounds=(lower[free], upper[free]), max_nfev=max_nfev,
                                    x_scale=np.asarray([1000., 1000., 10.])[free],
                                    ftol=1e-9, xtol=1e-9, gtol=1e-8)
                status, message, converged = str(fit.status), fit.message, bool(fit.success)
            except _BudgetExhausted:
                status, message, converged = 'budget_exhausted', 'Residual evaluation budget reached; best evaluated point retained.', False
                warnings.append(message)
        observer = {'latitude': float(center[0]+best_x[0]/scales[0]),
                    'longitude': float(center[1]+best_x[1]/scales[1]), 'elevation_m': elevation}
        full = {**best_detail, **observer, 'observer': observer,
                'recording_start_utc': float(recording_start_utc+best_x[2]),
                'time_offset_s': float(best_x[2]), 'flight_assignment': assignment,
                'seed_rmse_hz': float(seed['score']), 'optimizer_converged': converged,
                'optimizer_status': status, 'optimizer_message': str(message),
                'valid_evaluations': valid_evaluations, 'invalid_evaluations': invalid_evaluations,
                'at_bounds': [name for i, name in enumerate(['latitude', 'longitude', 'clock_offset'])
                              if free[i] and min(best_x[i]-lower[i], upper[i]-best_x[i]) < (1 if i < 2 else .05)]}
        full['event_fits'] = [{key: event[key] for key in ('flight_id', 'f0_hz', 'rmse_hz')} for event in full['per_event']]
        details.append(full); refined.append(_compact(full))
    details.sort(key=lambda result: result['score']); refined.sort(key=lambda result: result['score'])
    best = details[0]
    alternative_assignments = [row for row in refined if row['flight_assignment'] != best['flight_assignment']]
    comparison = {'coarse_best_rmse_hz': float(grid[0]['score']),
                  'refined_best_rmse_hz': float(best['score']),
                  'rmse_improvement_hz': float(grid[0]['score']-best['score']),
                  'alternative_assignment_rmse_hz': alternative_assignments[0]['score'] if alternative_assignments else None,
                  'interpretation': 'Residual differences compare evaluated hypotheses only; no posterior probability or uncertainty radius is estimated.'}
    if best['at_bounds']:
        warnings.append('Best fit touches refinement bounds; a broader search may reveal another solution.')
    warnings.extend(best['warnings'])
    return {'best': best, 'grid_candidates': grid[:100], 'refinements': refined,
            'comparison': comparison, 'work': work, 'warnings': list(dict.fromkeys(warnings))}
