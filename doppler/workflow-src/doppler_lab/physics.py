"""Constant-speed-of-sound, stationary-observer Doppler model (not weather corrected)."""
import numpy as np

WGS84_A = 6378137.0
WGS84_E2 = 6.69437999014e-3
MAX_SEARCH_PAIRS = 20000


def geodetic_to_ecef(latitude, longitude, altitude_m):
    lat, lon, h = np.broadcast_arrays(np.asarray(latitude, float), np.asarray(longitude, float), np.asarray(altitude_m, float))
    if not all(np.all(np.isfinite(x)) for x in (lat, lon, h)) or np.any(np.abs(lat) > 90) or np.any(np.abs(lon) > 180):
        raise ValueError('Invalid WGS84 coordinates')
    lat, lon = np.deg2rad(lat), np.deg2rad(lon)
    n = WGS84_A / np.sqrt(1 - WGS84_E2 * np.sin(lat)**2)
    return np.stack(((n+h)*np.cos(lat)*np.cos(lon), (n+h)*np.cos(lat)*np.sin(lon), (n*(1-WGS84_E2)+h)*np.sin(lat)), axis=-1)


def _sound_speed(value):
    if not np.isfinite(value) or not 250 <= value <= 400:
        raise ValueError('Sound speed must be between 250 and 400 m/s')


def predict_received_curve(track, observer, emission_step_s=0.5, sound_speed_m_s=343.0, max_gap_s=30.0):
    """Predict f_received/f_emitted = 1/(1 + range_rate/c).

    Aircraft heights and observer elevation must use a compatible geometric datum.
    Missing intervals are omitted and exposed through segment_ids. Heights labelled
    barometric/unknown are accepted for exploration but explicitly warned about.
    """
    _sound_speed(sound_speed_m_s)
    if not np.isfinite(emission_step_s) or emission_step_s < .02 or not np.isfinite(max_gap_s) or max_gap_s <= 0:
        raise ValueError('Invalid emission sampling step or maximum track gap')
    t = np.asarray(track['times_utc'], float)
    xyz = geodetic_to_ecef(track['latitudes'], track['longitudes'], track['altitudes_m'])
    if t.ndim != 1 or len(t) < 2 or xyz.shape != (len(t), 3) or not np.all(np.isfinite(t)) or np.any(np.diff(t) <= 0):
        raise ValueError('Track needs at least two finite, strictly increasing timestamps and matching positions')
    origin = geodetic_to_ecef(observer['latitude'], observer['longitude'], observer.get('elevation_m', 0.0))
    if origin.shape != (3,):
        raise ValueError('Observer must be a single point')
    warnings = list(track.get('warnings', []))
    if track.get('altitude_datum', 'unknown') not in ('geometric', 'ellipsoid', 'ellipsoidal', 'WGS84'):
        warnings.append('Aircraft height datum is not verified geometric; height mismatch can bias results.')
    warnings.append('ECEF assumes supplied elevations are WGS84 ellipsoid heights; geometric labels alone do not verify a compatible vertical datum.')
    warnings.append('Assumes constant emitted tone, stationary observer, still air and constant sound speed; no terrain or weather correction.')
    dt = np.diff(t)
    if np.any(dt > max_gap_s):
        warnings.append('Large track gaps omitted; predictions do not bridge missing coverage.')
    estimate = sum(int(np.ceil(d/emission_step_s)) + 1 for d in dt if d <= max_gap_s)
    if estimate > 200000:
        raise ValueError('Track sampling exceeds 200000 points; crop track or increase step')
    chunks = []
    group = 0
    for i, d in enumerate(dt):
        if d > max_gap_s:
            group += 1
            continue
        velocity = (xyz[i+1] - xyz[i]) / d
        # A supersonic source can have multiple emission times for one arrival.
        if np.linalg.norm(velocity) >= sound_speed_m_s:
            raise ValueError('Supersonic/invalid track speed unsupported by this single-arrival model')
        n = max(1, int(np.ceil(d/emission_step_s)))
        fractions = np.arange(n, dtype=float) / n
        # Include run endpoints without duplicating internal timestamps.
        if i == len(dt)-1 or dt[i+1] > max_gap_s:
            fractions = np.append(fractions, 1.)
        emit = t[i] + fractions*d
        displacement = xyz[i] + fractions[:, None]*(xyz[i+1]-xyz[i]) - origin
        ranges = np.linalg.norm(displacement, axis=1)
        if np.any(ranges < 1):
            raise ValueError('Observer lies on trajectory; point-source model undefined')
        radial_velocity = displacement @ velocity / ranges
        ratio = 1 / (1 + radial_velocity/sound_speed_m_s)
        arrival = emit + ranges/sound_speed_m_s
        chunks.append((arrival, ratio, emit, ranges, np.full(len(emit), group, dtype=int)))
    if not chunks:
        raise ValueError('No usable track intervals within maximum gap')
    out = dict(zip(('times_utc', 'frequency_ratio', 'emission_times_utc', 'ranges_m', 'segment_ids'), (np.concatenate([c[j] for c in chunks]) for j in range(5))))
    if np.any(np.diff(out['times_utc']) <= 0):
        raise ValueError('Nonmonotone arrival times; track is incompatible with model')
    out['warnings'] = list(dict.fromkeys(warnings))
    return out


