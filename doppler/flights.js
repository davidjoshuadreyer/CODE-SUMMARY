/* Local-only flight ingestion. Coordinates: WGS84 degrees; heights: metres. */
const MAX_BYTES = 64 * 1024 * 1024;
const MAX_POINTS = 500000;
const DATUMS = new Set(['geometric', 'barometric', 'unknown']);

function number(value, label) {
  if ((typeof value !== 'number' && typeof value !== 'string') || String(value).trim() === '') {
    throw new Error(`${label} must be a finite number`);
  }
  const n = Number(value);
  if (!Number.isFinite(n)) throw new Error(`${label} must be a finite number`);
  return n;
}

function time(value) {
  let n;
  if (typeof value === 'string' && !Number.isFinite(Number(value))) {
    const match = value.trim().match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.\d+)?(Z|[+-]\d{2}:\d{2})$/);
    if (!match) throw new Error('time_utc requires Unix seconds or ISO 8601 with explicit timezone');
    const [, y, m, d, h, min, s] = match.map((v, i) => i > 0 && i < 7 ? Number(v) : v);
    const days = [31, y % 4 === 0 && (y % 100 !== 0 || y % 400 === 0) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    if (y < 1 || m < 1 || m > 12 || d < 1 || d > days[m - 1] || h > 23 || min > 59 || s > 59) {
      throw new Error('Invalid ISO calendar date or time');
    }
    n = Date.parse(value.trim()) / 1000;
  } else n = number(value, 'time_utc');
  if (!Number.isFinite(n) || n < -62135596800 || n >= 253402300800) {
    throw new Error('time_utc outside supported calendar range; use Unix seconds, not milliseconds');
  }
  return n;
}

function checkedText(text) {
  if (typeof text !== 'string' || text.length > MAX_BYTES || new TextEncoder().encode(text).length > MAX_BYTES) {
    throw new Error('Input must be text no larger than 64 MiB');
  }
  return text.replace(/^\uFEFF/, '');
}

function track(id, rows, datum = 'unknown', warnings = []) {
  if (typeof id !== 'string' || !id.trim()) throw new Error('A nonempty string flight_id is required');
  if (!DATUMS.has(datum)) throw new Error('altitude_datum must be geometric, barometric, or unknown');
  if (rows.length < 2 || rows.length > MAX_POINTS) throw new Error('Each track requires 2–500000 points');
  const points = rows.map(r => [time(r[0]), number(r[1], 'latitude'), number(r[2], 'longitude'), number(r[3], 'altitude_m')]);
  for (const [, lat, lon, alt] of points) {
    if (Math.abs(lat) > 90 || Math.abs(lon) > 180) throw new Error('Coordinates outside WGS84 degree bounds');
    if (alt < -1000 || alt > 100000) throw new Error('Altitude outside supported -1000 to 100000 metres');
  }
  const notes = [...warnings];
  if (points.some((p, i) => i && p[0] < points[i - 1][0])) notes.push('Input points were sorted by UTC time.');
  points.sort((a, b) => a[0] - b[0]);
  if (points.some((p, i) => i && p[0] === points[i - 1][0])) throw new Error(`Track ${id}: duplicate timestamps`);
  if (points.some((p, i) => i && p[0] - points[i - 1][0] > 30)) notes.push('Track contains gaps over 30 seconds; do not interpolate across them.');
  if (datum !== 'geometric') notes.push(`Altitude datum is ${datum}; no conversion to WGS84 ellipsoid height was applied.`);
  return { flight_id: id.trim(), times_utc: points.map(p => p[0]), latitudes: points.map(p => p[1]),
    longitudes: points.map(p => p[2]), altitudes_m: points.map(p => p[3]), altitude_datum: datum, warnings: notes };
}

function normalized(data) {
  if (!Array.isArray(data.tracks) || !data.tracks.length) throw new Error('JSON requires a nonempty tracks array');
  let total = 0;
  const keys = ['times_utc', 'latitudes', 'longitudes', 'altitudes_m'];
  return data.tracks.map(item => {
    if (!item || keys.some(k => !Array.isArray(item[k]))) throw new Error('Track requires times_utc, latitudes, longitudes, altitudes_m arrays');
    const n = item.times_utc.length;
    total += n;
    if (keys.some(k => item[k].length !== n) || total > MAX_POINTS) throw new Error('Track arrays must match and total at most 500000 points');
    return track(item.flight_id, item.times_utc.map((_, i) => keys.map(k => item[k][i])), item.altitude_datum ?? 'unknown');
  });
}

