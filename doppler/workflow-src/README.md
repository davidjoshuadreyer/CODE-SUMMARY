# Local historical-flight matching workflow

This companion takes measured curves exported by Tesselate, retrieves explicitly selected historical flight archives, and compares flight predictions with the curves. It runs on your computer. The site does not upload recordings to a server.

## Install once

Use Python 3.10 or newer. From the extracted workflow folder:

```sh
python3 -m venv .venv
.venv/bin/python -m pip install -r requirements.txt
```

On Windows use `.venv\Scripts\python` in place of `.venv/bin/python`.

## Verify the complete matching path

```sh
.venv/bin/python -m doppler_lab demo --output demo-run
```

Open `demo-run/results/report.html`. This explicitly synthetic example exercises automatic aircraft assignment, a coarse position/time grid, bounded SciPy refinement, a shared recording clock, predicted-versus-measured overlays, CSV and JSON evidence. The known reference position is compared only after fitting. This is a functional test, not real-recording accuracy evidence.

## Search when only the date is known

After exporting and selecting two measured flyovers, the experimental `day-search` path does not require a recording start or receiver bounds. Download the date’s archive as described below, then run:

```sh
.venv/bin/python -m doppler_lab archive-index archive-cache/*.tar.* --date 2026-09-08 --output day-tracks.jsonl --max-mb 6144
.venv/bin/python -m doppler_lab day-search my-recording/job.json --tracks day-tracks.jsonl --date 2026-09-08
```

The date is a UTC archive day, not automatically the recording’s local calendar day. Adjacent days may be needed. The index selects aircraft intersecting 20–55°N, 130–60°W and preserves their original samples. Search uses physical curve fits to propose receivers on both sides of flight paths, pairs compatible receiver/time hypotheses, and refines a bounded shortlist against measured frequencies. Results record search coverage and work limits; this is a heuristic search, not exhaustive proof of location. Receiver elevation hypotheses (0, 750 and 2,000 m by default) and constant sound speed remain approximations. Ambiguous duplicate timestamps are discarded during indexing, with omissions recorded in track warnings.

`--max-hypotheses`, `--max-pairs`, `--max-curve-fits` and `--max-refinements` control the work budget. Inspect reported truncation and alternatives before interpreting the top candidate. A best fit alone is not verified identification.

## Prepare your recording

On Tesselate, upload the recording and let automatic extraction finish. Export detected curves and timestamps. To prepare a local job:

```sh
.venv/bin/python -m doppler_lab init detected-doppler-curves.json --output my-recording --events 1,3
```

Event numbers are one-based positions in the exported file. `1,3` selects the two prominent flyovers in the supplied example's current export; it is not a universal selection rule. Omit `--events` to retain every exported event. Do not force unrelated tones to match aircraft. The page also exports a `job.json` directly from its saved events and current search settings.

For the original bounded `run` mode, fill these fields in `my-recording/job.json`:

- `recording_start_utc`: original recording start, such as `2026-09-08T20:00:00Z`. This date/time is an illustrative format, not the sample's verified timestamp.
- `search.bounds`: receiver latitude/longitude search rectangle, with keys `lat_min`, `lat_max`, `lon_min`, `lon_max`.
- `search.elevation_m`: receiver height compatible with the track's vertical datum.
- `search.time_range_s` and `time_step_s`: a shared clock search around the approximate start.
- `tracks`: normalized CSV/JSON or individual readsb `.json.gz` paths, relative to the job file.

Unknown inputs remain null. File creation time and YouTube upload date are never substituted for recording time. The bounded `run` mode needs a region and approximate clock; `day-search` instead uses a known date and flight-pair pruning. Neither mode discovers the recording year.

```sh
.venv/bin/python -m doppler_lab check my-recording/job.json
```

The check lists missing metadata/files. A date alone narrows the archive; it does not establish the recording's UTC start. Events may span UTC midnight, so retrieve adjacent days if needed and merge the same aircraft's points before matching.

## Retrieve historical tracks

First inspect official release metadata, without downloading aircraft data:

```sh
.venv/bin/python -m doppler_lab archive-plan --date YYYY-MM-DD --output archive-plan.json
```

The plan records the official release, ordered asset names, bytes, and SHA256 checksums where available. Whole-day archives can be several gigabytes. Fetch only after choosing an explicit budget large enough for the plan:

```sh
.venv/bin/python -m doppler_lab archive-fetch archive-plan.json --cache archive-cache --max-mb 4096
```

