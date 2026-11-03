"""Fully SYNTHETIC two-flight scenario; not evidence of real-world accuracy."""
import numpy as np
from .physics import predict_received_curve


def make_demo():
    epoch = 1700000000.0
    observer = {'latitude': 49.25, 'longitude': -123.10, 'elevation_m': 0.}
    tracks = []
    for fid, center, eastbound in [('SYNTHETIC-A', 55., True), ('SYNTHETIC-B', 155., False)]:
        sec = np.arange(center-80, center+81, 2.)
        distance = (sec-center)*105.
        lat = observer['latitude'] + (np.full_like(sec, 1200.) if eastbound else distance)/111200.
        lon = observer['longitude'] + (distance if eastbound else np.full_like(sec, -1700.))/(111200.*np.cos(np.deg2rad(observer['latitude'])))
        tracks.append({'flight_id': fid, 'times_utc': epoch+sec, 'latitudes': lat, 'longitudes': lon, 'altitudes_m': np.full_like(sec, 1800. if eastbound else 2200.), 'altitude_datum': 'geometric', 'warnings': ['SYNTHETIC generated trajectory, not an actual aircraft.']})
    events = []
    for track, start, end, f0 in zip(tracks, [25., 125.], [100., 200.], [150., 185.]):
        times = np.arange(start, end+.01, .5)
        curve = predict_received_curve(track, observer)
        hz = f0*np.interp(epoch+times, curve['times_utc'], curve['frequency_ratio'])
        events.append({'flight_id': track['flight_id'], 'times_s': times, 'frequencies_hz': hz, 'f0_hz': f0, 'synthetic': True})
    candidates = [{'latitude': observer['latitude']+dy*.005, 'longitude': observer['longitude']+dx*.007, 'elevation_m': 0.} for dy in range(-2, 3) for dx in range(-2, 3)]
    return {'synthetic': True, 'label': 'SYNTHETIC demonstration: generated tones and trajectories', 'tracks': tracks, 'events': events, 'observer': observer, 'recording_start_utc': epoch, 'candidates': candidates, 'duration_s': 220.}