def _at_arrivals(curve, times):
    result = np.full(times.shape, np.nan)
    for group in np.unique(curve['segment_ids']):
        mask = curve['segment_ids'] == group
        t, r = curve['times_utc'][mask], curve['frequency_ratio'][mask]
        inside = (times >= t[0]) & (times <= t[-1])
        result[inside] = np.interp(times[inside], t, r)
    return result


def _score_fixed(events, tracks, observer, recording_start_utc, sound_speed_m_s=343.0, max_gap_s=30.0, _curves=None):
    """Fit one constant emitted frequency per event, retaining a shared UTC origin.

    Every supplied observation must have actual track coverage. RMSE is in Hz,
    weighted equally per observation and is a fit error, never a confidence.
    """
    _sound_speed(sound_speed_m_s)
    if not np.isfinite(recording_start_utc) or not events:
        raise ValueError('Provide events and a finite recording UTC start')
    by_id = {str(t['flight_id']): t for t in tracks}
    per_event, warnings, curves = [], [], {} if _curves is None else _curves
    squared_error, count = 0., 0
    for event in events:
        fid = str(event['flight_id'])
        times = np.asarray(event['times_s'], float)
        frequencies = np.asarray(event['frequencies_hz'], float)
        if times.ndim != 1 or frequencies.shape != times.shape or len(times) < 3 or not np.all(np.isfinite(times)) or not np.all(np.isfinite(frequencies)) or np.any(np.diff(times) <= 0) or np.any(times < 0) or np.any(frequencies <= 0):
            raise ValueError('Events require at least three increasing nonnegative times and positive finite frequencies')
        if fid not in by_id:
            raise ValueError(f'Unknown flight_id: {fid}')
        if fid not in curves:
            try:
                curves[fid] = predict_received_curve(by_id[fid], observer, sound_speed_m_s=sound_speed_m_s, max_gap_s=max_gap_s)
            except (ValueError, KeyError, TypeError) as error:
                raise ValueError(f'Track {fid!r} cannot be modelled: {error}. Remove or correct this track before matching.') from error
        curve = curves[fid]
        warnings.extend(curve['warnings'])
        ratio = _at_arrivals(curve, recording_start_utc + times)
        if not np.all(np.isfinite(ratio)):
            return {'valid': False, 'score': float('inf'), 'rmse_hz': float('inf'), 'per_event': per_event, 'warnings': list(dict.fromkeys(warnings + [f'Insufficient arrival-time track coverage for event bound to {fid}; candidate rejected.']))}
        f0 = float(np.dot(ratio, frequencies) / np.dot(ratio, ratio))
        predicted = f0*ratio
        residual = frequencies - predicted
        sse = float(np.dot(residual, residual))
        squared_error += sse
        count += len(times)
        per_event.append({'flight_id': fid, 'times_s': times.copy(), 'observed_frequencies_hz': frequencies.copy(), 'predicted_frequencies_hz': predicted, 'f0_hz': f0, 'rmse_hz': float(np.sqrt(sse/len(times))), 'residuals_hz': residual})
    rmse = float(np.sqrt(squared_error/count))
    return {'valid': True, 'score': rmse, 'rmse_hz': rmse, 'per_event': per_event, 'warnings': list(dict.fromkeys(warnings))}


