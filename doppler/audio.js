/** Browser-only signal processing. No uploads or external dependencies. */
const MAX_SAMPLES = 4_800_000;
const MAX_CELLS = 8_000_000;
const pause = () => new Promise(resolve => setTimeout(resolve, 0));
const finite = (value, name) => {
  if (typeof value !== 'number' || !Number.isFinite(value)) throw new Error(`${name} must be finite.`);
  return value;
};

// In-place forward radix-2 Cooley–Tukey transform with a reusable lookup plan.
function fftPlan(n) {
  const reversed = new Uint32Array(n);
  const bits = Math.log2(n);
  for (let i = 0; i < n; i++) {
    let source = i, target = 0;
    for (let j = 0; j < bits; j++) { target = (target << 1) | (source & 1); source >>>= 1; }
    reversed[i] = target;
  }
  const cosine = new Float64Array(n / 2), sine = new Float64Array(n / 2);
  for (let i = 0; i < n / 2; i++) {
    cosine[i] = Math.cos(-2 * Math.PI * i / n);
    sine[i] = Math.sin(-2 * Math.PI * i / n);
  }
  return (real, imag) => {
    for (let i = 0; i < n; i++) {
      const j = reversed[i];
      if (j > i) { const r = real[i], q = imag[i]; real[i] = real[j]; imag[i] = imag[j]; real[j] = r; imag[j] = q; }
    }
    for (let size = 2; size <= n; size *= 2) {
      const half = size / 2, stride = n / size;
      for (let base = 0; base < n; base += size) {
        for (let k = 0; k < half; k++) {
          const a = base + k, b = a + half, phase = k * stride;
          const tr = cosine[phase] * real[b] - sine[phase] * imag[b];
          const ti = sine[phase] * real[b] + cosine[phase] * imag[b];
          real[b] = real[a] - tr; imag[b] = imag[a] - ti;
          real[a] += tr; imag[a] += ti;
        }
      }
    }
  };
}

/** Hann-window PSD. Times mark window centres in the original recording.
 * Input should be resampled to 4 kHz by the caller's local audio decoder.
 * The actual window length rounds to the nearest power of two, documented in result.
 */
export async function computeSpectrogram(samples, sr, options = {}) {
  const {startS = 0, windowS = 2, hopS = .1, minHz = 40, maxHz = 500, onProgress} = options;
  for (const [name, value] of Object.entries({sr, startS, windowS, hopS, minHz, maxHz})) finite(value, name);
  if (!samples || !Number.isInteger(samples.length) || samples.length < 8 || samples.length > MAX_SAMPLES)
    throw new Error('Audio must contain 8 to 4,800,000 mono samples; select a shorter clip.');
  if (sr < 1000 || sr > 48000 || startS < 0 || windowS <= 0 || windowS > 16 || hopS <= 0 || hopS > windowS)
    throw new Error('Require 1–48 kHz audio, nonnegative start, and 0 < hop ≤ window ≤ 16 seconds.');
  if (minHz < 0 || maxHz <= minHz || maxHz > sr / 2) throw new Error('Frequency band must be within zero and Nyquist.');
  const n = 2 ** Math.round(Math.log2(windowS * sr));
  const hop = Math.round(hopS * sr);
  if (n < 8 || n > 65536 || hop < 1 || hop > n || samples.length < n)
    throw new Error('Invalid analysis window/hop, or audio is shorter than one complete window.');
  const frames = 1 + Math.floor((samples.length - n) / hop);
  const firstBin = Math.ceil(minHz * n / sr), lastBin = Math.floor(maxHz * n / sr);
  const bands = lastBin - firstBin + 1;
  if (bands < 2) throw new Error('Frequency band must contain at least two FFT bins.');
  if (bands * frames > MAX_CELLS || frames * n * Math.log2(n) > 350_000_000)
    throw new Error('Spectrogram exceeds browser processing limits; shorten the clip or increase hop size.');
  let minimum = Infinity, maximum = -Infinity;
  for (let i = 0; i < samples.length; i++) {
    const value = samples[i];
    if (!Number.isFinite(value)) throw new Error('Audio contains nonfinite samples.');
    minimum = Math.min(minimum, value); maximum = Math.max(maximum, value);
  }
  if (maximum - minimum <= 1e-10) throw new Error('Audio is silent or contains only a constant DC level.');
  const times = new Float64Array(frames), frequencies = new Float64Array(bands);
  const power = Array.from({length: bands}, () => new Float32Array(frames));
  const window = new Float64Array(n), real = new Float64Array(n), imag = new Float64Array(n);
  let windowEnergy = 0;
  for (let i = 0; i < n; i++) { window[i] = .5 - .5 * Math.cos(2 * Math.PI * i / n); windowEnergy += window[i] ** 2; }
  for (let k = 0; k < bands; k++) frequencies[k] = (firstBin + k) * sr / n;
  const fft = fftPlan(n), scale = 1 / (sr * windowEnergy);
  let lastYield = performance.now();
  onProgress?.(0);
  for (let frame = 0; frame < frames; frame++) {
    const offset = frame * hop;
    let mean = 0;
    for (let j = 0; j < n; j++) mean += samples[offset + j];
    mean /= n;
    for (let j = 0; j < n; j++) { real[j] = (samples[offset + j] - mean) * window[j]; imag[j] = 0; }
    fft(real, imag);
    for (let k = firstBin; k <= lastBin; k++) {
      const oneSided = (k === 0 || k === n / 2) ? 1 : 2;
      power[k - firstBin][frame] = 10 * Math.log10(Math.max(1e-30, (real[k] ** 2 + imag[k] ** 2) * scale * oneSided));
    }
    times[frame] = startS + (offset + n / 2) / sr;
    if (performance.now() - lastYield > 30) { onProgress?.((frame + 1) / frames); await pause(); lastYield = performance.now(); }
  }
  onProgress?.(1);
  return {times_s: times, frequencies_hz: frequencies, power_db: power,
    actual_window_s: n / sr, actual_hop_s: hop / sr, frequency_resolution_hz: sr / n,
    warnings: ['Window length rounded to a power of two; displayed timestamps are original recording window centres.']};
}

