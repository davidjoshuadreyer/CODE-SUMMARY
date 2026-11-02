import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
// Browser modules live in a repository with a CommonJS package.json.
const source = await readFile(new URL('../doppler/flights.js', import.meta.url), 'utf8');
const { parseTracks, candidateGrid, importEvents } = await import(`data:text/javascript;base64,${Buffer.from(source).toString('base64')}`);

const csv = 'flight_id,time_utc,latitude,longitude,altitude_m,altitude_datum\r\n"A,quoted",2026-11-02T12:00:10Z,49,-123,3000,geometric\r\n"A,quoted",2026-11-02T12:00:00Z,49,-123.01,3000,geometric\r\n';
const [track] = parseTracks(csv, { format: 'csv' });
assert.equal(track.flight_id, 'A,quoted');
assert.equal(track.times_utc[1] - track.times_utc[0], 10);
assert.equal(track.altitude_datum, 'geometric');
assert.ok(track.warnings.some(w => w.includes('sorted')));
assert.deepEqual(parseTracks(JSON.stringify({ tracks: [track] }))[0].times_utc, track.times_utc);

const readsb = { icao: 'abc123', timestamp: 1700000000, trace: [
  [0, 49, -123, 10000, 200, 90, 0, 0, null, 'adsb', 11000],
  [5, 49, -123, 10000, 200, 90, 1, 0, null, 'adsb', 11000],
  [10, 49, -122.98, 11000, 200, 90, 8],
] };
const [geom] = parseTracks(JSON.stringify(readsb));
assert.deepEqual(geom.times_utc, [1700000000, 1700000010]);
assert.deepEqual(geom.altitudes_m, [3352.8, 3352.8]);
assert.equal(geom.altitude_datum, 'geometric');
assert.throws(() => parseTracks(JSON.stringify(readsb), { altitudeSource: 'barometric' }), /2–500000/);

for (const changes of [
  { times_utc: [1700000000000, 1700000010000] },
  { times_utc: [0, 0] },
  { latitudes: [91, 0] },
  { altitude_datum: 'MSL' },
  { altitudes_m: [null, 100] },
  { times_utc: ['2026-02-30T12:00:00Z', '2026-03-01T12:00:00Z'] },
  { times_utc: ['2026-11-02T12:00:00', '2026-11-02T12:00:10'] },
]) assert.throws(() => parseTracks(JSON.stringify({ tracks: [{ ...track, ...changes }] })));
assert.throws(() => parseTracks(csv.replace('3000,geometric', '3000,unknown'), { format: 'csv' }), /mixed/);
assert.throws(() => parseTracks(csv.replace('"A,quoted"', '"A,quoted'), { format: 'csv' }));
assert.throws(() => parseTracks(JSON.stringify({ tracks: [track, track] })), /unique/);

const points = candidateGrid(49, 49.01, -123, -122.99, 500, 25);
assert.deepEqual(points[0], { latitude: 49, longitude: -123, elevation_m: 25 });
assert.deepEqual(points.at(-1), { latitude: 49.01, longitude: -122.99, elevation_m: 25 });
assert.equal(candidateGrid(49, 49, -123, -123, 25).length, 1);
assert.throws(() => candidateGrid(49, 50, -123, -122, 0.001), /exceeds/);
assert.throws(() => candidateGrid(49, 50, 179, -179, 500));

const event = { times_s: [1, 2, 3], frequencies_hz: [155, 154, 153], flight_id: 'A' };
assert.deepEqual(importEvents(JSON.stringify(event))[0].times_s, [1, 2, 3]);
assert.equal(importEvents(JSON.stringify({ source_kind: 'synthetic', events: [event] }))[0].provenance, 'synthetic');
assert.equal(importEvents(JSON.stringify({ ...event, provenance: { invalid: true } }))[0].provenance, 'imported');
for (const changes of [{ times_s: [1, 1, 2] }, { frequencies_hz: [0, 1, 2] }, { times_s: [-1, 0, 1] }, { frequencies_hz: [1] }]) {
  assert.throws(() => importEvents(JSON.stringify({ ...event, ...changes })));
}

// Python-generated normalized fixture uses exactly the browser import schema.
const fixture = await readFile(new URL('../doppler/sample-tracks.csv', import.meta.url), 'utf8');
assert.equal(parseTracks(fixture, { format: 'csv' }).length, 2);
console.log('Flight ingestion, datum/time validation, event imports, and bounded grids passed.');
