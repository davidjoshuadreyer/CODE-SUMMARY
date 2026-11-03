"""Bounded unknown-clock aircraft-pair proposals from a dated local track index.

No ground grid or network access. Straight-flight shape fits only propose
hypotheses; actual trajectories and sound-arrival delay score the shortlist.
All results are candidates, never verified locations or calibrated confidence.
"""
from __future__ import annotations
import datetime as dt
from collections import OrderedDict
import heapq
import json
from pathlib import Path
import time

import numpy as np
from scipy.optimize import least_squares
from scipy.spatial import cKDTree

from .physics import geodetic_to_ecef, score_candidate
from .workflow_solver import solve_workflow


def fit_event_shape(event, sound_speed_m_s=343.):
    """Independent robust fit of exact retarded, constant-velocity source model."""
    t, f = np.asarray(event['times_s'], float), np.asarray(event['frequencies_hz'], float)
    if t.ndim != 1 or t.shape != f.shape or len(t) < 12 or not np.all(np.isfinite(t)) or not np.all(np.isfinite(f)) or np.any(np.diff(t) <= 0) or np.any(f <= 0):
        raise ValueError('Shape fitting needs 12 finite ordered observations with positive frequencies')
    origin, duration = float(np.mean(t)), float(np.ptp(t))
    def predict(p):
        f0, beta, tau, closest = p
        w = (t-origin-closest)/tau
        u = (w-beta*np.sqrt(w*w+1-beta*beta))/(1-beta*beta)
        return f0/(1+beta*u/np.sqrt(1+u*u))
    fits = []
    for beta in (.15, .35, .60):
        fit = least_squares(lambda p: predict(p)-f,
                            [np.median(f), beta, max(2., duration/4), 0.],
                            bounds=([min(f)*.2, .02, 1., -duration*2],
                                    [max(f)*3, .85, duration*5, duration*2]),
                            loss='soft_l1', f_scale=.75, max_nfev=350)
        fits.append(fit)
    best = min(fits, key=lambda fit: fit.cost)
    f0, beta, tau, closest = best.x
    speed, slant = beta*sound_speed_m_s, beta*sound_speed_m_s*tau
    return {'source_frequency_hz': float(f0), 'beta': float(beta), 'tau_s': float(tau),
            'speed_m_s': float(speed), 'closest_slant_range_m': float(slant),
            'closest_emission_time_s': float(origin+closest),
            'closest_arrival_time_s': float(origin+closest+slant/sound_speed_m_s),
            'rmse_hz': float(np.sqrt(np.mean((predict(best.x)-f)**2))),
            'optimizer_converged': bool(best.success),
            'interpretation': 'Heuristic straight-flight shape, not a speed/distance measurement or confidence interval.'}


def _geo(xyz):
    xyz = np.asarray(xyz, float)
    p = np.hypot(xyz[..., 0], xyz[..., 1]); lat = np.arctan2(xyz[..., 2], p*(1-6.69437999014e-3))
    for _ in range(6):
        n = 6378137./np.sqrt(1-6.69437999014e-3*np.sin(lat)**2)
        h = p/np.cos(lat)-n
        lat = np.arctan2(xyz[..., 2], p*(1-6.69437999014e-3*n/(n+h)))
    return np.rad2deg(lat), np.rad2deg(np.arctan2(xyz[..., 1], xyz[..., 0]))


def _checkpoint(folder, phase, work):
    if folder is None:
        return
    folder = Path(folder); folder.mkdir(parents=True, exist_ok=True)
    target = folder/'day-search-progress.json'
    temp = target.with_suffix('.tmp')
    temp.write_text(json.dumps({'phase': phase, 'work': work}, indent=2)+'\n')
    temp.replace(target)