def score_candidate(events, tracks, observer, recording_start_utc, sound_speed_m_s=343.0, max_gap_s=30.0, _curves=None):
    """Rank automatic assignments independently per event at a shared location/time.

    Auto assignment does not establish that a sound actually came from an aircraft.
    The same flight may legitimately be selected for more than one event.
    Malformed/unsupported tracks stop evaluation with an identified error, even
    during automatic assignment; they are never silently omitted from the pool.
    """
    curves = {} if _curves is None else _curves
    if len({str(t['flight_id']) for t in tracks}) != len(tracks):
        raise ValueError('Each track requires a unique flight_id')
    if not events or not tracks:
        raise ValueError('Provide at least one event and track')
    if len(events) > 20 or len(tracks) > 100 or len(events)*len(tracks) > 500:
        raise ValueError('Limit to 20 events, 100 tracks, and 500 event/track combinations')
    if all(e.get('flight_id') not in (None, '', 'auto') for e in events):
        return _score_fixed(events, tracks, observer, recording_start_utc, sound_speed_m_s, max_gap_s, curves)
    chosen, warnings, sse, count = [], [], 0., 0
    for event in events:
        options = tracks if event.get('flight_id') in (None, '', 'auto') else [t for t in tracks if str(t['flight_id']) == str(event['flight_id'])]
        if not options:
            raise ValueError('Unknown assigned flight_id')
        fits = [_score_fixed([{**event, 'flight_id': t['flight_id']}], [t], observer, recording_start_utc, sound_speed_m_s, max_gap_s, curves) for t in options]
        valid = [f for f in fits if f['valid']]
        if not valid:
            return {'valid': False, 'score': float('inf'), 'rmse_hz': float('inf'), 'per_event': chosen, 'warnings': ['No assigned flight fully covers an event in arrival time.']}
        best = min(valid, key=lambda f: f['score'])
        chosen.extend(best['per_event'])
        warnings.extend(best['warnings'])
        n = len(event['times_s'])
        sse += best['rmse_hz']**2*n
        count += n
    rmse = float(np.sqrt(sse/count))
    warnings.append('Automatic flight assignment is lowest fit error among imported tracks, not identification confidence.')
    return {'valid': True, 'score': rmse, 'rmse_hz': rmse, 'per_event': chosen, 'warnings': list(dict.fromkeys(warnings))}


def search_candidates(events, tracks, candidates, recording_start_utc, time_offsets_s=None, sound_speed_m_s=343.0, max_gap_s=30.0):
    """Return compact ranked summaries; call score_candidate for curve arrays.

    Unsupported/malformed tracks raise an actionable ValueError naming the track.
    """
    offsets = np.asarray([0.] if time_offsets_s is None else time_offsets_s, float)
    if offsets.ndim != 1 or not len(offsets) or not np.all(np.isfinite(offsets)):
        raise ValueError('Time offsets must be a finite nonempty vector')
    if len(candidates)*len(offsets) > MAX_SEARCH_PAIRS:
        raise ValueError(f'Search limited to {MAX_SEARCH_PAIRS} candidate/offset pairs')
    results = []
    for observer in candidates:
        curves = {}
        for offset in offsets:
            start = float(recording_start_utc + offset)
            result = score_candidate(events, tracks, observer, start, sound_speed_m_s, max_gap_s, curves)
            if result['valid']:
                summary = {key: value for key, value in result.items() if key != 'per_event'}
                summary['event_fits'] = [{key: event[key] for key in ('flight_id', 'f0_hz', 'rmse_hz')} for event in result['per_event']]
                results.append({**observer, **summary, 'observer': dict(observer), 'recording_start_utc': start, 'time_offset_s': float(offset)})
    return sorted(results, key=lambda x: x['score'])
