"""Bounded ADSB.lol archive access, with no implicit bulk download.

Official yearly repositories document split *tar* files containing gzipped
readsb JSON: https://github.com/adsblol/globe_history_2026 . Database: ODbL.
No archive member is ever extracted to disk. Bbox selects whole trajectories;
it is an aircraft filter, not a receiver search boundary.
"""
from __future__ import annotations
import datetime as dt
import gzip
import hashlib
import io
import json
import math
from pathlib import Path, PurePosixPath
import re
import tarfile
import tempfile
from urllib.request import Request, urlopen

from .flights import _readsb, _time

MIB = 1024 ** 2


def _get(url):
    return urlopen(Request(url, headers={"User-Agent": "doppler-lab", "Accept": "application/vnd.github+json"}), timeout=60)


def _metadata(url, limit=4 * MIB):
    with _get(url) as response:
        raw = response.read(limit + 1)
    if len(raw) > limit:
        raise ValueError("Remote metadata exceeds size limit")
    return raw.decode("utf-8")


def discover_release(date_iso):
    """Resolve the official preferred daily release, fetching metadata only."""
    date = dt.date.fromisoformat(date_iso)
    if date.isoformat() != date_iso or date.year < 2023:
        raise ValueError("Expected YYYY-MM-DD, year 2023 or later")
    repository = f"adsblol/globe_history_{date.year}"
    prefix = f"https://github.com/{repository}/releases/download/"
    day = 'v' + date.strftime('%Y.%m.%d') + '-'
    preferred = _metadata(f"https://raw.githubusercontent.com/{repository}/main/PREFERRED_RELEASES.txt")
    choices = [line.strip().split(',') for line in preferred.splitlines()
               if line.strip().startswith(prefix + day)]
    if len(choices) != 1:
        raise ValueError(f"No unique preferred release for {date_iso}; it may not be published yet")
    urls = choices[0]
    tag = urls[0][len(prefix):].split('/')[0]
    if not re.fullmatch(r'v\d{4}\.\d{2}\.\d{2}-planes-readsb-(prod|staging)-\d+', tag):
        raise ValueError("Unexpected official release tag")
    release = json.loads(_metadata(f"https://api.github.com/repos/{repository}/releases/tags/{tag}"))
    indexed = {a['browser_download_url']: a for a in release['assets']}
    assets = []
    for url in urls:
        if not url.startswith(prefix + tag + '/') or url not in indexed:
            raise ValueError("Preferred asset absent from official release metadata")
        a = indexed[url]
        name = url.rsplit('/', 1)[1]
        if name != a['name'] or not re.fullmatch(re.escape(tag) + r'\.tar\.[a-z]{2}', name):
            raise ValueError("Unexpected archive asset name")
        size = a['size']
        if isinstance(size, bool) or not isinstance(size, int) or size <= 0:
            raise ValueError("Invalid asset size")
        digest = a.get('digest')
        if digest and not re.fullmatch(r'sha256:[0-9a-fA-F]{64}', digest):
            raise ValueError("Unsupported asset digest")
        assets.append(dict(name=name, url=url, size_bytes=size,
                           sha256=digest.split(':')[1].lower() if digest else None))
    assets.sort(key=lambda a: a['name'])
    _validate_parts([Path(a['name']) for a in assets])
    return dict(date=date_iso, repository=repository, tag=tag, assets=assets,
                total_bytes=sum(a['size_bytes'] for a in assets),
                source_url=f"https://github.com/{repository}/releases/tag/{tag}",
                license="ODbL-1.0", warnings=["Daily archives can be several GiB; downloading requires an explicit sufficient byte budget."])


def _sha(path):
    h = hashlib.sha256()
    with path.open('rb') as f:
        for block in iter(lambda: f.read(MIB), b''):
            h.update(block)
    return h.hexdigest()