function readsb(data, source) {
  const base = time(data.timestamp);
  if (!Array.isArray(data.trace) || data.trace.length > MAX_POINTS) throw new Error('readsb trace must have at most 500000 points');
  const buckets = { geometric: [], barometric: [] };
  let stale = 0, ground = 0, missing = 0;
  for (const row of data.trace) {
    if (!Array.isArray(row) || row.length < 7) throw new Error('Malformed readsb row: at least seven entries required');
    const flags = number(row[6], 'readsb flags');
    if (!Number.isInteger(flags) || flags < 0 || flags > 0x7fffffff) throw new Error('readsb flags must be a nonnegative integer bitfield');
    if (flags & 1) { stale++; continue; }
    if (row[3] === 'ground') { ground++; continue; }
    if (row[1] == null || row[2] == null) { missing++; continue; }
    const extra = row[8] && typeof row[8] === 'object' ? row[8] : {};
    const geom = row[10] ?? extra.alt_geom ?? ((flags & 8) ? row[3] : null);
    const baro = (flags & 8) ? extra.alt_baro : row[3];
    for (const [datum, alt] of [['geometric', geom], ['barometric', baro]]) {
      if (alt != null && alt !== 'ground') buckets[datum].push([base + number(row[0], 'trace time offset'), row[1], row[2], number(alt, 'altitude feet') * 0.3048]);
    }
  }
  const selected = source === 'auto' ? (buckets.geometric.length >= 2 ? 'geometric' : 'barometric') : source;
  const excluded = data.trace.length - stale - ground - missing - buckets[selected].length;
  return [track(data.icao || data.hex || data.flight_id, buckets[selected], selected, [
    `readsb ${selected} altitude selected uniformly; feet converted to metres.`,
    `Excluded ${stale} stale, ${ground} ground, ${missing} missing-position and ${excluded} missing-${selected}-altitude points.`,
  ])];
}

// RFC-style comma-separated input, including quoted fields and escaped quotes.
function csvRows(text) {
  const rows = [];
  let row = [], field = '', quoted = false, closed = false;
  const pushRow = () => {
    row.push(field);
    if (row.some(v => v.trim() !== '')) rows.push(row);
    if (rows.length > MAX_POINTS + 1) throw new Error('CSV exceeds 500000 points');
    row = []; field = ''; closed = false;
  };
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) {
      if (c === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; }
        else { quoted = false; closed = true; }
      } else field += c;
    } else if (c === ',' || c === '\n' || c === '\r') {
      if (c === ',') { row.push(field); field = ''; closed = false; }
      else { pushRow(); if (c === '\r' && text[i + 1] === '\n') i++; }
    } else if (closed) {
      if (!/\s/.test(c)) throw new Error('Unexpected character after quoted CSV field');
    } else if (c === '"') {
      if (field !== '') throw new Error('Unexpected quote in CSV field');
      quoted = true;
    } else field += c;
  }
  if (quoted) throw new Error('Unterminated quoted CSV field');
  pushRow();
  return rows;
}

function csv(text) {
  const rows = csvRows(text);
  if (!rows.length) throw new Error('CSV is empty');
  const header = rows.shift().map(v => v.trim());
  const fields = ['flight_id', 'time_utc', 'latitude', 'longitude', 'altitude_m'];
  if (fields.some(f => !header.includes(f)) || new Set(header).size !== header.length) throw new Error('CSV requires unique flight_id,time_utc,latitude,longitude,altitude_m columns');
  const groups = new Map();
  for (const row of rows) {
    if (row.length !== header.length) throw new Error('CSV row has a different number of columns from header');
    const get = k => row[header.indexOf(k)];
    const id = get('flight_id').trim();
    const datum = get('altitude_datum')?.trim() || 'unknown';
    if (!groups.has(id)) groups.set(id, { datum, rows: [] });
    const group = groups.get(id);
    if (group.datum !== datum) throw new Error(`Track ${id}: mixed altitude datums`);
    group.rows.push(fields.slice(1).map(get));
  }
  return [...groups].map(([id, group]) => track(id, group.rows, group.datum));
}