def _crop(track, events, clock):
    t = np.asarray(track['times_utc'], float)
    bound = [e for e in events if e['flight_id'] == track['flight_id']]
    first = clock+min(float(e['times_s'][0]) for e in bound)-150
    last = clock+max(float(e['times_s'][-1]) for e in bound)+60
    left, right = max(0, np.searchsorted(t, first)-1), min(len(t), np.searchsorted(t, last)+1)
    return {**track, **{key: np.asarray(track[key])[left:right] for key in
                       ('times_utc', 'latitudes', 'longitudes', 'altitudes_m')}}


def search_unknown_clock(events, tracks_path, *, date_utc='2026-09-08', output_dir=None,
                         sample_step_s=20., speed_relative_tolerance=.40,
                         slant_relative_tolerance=.30, receiver_tolerance_m=3500.,
                         clock_tolerance_s=30., max_hypotheses=1_000_000,
                         max_pairs=20_000, max_curve_fits=300, max_refinements=12,
                         sound_speed_m_s=343., max_gap_s=30.,
                         elevations_m=(0., 750., 2000.), max_neighbors=16,
                         max_index_bytes=8*1024**3, max_track_points=2_000_000):
    """Search two events against seekable normalized per-track JSONL.

    Output best follows workflow_solver's schema. Source ordering is preserved.
    Constraints, reservoir sampling, neighbor limits and failed coverage are
    disclosed in work/coverage; the smallest residual does not verify a location.
    Elevations are tested assumptions, not a terrain model. Expand tolerances to
    test sensitivity when variable source pitch, turns, wind or altitude datum
    uncertainty make the initial straight-flight shapes unreliable.
    """
    if len(events) != 2:
        raise ValueError('Unknown-clock pairing currently requires exactly two observed events')
    date = dt.date.fromisoformat(date_utc)
    day_start = dt.datetime.combine(date, dt.time(), dt.timezone.utc).timestamp()
    if date.isoformat() != date_utc:
        raise ValueError('date_utc must be YYYY-MM-DD')
    limits = [('max_hypotheses', max_hypotheses, 100, 2_000_000), ('max_pairs', max_pairs, 1, 100_000),
              ('max_curve_fits', max_curve_fits, 1, 3000), ('max_refinements', max_refinements, 0, 30),
              ('max_neighbors', max_neighbors, 1, 64)]
    for name, value, lo, hi in limits:
        if type(value) is not int or not lo <= value <= hi:
            raise ValueError(f'{name} must be an integer in {lo}..{hi}')
    for name, value, lo, hi in [('sample_step_s', sample_step_s, 2, 120),
                               ('speed_relative_tolerance', speed_relative_tolerance, .05, 1.5),
                               ('slant_relative_tolerance', slant_relative_tolerance, .05, 2),
                               ('receiver_tolerance_m', receiver_tolerance_m, 100, 20000),
                               ('clock_tolerance_s', clock_tolerance_s, 1, 300)]:
        if not np.isfinite(value) or not lo <= value <= hi:
            raise ValueError(f'{name} must be in {lo}..{hi}')
    if not elevations_m or len(elevations_m) > 8 or not np.all(np.isfinite(elevations_m)):
        raise ValueError('Provide 1–8 finite receiver elevation hypotheses')
    path = Path(tracks_path)
    if path.stat().st_size > max_index_bytes:
        raise ValueError('Track index exceeds byte budget')
    shapes = [fit_event_shape(event, sound_speed_m_s) for event in events]
    work = {'tracks_read': 0, 'track_points': 0, 'tracks_skipped_invalid': 0,
            'hypotheses_generated': [0, 0], 'hypotheses_retained': [0, 0],
            'pair_neighbors_considered': 0, 'pair_proposals_retained': 0,
            'curve_fits_attempted': 0, 'curve_fits_valid': 0, 'refinements_attempted': 0}
    warnings = ['Candidates are not verified locations, aircraft identifications, or confidence probabilities.',
                'A UTC-day archive is incomplete for a local-calendar day and for events crossing midnight; adjacent days may be necessary.',
                'Constant-pitch straight-flight shape constraints are proposal heuristics; turns, acceleration or pitch changes can exclude the true pair.',
                'Receiver elevations are discrete assumptions without a terrain model; pressure/geometric altitude uncertainty can bias hypotheses.',
                'No missing-sound or silence filter is used: an aircraft need not be audible merely because it is nearby.']
    start_time = time.monotonic()
    metadata = []
    reservoir = [None, None]
    pending = [[], []]
    pending_count = [0, 0]
    cutoffs = [1., 1.]
    rng = np.random.default_rng(20260908)
    cap = max_hypotheses//2
    def flush(event_index):
        if not pending[event_index]:
            return
        pieces = pending[event_index]
        if reservoir[event_index] is not None:
            pieces = [reservoir[event_index]] + pieces
        combined = np.concatenate(pieces)
        if len(combined) > cap:
            selected = np.argpartition(combined[:, -1], cap-1)[:cap]
            combined = combined[selected]
            cutoffs[event_index] = float(combined[:, -1].max())
        reservoir[event_index] = combined
        pending[event_index] = []
        pending_count[event_index] = 0
    def add(event_index, block):
        if not len(block):
            return
        work['hypotheses_generated'][event_index] += len(block)
        weights = rng.random(len(block))
        keep = weights < cutoffs[event_index]
        if not np.any(keep):
            return
        weighted = np.column_stack((block[keep], weights[keep]))
        pending[event_index].append(weighted)
        pending_count[event_index] += len(weighted)
        if pending_count[event_index] >= min(100_000, max(100, cap//4)):
            flush(event_index)
    with path.open('rb') as source:
        while True:
            offset = source.tell(); raw = source.readline(128*1024**2+1)
            if not raw:
                break
            if len(raw) > 128*1024**2:
                raise ValueError('One JSONL track exceeds 128MiB; split the index into smaller tracks')
            track = json.loads(raw)
            work['tracks_read'] += 1
            try:
                if not str(track.get('flight_id', '')).strip():
                    raise ValueError('Missing flight ID')
                t = np.asarray(track['times_utc'], float)
                if len(t) < 3 or len(t) > max_track_points or np.any(np.diff(t) <= 0) or not np.all(np.isfinite(t)):
                    raise ValueError('Invalid track times')
                xyz = geodetic_to_ecef(track['latitudes'], track['longitudes'], track['altitudes_m'])
                if xyz.shape != (len(t), 3):
                    raise ValueError('Invalid positions')
            except (ValueError, KeyError, TypeError):
                work['tracks_skipped_invalid'] += 1
                continue
            work['track_points'] += len(t)
            track_index = len(metadata)
            metadata.append({'offset': offset, 'flight_id': str(track['flight_id']), 'altitude_datum': track.get('altitude_datum', 'unknown')})
            delta = np.diff(t); valid = (delta <= max_gap_s)&(delta > 0)
            mid_t = (t[:-1]+t[1:])/2
            valid &= (mid_t >= day_start)&(mid_t < day_start+86400)
            indices = np.flatnonzero(valid)
            if not len(indices):
                continue
            # At most one segment per cadence bucket, retaining original gap checks.
            _, selected = np.unique(np.floor(mid_t[indices]/sample_step_s), return_index=True)
            indices = indices[selected]
            pos = (xyz[indices]+xyz[indices+1])/2
            velocity = (xyz[indices+1]-xyz[indices])/delta[indices, None]
            speed = np.linalg.norm(velocity, axis=1)
            lat, lon = _geo(pos); lr, gr = np.deg2rad(lat), np.deg2rad(lon)
            up = np.column_stack((np.cos(lr)*np.cos(gr), np.cos(lr)*np.sin(gr), np.sin(lr)))
            vertical = np.sum(velocity*up, axis=1)
            horizontal = velocity-vertical[:, None]*up
            hs = np.linalg.norm(horizontal, axis=1)
            heading = horizontal/np.maximum(hs[:, None], 1e-12)
            lateral = np.cross(up, heading)
            altitude = (np.asarray(track['altitudes_m'])[indices]+np.asarray(track['altitudes_m'])[indices+1])/2
            for event_index, shape in enumerate(shapes):
                wanted = events[event_index].get('flight_id')
                if wanted not in (None, '', 'auto', track['flight_id']):
                    continue
                tolerance = shape['speed_m_s']*speed_relative_tolerance+20.
                eligible = (np.abs(speed-shape['speed_m_s']) <= tolerance)&(hs > 15)&(speed < sound_speed_m_s)
                slant = shape['closest_slant_range_m']
                width = slant*slant_relative_tolerance+500.
                for elevation in elevations_m:
                    height = altitude-float(elevation)
                    along = height*vertical/np.maximum(hs, 1)
                    for radius in np.linspace(max(100., slant-width), slant+width, 3):
                        cross_sq = radius**2-height**2-along**2
                        clock = mid_t[indices]+radius/sound_speed_m_s-shape['closest_arrival_time_s']
                        mask = eligible&(height >= 100)&(cross_sq >= 0)&(clock >= day_start)&(clock < day_start+86400)
                        if not np.any(mask):
                            continue
                        for sign in (-1, 1):
                            guess = pos[mask]-height[mask, None]*up[mask]+along[mask, None]*heading[mask]+sign*np.sqrt(cross_sq[mask, None])*lateral[mask]
                            glat, glon = _geo(guess)
                            surface = geodetic_to_ecef(glat, glon, float(elevation))
                            penalty = ((speed[mask]-shape['speed_m_s'])/tolerance)**2+((radius-slant)/width)**2
                            # xyz,clock,index,latitude,longitude,elevation,shape_penalty
                            block = np.column_stack((surface, clock[mask], np.full(mask.sum(), track_index), glat, glon,
                                                     np.full(mask.sum(), elevation), penalty))
                            add(event_index, block)
            if work['tracks_read'] % 250 == 0:
                work['elapsed_s'] = round(time.monotonic()-start_time, 2)
                _checkpoint(output_dir, 'indexing_hypotheses', work)
    for event_index in (0, 1):
        flush(event_index)
    H = [np.empty((0, 9)) if value is None else value[:, :-1] for value in reservoir]
    work['hypotheses_retained'] = [len(h) for h in H]
    coverage = {'archive_date_utc': date_utc, 'index_path': str(path), 'index_bytes': path.stat().st_size,
                'sample_step_s': sample_step_s, 'sound_speed_m_s': sound_speed_m_s, 'receiver_elevations_m': list(map(float, elevations_m)),
                'altitude_datums': sorted({m['altitude_datum'] for m in metadata}),
                'speed_relative_tolerance': speed_relative_tolerance, 'speed_absolute_margin_m_s': 20.,
                'slant_relative_tolerance': slant_relative_tolerance, 'slant_absolute_margin_m': 500.,
                'receiver_tolerance_m': receiver_tolerance_m, 'clock_tolerance_s': clock_tolerance_s,
                'neighbor_limit_per_hypothesis': max_neighbors,
                'reservoir_sampling_applied': any(a > b for a, b in zip(work['hypotheses_generated'], work['hypotheses_retained'])),
                'completeness': 'Only supplied tracks, sampled segments, tested elevations and retained proposals were searched.'}
    if coverage['reservoir_sampling_applied']:
        warnings.append('Hypothesis budget required deterministic uniform reservoir sampling; some geometric proposals were not searched.')
    result = {'best': None, 'candidates': [], 'grid_candidates': [], 'refinements': [],
              'shape_fits': shapes, 'coverage': coverage, 'work': work, 'warnings': warnings}
    if not all(len(h) for h in H):
        warnings.append('No eligible geometric hypotheses for one or both events; absence is not proof the date or recording is wrong.')
        _checkpoint(output_dir, 'complete_no_hypotheses', work)
        return result
    scale = np.array([receiver_tolerance_m]*3+[clock_tolerance_s])
    # Treat tested elevation tiers separately, so wrong-tier nearest neighbors
    # cannot crowd out valid same-tier pairs before the neighbor cap.
    elevation_ids = {float(value): index for index, value in enumerate(elevations_m)}
    features = [np.column_stack((np.column_stack((h[:, :3], h[:, 3]-day_start))/scale,
                                 np.asarray([elevation_ids[float(v)] for v in h[:, 7]])*3.)) for h in H]
    tree = cKDTree(features[1])
    proposals = []
    counter = 0
    # Bounded k-neighbor pairing in joint receiver-space and shared-clock space.
    for begin in range(0, len(H[0]), 4096):
        distances, neighbors = tree.query(features[0][begin:begin+4096], k=max_neighbors, distance_upper_bound=np.sqrt(2), workers=1)
        if max_neighbors == 1:
            distances, neighbors = distances[:, None], neighbors[:, None]
        for local in range(len(distances)):
            a = H[0][begin+local]
            for distance, neighbor in zip(distances[local], neighbors[local]):
                if not np.isfinite(distance):
                    continue
                work['pair_neighbors_considered'] += 1
                b = H[1][neighbor]
                spatial = np.linalg.norm(a[:3]-b[:3]); clock_gap = abs(a[3]-b[3])
                if spatial > receiver_tolerance_m or clock_gap > clock_tolerance_s:
                    continue
                if abs(a[7]-b[7]) > 1:
                    continue
                priority = (spatial/receiver_tolerance_m)**2+(clock_gap/clock_tolerance_s)**2+.15*(a[8]+b[8])
                item = (-float(priority), counter, begin+local, int(neighbor)); counter += 1
                if len(proposals) < max_pairs:
                    heapq.heappush(proposals, item)
                elif item[0] > proposals[0][0]:
                    heapq.heapreplace(proposals, item)
        _checkpoint(output_dir, 'pairing_hypotheses', work)
    work['pair_proposals_retained'] = len(proposals)
    # Preserve distinct ordered aircraft assignments before filling spare slots.
    ordered = sorted(proposals, reverse=True)
    selected, remainder, seen_pairs = [], [], set()
    for proposal in ordered:
        _, _, ia, ib = proposal
        pair = (int(H[0][ia, 4]), int(H[1][ib, 4]))
        if pair not in seen_pairs and len(selected) < max_curve_fits:
            selected.append(proposal); seen_pairs.add(pair)
        else:
            remainder.append(proposal)
    selected.extend(remainder[:max(0, max_curve_fits-len(selected))])
    compact = []
    cache = OrderedDict()
    with path.open('rb') as source:
        def load(index):
            if index not in cache:
                source.seek(metadata[index]['offset']); cache[index] = json.loads(source.readline())
                if len(cache) > 16:
                    cache.popitem(last=False)
            cache.move_to_end(index)
            return cache[index]
        for proposal in selected:
            priority, _, ia, ib = proposal; a, b = H[0][ia], H[1][ib]
            ids = [int(a[4]), int(b[4])]
            tracks = [load(index) for index in dict.fromkeys(ids)]
            assignments = [metadata[index]['flight_id'] for index in ids]
            # Same aircraft can be assigned to both events; no forced distinctness.
            bound = [{**event, 'flight_id': fid} for event, fid in zip(events, assignments)]
            observer = {'latitude': float((a[5]+b[5])/2), 'longitude': float((a[6]+b[6])/2), 'elevation_m': float(a[7])}
            clock = float((a[3]+b[3])/2)
            cropped = [_crop(track, bound, clock) for track in tracks]
            work['curve_fits_attempted'] += 1
            try:
                score = score_candidate(bound, cropped, observer, clock, sound_speed_m_s, max_gap_s)
            except (ValueError, KeyError, TypeError):
                continue
            if not score['valid']:
                continue
            work['curve_fits_valid'] += 1
            summary = {**observer, 'observer': observer, 'recording_start_utc': clock,
                       'score': score['score'], 'rmse_hz': score['rmse_hz'],
                       'flight_assignment': assignments, 'track_indices': ids,
                       'proposal_penalty': -priority,
                       'event_fits': [{k: e[k] for k in ('flight_id', 'f0_hz', 'rmse_hz')} for e in score['per_event']]}
            compact.append(summary)
        compact.sort(key=lambda item: item['score'])
        details = []
        refinement_seeds, seen_assignments = [], set()
        for seed in compact:
            key = tuple(seed['flight_assignment'])
            if key not in seen_assignments and len(refinement_seeds) < max_refinements:
                refinement_seeds.append(seed); seen_assignments.add(key)
        seen_elevations = {(tuple(seed['flight_assignment']), seed['elevation_m']) for seed in refinement_seeds}
        for seed in compact:
            key = (tuple(seed['flight_assignment']), seed['elevation_m'])
            if key not in seen_elevations and len(refinement_seeds) < max_refinements:
                refinement_seeds.append(seed); seen_elevations.add(key)
        for seed in compact:
            if len(refinement_seeds) >= max_refinements:
                break
            if not any(seed is chosen for chosen in refinement_seeds):
                refinement_seeds.append(seed)
        for seed in refinement_seeds:
            ids = seed['track_indices']; clock = seed['recording_start_utc']; observer = seed['observer']
            bound = [{**event, 'flight_id': fid} for event, fid in zip(events, seed['flight_assignment'])]
            cropped = [_crop(load(index), bound, clock) for index in dict.fromkeys(ids)]
            lat_radius = receiver_tolerance_m/111132.
            lon_radius = receiver_tolerance_m/(111320.*max(.05, np.cos(np.deg2rad(observer['latitude']))))
            bounds = {'lat_min': max(-88., observer['latitude']-lat_radius), 'lat_max': min(88., observer['latitude']+lat_radius),
                      'lon_min': max(-180., observer['longitude']-lon_radius), 'lon_max': min(180., observer['longitude']+lon_radius)}
            work['refinements_attempted'] += 1
            try:
                solved = solve_workflow(bound, cropped, [observer], clock, bounds=bounds,
                                        time_offsets_s=[0.], time_offset_bounds_s=(-clock_tolerance_s, clock_tolerance_s),
                                        sound_speed_m_s=sound_speed_m_s, max_gap_s=max_gap_s,
                                        max_refinements=1, max_nfev=65, max_evaluations=600)
            except (ValueError, KeyError, TypeError):
                continue
            if solved['best']:
                details.append(solved['best'])
            work['elapsed_s'] = round(time.monotonic()-start_time, 2)
            _checkpoint(output_dir, 'refining_candidates', work)
        # Always keep the best coarse candidate as fallback, including max_refinements=0.
        if compact:
            seed = compact[0]; bound = [{**event, 'flight_id': fid} for event, fid in zip(events, seed['flight_assignment'])]
            cropped = [_crop(load(index), bound, seed['recording_start_utc']) for index in dict.fromkeys(seed['track_indices'])]
            score = score_candidate(bound, cropped, seed['observer'], seed['recording_start_utc'], sound_speed_m_s, max_gap_s)
            details.append({**seed, **score, 'optimizer_converged': False, 'optimizer_status': 'coarse_candidate'})
        details.sort(key=lambda item: item['score'])
        result['best'] = details[0] if details else None
        result['candidates'] = compact[:100]
        result['grid_candidates'] = compact[:100]
        result['refinements'] = [{key: value for key, value in detail.items() if key != 'per_event'} for detail in details[:30]]
    work['elapsed_s'] = round(time.monotonic()-start_time, 2)
    if result['best']:
        warnings.extend(result['best'].get('warnings', []))
    else:
        warnings.append('No fully covered curve fit survived the bounded proposal search; this is not a global exclusion.')
    result['warnings'] = list(dict.fromkeys(warnings))
    _checkpoint(output_dir, 'complete', work)
    return result