/** Semi-automatic continuous tonal path, not an aircraft classifier.
 * Synchronous and bounded; call inside a worker for larger analyses.
 * Interior local peaks receive independent quadratic interpolation of log power.
 * Anchors remain pinned to the nearest FFT bin; strength_db reports that bin.
 * This is an independent implementation of standard three-point interpolation.
 */
export function extractRidge(spec, options = {}) {
  const {startS, endS, minHz, maxHz, anchors = [], maxSlopeHzS = 20} = options;
  for (const [name, value] of Object.entries({startS, endS, minHz, maxHz, maxSlopeHzS})) finite(value, name);
  const times = spec?.times_s, frequencies = spec?.frequencies_hz, power = spec?.power_db;
  if (!times || !frequencies || times.length < 2 || frequencies.length < 2 || !Array.isArray(power) || power.length !== frequencies.length)
    throw new Error('Malformed spectrogram axes or power matrix.');
  const validateAxis = axis => {
    for (let i = 0; i < axis.length; i++) if (!Number.isFinite(axis[i]) || (i && axis[i] <= axis[i-1]))
      throw new Error('Spectrogram axes must be finite and strictly increasing.');
  };
  validateAxis(times); validateAxis(frequencies);
  if (times.length * frequencies.length > MAX_CELLS) throw new Error('Spectrogram exceeds ridge memory limit.');
  for (const row of power) if (!row || row.length !== times.length) throw new Error('Power matrix dimensions do not match axes.');
  if (startS < times[0] - 1e-8 || endS > times[times.length-1] + 1e-8 || endS <= startS)
    throw new Error('Selected times must lie inside spectrogram window-centre times.');
  if (minHz < frequencies[0] - 1e-8 || maxHz > frequencies[frequencies.length-1] + 1e-8 || maxHz <= minHz || maxSlopeHzS <= 0)
    throw new Error('Frequency bounds must lie inside the spectrogram and maximum slope must be positive.');
  const ti = [], fi = [];
  for (let i = 0; i < times.length; i++) if (times[i] >= startS - 1e-8 && times[i] <= endS + 1e-8) ti.push(i);
  for (let i = 0; i < frequencies.length; i++) if (frequencies[i] >= minHz - 1e-8 && frequencies[i] <= maxHz + 1e-8) fi.push(i);
  const nt = ti.length, nf = fi.length;
  if (nt < 2 || nf < 2 || nf > 65535) throw new Error('Select at least two time frames and two frequency bins.');
  const df = frequencies[fi[1]] - frequencies[fi[0]];
  for (let i = 1; i < nf; i++) if (Math.abs(frequencies[fi[i]] - frequencies[fi[i-1]] - df) > df * 1e-4)
    throw new Error('Frequency bins must be evenly spaced.');
  let maxDt = 0;
  for (let j = 1; j < nt; j++) maxDt = Math.max(maxDt, times[ti[j]]-times[ti[j-1]]);
  const maxStep = Math.min(nf-1, Math.floor(maxSlopeHzS * maxDt / df) + 1);
  if (nf * nt * (maxStep * 2 + 1) > 75_000_000)
    throw new Error('Ridge search exceeds browser limits; shorten the event, narrow the band or reduce maximum slope.');
  const nearest = (indices, axis, target) => {
    let best = 0;
    for (let i = 1; i < indices.length; i++) if (Math.abs(axis[indices[i]]-target) < Math.abs(axis[indices[best]]-target)) best = i;
    return best;
  };
  const fixed = new Map();
  if (!Array.isArray(anchors) || anchors.length > 1000) throw new Error('Anchors must be an array with at most 1,000 entries.');
  for (const anchor of anchors) {
    const at = finite(anchor.time_s, 'Anchor time'), af = finite(anchor.frequency_hz, 'Anchor frequency');
    if (at < startS || at > endS || af < minHz || af > maxHz) throw new Error('Anchor lies outside the selected time/frequency range.');
    const column = nearest(ti, times, at), row = nearest(fi, frequencies, af);
    if (fixed.has(column) && fixed.get(column) !== row) throw new Error('Conflicting anchors map to the same frame.');
    fixed.set(column, row);
  }
  const medians = new Float64Array(nt), scratch = new Float64Array(nf);
  let strongest = -Infinity;
  for (let column = 0; column < nt; column++) {
    for (let row = 0; row < nf; row++) {
      scratch[row] = power[fi[row]][ti[column]];
      if (!Number.isFinite(scratch[row])) throw new Error('Spectrogram contains nonfinite power values.');
    }
    scratch.sort();
    medians[column] = nf % 2 ? scratch[Math.floor(nf/2)] : (scratch[nf/2-1] + scratch[nf/2]) / 2;
    strongest = Math.max(strongest, scratch[nf-1]-medians[column]);
  }
  if (strongest < 3) throw new Error('No tonal contrast in the selected frequency band.');
  const reward = (row, column) => fixed.has(column) && fixed.get(column) !== row ? -Infinity :
    Math.max(-20, Math.min(1e6, power[fi[row]][ti[column]] - medians[column]));
  let previous = new Float64Array(nf), next = new Float64Array(nf);
  const back = new Uint16Array(nt * nf);
  for (let row = 0; row < nf; row++) previous[row] = reward(row, 0);
  for (let column = 1; column < nt; column++) {
    // A single bin of tolerance accounts for discretizing a continuous slope.
    const step = Math.min(nf-1, Math.floor(maxSlopeHzS * (times[ti[column]]-times[ti[column-1]]) / df) + 1);
    for (let row = 0; row < nf; row++) {
      let best = -Infinity, parent = row;
      for (let source = Math.max(0, row-step); source <= Math.min(nf-1, row+step); source++) {
        const score = previous[source] - .15 * Math.abs(row-source);
        if (score > best) { best = score; parent = source; }
      }
      next[row] = best + reward(row, column);
      back[column * nf + row] = parent;
    }
    [previous, next] = [next, previous];
  }
  let last = 0;
  for (let row = 1; row < nf; row++) if (previous[row] > previous[last]) last = row;
  if (!Number.isFinite(previous[last])) throw new Error('Anchors cannot be connected at the selected maximum slope.');
  const path = new Uint16Array(nt); path[nt-1] = last;
  for (let column = nt-1; column > 0; column--) path[column-1] = back[column*nf + path[column]];
  const outputTimes = new Float64Array(nt), outputFreq = new Float64Array(nt), strength = new Float32Array(nt);
  let edgeCount = 0;
  for (let column = 0; column < nt; column++) {
    outputTimes[column] = times[ti[column]]; outputFreq[column] = frequencies[fi[path[column]]];
    const row = path[column], frame = ti[column];
    // Vertex of the parabola through log-power samples at offsets -1, 0, +1.
    // Only refine actual local maxima; a continuity-selected flank is not a peak.
    if (!fixed.has(column) && row > 0 && row < nf-1) {
      const left = power[fi[row-1]][frame], centre = power[fi[row]][frame], right = power[fi[row+1]][frame];
      const curvature = left - 2*centre + right;
      if (centre >= left && centre >= right && curvature < -1e-10) {
        const shift = Math.max(-.5, Math.min(.5, .5*(left-right)/curvature));
        outputFreq[column] += shift * df;
      }
    }
    strength[column] = power[fi[path[column]]][ti[column]] - medians[column];
    if (path[column] === 0 || path[column] === nf-1) edgeCount++;
  }
  const warnings = ['Semi-automatic tonal trace; this does not identify an aircraft or establish location.'];
  if (fixed.size) warnings.push('Guide points snap to FFT bins; unpinned local peaks use sub-bin interpolation.');
  const sortedStrength = strength.slice().sort();
  if (sortedStrength[Math.floor(nt/2)] < 6) warnings.push('Weak tonal contrast; inspect the trace manually.');
  if (edgeCount / nt > .1) warnings.push('Trace touches frequency-band boundaries; consider widening the band.');
  return {times_s: outputTimes, frequencies_hz: outputFreq, strength_db: strength, warnings};
}