export function parseTracks(text, { format = 'json', altitudeSource = 'auto' } = {}) {
  text = checkedText(text);
  if (!['auto', 'geometric', 'barometric'].includes(altitudeSource)) throw new Error('Invalid altitudeSource');
  let tracks;
  if (format === 'csv') tracks = csv(text);
  else if (format === 'json') {
    let data;
    try { data = JSON.parse(text); } catch { throw new Error('Invalid JSON'); }
    if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('Track JSON must be an object');
    tracks = 'trace' in data ? readsb(data, altitudeSource) : normalized(data);
  } else throw new Error('format must be json or csv');
  if (!tracks.length) throw new Error('No tracks in file');
  if (new Set(tracks.map(t => t.flight_id)).size !== tracks.length) throw new Error('Track flight_id values must be unique');
  return tracks;
}

export function candidateGrid(latMin, latMax, lonMin, lonMax, spacingM, elevationM = 0, maxPoints = 2500) {
  [latMin, latMax, lonMin, lonMax, spacingM, elevationM] = [latMin, latMax, lonMin, lonMax, spacingM, elevationM].map(v => number(v, 'Grid parameter'));
  if (!(latMin >= -85 && latMin <= latMax && latMax <= 85 && lonMin >= -180 && lonMin <= lonMax && lonMax <= 180)) throw new Error('Use ordered grid bounds within ±85° latitude; no antimeridian crossing');
  if (latMax - latMin > 5 || lonMax - lonMin > 5) throw new Error('Local grid spans must not exceed 5°');
  if (spacingM <= 0 || elevationM < -1000 || elevationM > 10000) throw new Error('Positive spacing and elevation between -1000 and 10000 m required');
  if (!Number.isInteger(maxPoints) || maxPoints < 1 || maxPoints > 100000) throw new Error('maxPoints must be an integer from 1 to 100000');
  const ny = Math.max(1, Math.ceil((latMax - latMin) * 111320 / spacingM) + 1);
  const nx = Math.max(1, Math.ceil((lonMax - lonMin) * 111320 * Math.cos((latMin + latMax) * Math.PI / 360) / spacingM) + 1);
  if (!Number.isFinite(nx * ny) || nx * ny > maxPoints) throw new Error(`Grid exceeds ${maxPoints} points; increase spacing or reduce area`);
  const grid = [];
  for (let y = 0; y < ny; y++) for (let x = 0; x < nx; x++) grid.push({
    latitude: ny === 1 ? latMin : latMin + (latMax - latMin) * y / (ny - 1),
    longitude: nx === 1 ? lonMin : lonMin + (lonMax - lonMin) * x / (nx - 1), elevation_m: elevationM,
  });
  return grid;
}

export function importEvents(text) {
  let data;
  try { data = JSON.parse(checkedText(text)); } catch (error) { throw new Error(`Invalid events JSON: ${error.message}`); }
  const events = Array.isArray(data?.events) ? data.events : data?.times_s ? [data] : null;
  if (!events || !events.length || events.length > 20) throw new Error('Provide one curve or an events array with 1–20 events');
  let total = 0;
  return events.map((event, i) => {
    if (!event || !Array.isArray(event.times_s) || !Array.isArray(event.frequencies_hz) || event.times_s.length !== event.frequencies_hz.length || event.times_s.length < 3) throw new Error('Events require matching times_s and frequencies_hz arrays with at least three samples');
    total += event.times_s.length;
    if (total > MAX_POINTS) throw new Error('Events exceed 500000 total samples');
    const times = event.times_s.map(v => number(v, 'Event time'));
    const hz = event.frequencies_hz.map(v => number(v, 'Event frequency'));
    if (times.some((v, j) => v < 0 || (j && v <= times[j - 1])) || hz.some(v => v <= 0)) throw new Error('Event times must be increasing and nonnegative; frequencies must be positive');
    if (event.flight_id != null && typeof event.flight_id !== 'string') throw new Error('Event flight_id must be a string');
    return { times_s: times, frequencies_hz: hz, flight_id: event.flight_id || 'auto',
      name: typeof event.name === 'string' ? event.name : `Imported event ${i + 1}`,
      provenance: typeof event.provenance === 'string' ? event.provenance : typeof data.source_kind === 'string' ? data.source_kind : 'imported', synthetic: event.synthetic === true,
      warnings: ['Imported curve; verify its source recording and original-start time offsets.'] };
  });
}