The default download budget is 256 MiB. Exceeding it stops before bulk downloading. Existing cached parts are checksum-verified. Interrupted partial downloads are not accepted as complete files.

The official format is a split **plain tar** (`.tar.aa`, `.tar.ab`, sometimes more parts), containing gzip-compressed readsb JSON traces. Keep all parts from the same release in order. The extractor streams members without writing paths from the archive:

```sh
.venv/bin/python -m doppler_lab archive-extract archive-cache/*.tar.* --start 2026-09-08T19:55:00Z --end 2026-09-08T21:10:00Z --flight-id abc123 --flight-id def456 --output my-recording/tracks.json --max-mb 4096
```

Those timestamps and aircraft hex IDs are illustrative placeholders, not verified sample metadata. Omit `--flight-id` to consider all aircraft in the selected time window, subject to output limits. Use a window that includes aircraft emissions **before** the recorded sound arrives. Check errors rather than silently discarding missing coverage. The bounded `run` mode limits selected tracks to 100 aircraft / 500,000 points. Use `archive-index` and `day-search` for the experimental full-day pruning path.

Data source: [adsb.lol historical archives](https://www.adsb.lol/docs/open-data/historical), under ODbL 1.0. Code and data have separate licenses. Keep source attribution and comply with archive redistribution terms.

## Fit and inspect

```sh
.venv/bin/python -m doppler_lab run my-recording/job.json
```

This step is offline and never downloads data implicitly. It writes:

- `results/report.html`: standalone plots, best candidate, coarse alternatives, limitations.
- `results/result.json`: configuration, file hashes, assignments, refinements and residuals.
- `results/curves.csv`: measured/predicted frequencies and residuals for each original-recording timestamp.

The model uses WGS84 ECEF geometry, velocity at emission, sound propagation delay, one shared recording clock, and one fitted constant source frequency per event. Refinement freezes each candidate aircraft assignment. No extrapolation through missing track coverage is allowed. Residual errors are not calibrated location probabilities. Constant receiver height, still air, constant sound speed and source pitch remain assumptions.

Optional `reference_location` is used only for a post-fit distance comparison; it is never passed to the solver. For a fair reproduction, choose search bounds independently of the target coordinate.

## Source and comment review

The creator's description says no code or tools are being released. The transcript identifies September 8 and the continental US, and the sample’s year was subsequently supplied as 2026 by the user. The full-hour UTC start remains unknown and is fitted jointly with location. The 20:37 UTC mention describes a separate faint one-minute example, not explicitly the beginning of the full recording.

Useful viewer suggestions:

- [ENF timing suggestion](https://www.youtube.com/watch?v=UytYrhYLOKI&lc=Ugy1VFScY8oqmXh-JgZ4AaABAg): [the creator confirms clear mains hum in this sample](https://www.youtube.com/watch?v=UytYrhYLOKI&lc=Ugy1VFScY8oqmXh-JgZ4AaABAg.Achz-9hhTWiAci0u2foWih). Matching requires reference frequency data from the same electrical grid and date. No suitable open US archive has been verified here; European references cannot substitute.
- [Altitude-datum comment](https://www.youtube.com/watch?v=UytYrhYLOKI&lc=Ugxam0zCfGGNiURk0pZ4AaABAg): preserve pressure/geometric labels and investigate datum conversions. Already surfaced in track warnings; automatic weather correction is not implemented.
- [Sound-speed comment](https://www.youtube.com/watch?v=UytYrhYLOKI&lc=UgxuT-9GiyfqVsycZ_94AaABAg): compare results over plausible sound speeds before interpreting precise coordinates. Layered atmospheric propagation is future work.
- [Filter-steepness comment](https://www.youtube.com/watch?v=UytYrhYLOKI&lc=UgxDjoMo-7rl_03EWs54AaABAg): filtered/compressed recordings belong in validation; no universal claim that curves always survive filtering.
- [False-curve suggestion](https://www.youtube.com/watch?v=UytYrhYLOKI&lc=UgxGi9XVsxxMnSr1Ykp4AaABAg): test distractors and wrong-flight hypotheses; a visually plausible curve alone is insufficient evidence.

These are reviewed suggestions, not newly validated performance claims. The review sampled loaded top comments and the relevant creator replies; it was not an exhaustive review of all comments.

## Software license

The source in this standalone workflow bundle is MIT licensed (see LICENSE). NumPy and SciPy retain their own licenses. The software license does not relicense aircraft archives, the creator’s media, or user recordings.