def download_release(plan, cache_dir, max_bytes=256 * MIB, on_progress=None):
    """Download only an explicitly budgeted plan. Hash-check every cache reuse.

    Upstream SHA256 is checked when present; otherwise a local checksum detects
    later cache corruption but does not authenticate the upstream contents.
    """
    assets = plan['assets']
    repository, tag = plan['repository'], plan['tag']
    if not re.fullmatch(r'adsblol/globe_history_\d{4}', repository) or not re.fullmatch(r'v\d{4}\.\d{2}\.\d{2}-planes-readsb-(prod|staging)-\d+', tag):
        raise ValueError("Not an official ADSB.lol archive plan")
    total = 0
    for a in assets:
        if not re.fullmatch(re.escape(tag) + r'\.tar\.[a-z]{2}', a['name']):
            raise ValueError("Unsafe asset name")
        if a['url'] != f"https://github.com/{repository}/releases/download/{tag}/{a['name']}":
            raise ValueError("Asset URL must belong to the official release")
        if type(a['size_bytes']) is not int or a['size_bytes'] <= 0:
            raise ValueError("Invalid asset size")
        if a.get('sha256') and not re.fullmatch(r'[0-9a-fA-F]{64}', a['sha256']):
            raise ValueError("Invalid SHA256")
        total += a['size_bytes']
    _validate_parts([Path(a['name']) for a in assets])
    if total > max_bytes or total != plan['total_bytes']:
        raise ValueError(f"Archive needs {total} bytes, exceeds budget or disagrees with manifest")
    folder = Path(cache_dir) / repository.split('/')[-1] / tag
    folder.mkdir(parents=True, exist_ok=True)
    paths, completed = [], 0
    for a in assets:
        target = folder / a['name']
        checksum = target.with_name(target.name + '.sha256')
        if target.is_symlink() or checksum.is_symlink():
            raise ValueError("Symlink cache entries are forbidden")
        expected = a.get('sha256')
        if target.exists():
            known = expected or (checksum.read_text().strip() if checksum.exists() else None)
            if not known or target.stat().st_size != a['size_bytes'] or _sha(target) != known.lower():
                raise ValueError(f"Cached asset failed integrity check: {target}")
        else:
            temp = None
            try:
                with tempfile.NamedTemporaryFile(dir=folder, suffix='.part', delete=False) as out:
                    temp = Path(out.name)
                    count, digest = 0, hashlib.sha256()
                    with _get(a['url']) as response:
                        while block := response.read(MIB):
                            count += len(block)
                            if count > a['size_bytes']:
                                raise ValueError("Downloaded asset exceeds declared size")
                            out.write(block)
                            digest.update(block)
                            if on_progress:
                                on_progress(completed + count, total)
                    if count != a['size_bytes'] or (expected and digest.hexdigest() != expected.lower()):
                        raise ValueError("Downloaded asset failed size/hash integrity check")
                temp.replace(target)
                checksum.write_text(digest.hexdigest() + '\n')
            finally:
                if temp is not None:
                    temp.unlink(missing_ok=True)
        completed += a['size_bytes']
        if on_progress:
            on_progress(completed, total)
        paths.append(target)
    return paths


def _validate_parts(parts):
    if not parts:
        raise ValueError("At least one archive part is required")
    matches = [re.fullmatch(r'(.+\.tar)\.([a-z]{2})', p.name) for p in parts]
    if any(matches):
        if not all(matches) or len({m[1] for m in matches}) != 1:
            raise ValueError("Archive parts must belong to one split tar")
        expected = [chr(97 + i // 26) + chr(97 + i % 26) for i in range(len(parts))]
        if [m[2] for m in matches] != expected:
            raise ValueError("Archive parts must be contiguous, ordered, and start with .aa")
    elif len(parts) != 1:
        raise ValueError("Multiple inputs require split-tar part names")


class _Parts(io.RawIOBase):
    def __init__(self, paths):
        self.paths, self.index, self.stream = paths, 0, None
    def readable(self):
        return True
    def read(self, size=-1):
        if size < 0:
            raise ValueError("Unbounded archive read forbidden")
        out = bytearray()
        while len(out) < size:
            if self.stream is None:
                if self.index == len(self.paths):
                    break
                self.stream = self.paths[self.index].open('rb')
                self.index += 1
            block = self.stream.read(size - len(out))
            out.extend(block)
            if not block:
                self.stream.close()
                self.stream = None
        return bytes(out)
    def close(self):
        if self.stream:
            self.stream.close()
        super().close()


def iter_archive_traces(parts, flight_ids=None, start_utc=None, end_utc=None,
                        bbox=None, altitude_source='auto', max_bytes=4 * 1024**3,
                        max_members=300000, max_member_bytes=8 * MIB,
                        max_json_bytes=64 * MIB, max_points=500000,
                        max_tracks=10000, time_padding_s=0):
    """Stream local split tar into parser-compatible JSON tracks.

    Time cropping retains one bracketing sample on each side plus explicit
    padding. bbox=(south,north,west,east) selects whole tracks with a point in
    the box, and must not be confused with a receiver search bound. Ground-only
    or insufficient-altitude traces are skipped; malformed input fails closed.
    Input tar must be uncompressed (members themselves may be gzipped), as in
    official releases. Limits bound bytes scanned, each JSON, and output size.
    """
    paths = [Path(p) for p in parts]
    _validate_parts(paths)
    if any(p.is_symlink() or not p.is_file() for p in paths):
        raise ValueError("Archive parts must be regular, non-symlink files")
    if sum(p.stat().st_size for p in paths) > max_bytes:
        raise ValueError("Archive exceeds explicit scan byte budget")
    if altitude_source not in {'auto', 'geometric', 'barometric'}:
        raise ValueError("Invalid altitude_source")
    start = _time(start_utc) if start_utc is not None else -math.inf
    end = _time(end_utc) if end_utc is not None else math.inf
    if start > end or not math.isfinite(time_padding_s) or time_padding_s < 0:
        raise ValueError("Invalid time window or padding")
    start, end = start - time_padding_s, end + time_padding_s
    if bbox is not None:
        if len(bbox) != 4 or not (-90 <= bbox[0] <= bbox[1] <= 90 and -180 <= bbox[2] <= bbox[3] <= 180):
            raise ValueError("bbox requires ordered south,north,west,east degree bounds")
    ids = {str(i).lower() for i in flight_ids} if flight_ids is not None else None
    count = points = expanded = 0
    seen = set()
    with _Parts(paths) as stream, tarfile.open(fileobj=stream, mode='r|') as archive:
        for number, member in enumerate(archive, 1):
            if number > max_members:
                raise ValueError("Archive exceeds member count limit")
            path = PurePosixPath(member.name)
            if path.is_absolute() or '..' in path.parts or '\\' in member.name or ':' in member.name:
                raise ValueError("Unsafe archive member path")
            if not (member.isfile() or member.isdir()):
                raise ValueError("Archive links and special members are forbidden")
            expanded += member.size
            if expanded > max_bytes:
                raise ValueError("Archive exceeds expanded byte budget")
            match = re.fullmatch(r'trace_full_([a-zA-Z0-9~]+)\.json(?:\.gz)?', path.name)
            if not match or 'traces' not in path.parts or not member.isfile():
                continue
            identity = match[1].lower()
            if ids is not None and identity not in ids:
                continue
            if member.size > max_member_bytes:
                raise ValueError("Compressed trace exceeds member size limit")
            with archive.extractfile(member) as f:
                raw = f.read(max_member_bytes + 1)
            if raw.startswith(b'\x1f\x8b'):
                with gzip.GzipFile(fileobj=io.BytesIO(raw)) as f:
                    raw = f.read(max_json_bytes + 1)
            if len(raw) > max_json_bytes:
                raise ValueError("Decompressed trace exceeds JSON limit")
            data = json.loads(raw)
            if not isinstance(data, dict):
                raise ValueError("Trace JSON must be an object")
            data.setdefault('icao', identity)
            if str(data['icao']).lower() != identity:
                raise ValueError("Trace filename and aircraft identity disagree")
            try:
                track = _readsb(data, altitude_source)[0]
            except ValueError as exc:
                if 'requires 2–500000 points' in str(exc):
                    continue
                raise ValueError(f"{member.name}: {exc}") from exc
            times = track['times_utc']
            if times[-1] < start or times[0] > end:
                continue
            lo = max(0, int(times.searchsorted(start, side='left')) - 1)
            hi = min(len(times), int(times.searchsorted(end, side='right')) + 1)
            for key in ('times_utc', 'latitudes', 'longitudes', 'altitudes_m'):
                track[key] = track[key][lo:hi].tolist()
            if len(track['times_utc']) < 2:
                continue
            if bbox is not None and not any(bbox[0] <= lat <= bbox[1] and bbox[2] <= lon <= bbox[3]
                                            for lat, lon in zip(track['latitudes'], track['longitudes'])):
                continue
            if identity in seen:
                raise ValueError("Duplicate full trace identity in archive")
            seen.add(identity)
            count += 1
            points += len(track['times_utc'])
            if count > max_tracks or points > min(max_points, 500000):
                raise ValueError("Extracted tracks exceed output count/point budget")
            yield track


def extract_tracks(parts, **kwargs):
    """Return a JSON-serializable normalized dataset without writing files."""
    parts = list(parts)
    tracks = list(iter_archive_traces(parts, **kwargs))
    return dict(tracks=tracks, provenance=dict(provider='ADSB.lol', license='ODbL-1.0',
                archive_parts=[Path(p).name for p in parts],
                source='https://github.com/adsblol/globe_history',
                warnings=['Archive observations are not guaranteed complete; no terrain or altitude-datum conversion applied.']))
