/**
 * Spectral processing utilities.
 *
 * Pure functions for common spectral data transformations:
 * - Baseline correction (rubber-band)
 * - Normalization (min-max, area, SNV)
 * - Smoothing (Savitzky-Golay)
 * - Numerical derivatives (1st, 2nd)
 *
 * All functions return new arrays, never mutating inputs.
 *
 * @module processing
 */

// ─── Baseline Correction ───────────────────────────────────────────

/**
 * Rubber-band baseline correction.
 *
 * Computes the convex hull of the spectrum from below, then subtracts
 * the interpolated baseline. This is a simple, robust method for
 * removing broad fluorescence backgrounds.
 *
 * @param y - Input Y values
 * @returns Baseline-corrected Y values
 */
export function baselineRubberBand(y: Float64Array | number[]): Float64Array {
  const n = y.length;
  if (n < 3) return new Float64Array(y);

  // Find convex hull from below (lower envelope)
  const hullIndices: number[] = [0];
  for (let i = 1; i < n; i++) {
    while (hullIndices.length >= 2) {
      const j = hullIndices.length - 1;
      const a = hullIndices[j - 1];
      const b = hullIndices[j];
      // Cross product test: for lower hull, pop if b is above line a→i
      const cross =
        (i - a) * ((y[b] as number) - (y[a] as number)) -
        (b - a) * ((y[i] as number) - (y[a] as number));
      if (cross >= 0) {
        hullIndices.pop();
      } else {
        break;
      }
    }
    hullIndices.push(i);
  }

  // Interpolate baseline from hull
  const baseline = new Float64Array(n);
  let hi = 0;
  for (let i = 0; i < n; i++) {
    while (hi < hullIndices.length - 1 && hullIndices[hi + 1] <= i) {
      hi++;
    }
    if (hi >= hullIndices.length - 1) {
      baseline[i] = y[hullIndices[hullIndices.length - 1]] as number;
    } else {
      const a = hullIndices[hi];
      const b = hullIndices[hi + 1];
      const t = (i - a) / (b - a);
      baseline[i] =
        (y[a] as number) * (1 - t) + (y[b] as number) * t;
    }
  }

  // Subtract baseline
  const result = new Float64Array(n);
  for (let i = 0; i < n; i++) {
    result[i] = (y[i] as number) - baseline[i];
  }
  return result;
}

// ─── Normalization ─────────────────────────────────────────────────

/**
 * Min-max normalization to [0, 1] range.
 */
export function normalizeMinMax(y: Float64Array | number[]): Float64Array {
  const n = y.length;
  const result = new Float64Array(n);
  let min = Infinity;
  let max = -Infinity;

  for (let i = 0; i < n; i++) {
    const v = y[i] as number;
    if (v < min) min = v;
    if (v > max) max = v;
  }

  const range = max - min;
  if (range === 0) return result; // all zeros

  for (let i = 0; i < n; i++) {
    result[i] = ((y[i] as number) - min) / range;
  }
  return result;
}

/**
 * Area normalization: divide by total area under the curve.
 *
 * Uses trapezoidal integration. The resulting spectrum has unit area.
 */
export function normalizeArea(
  x: Float64Array | number[],
  y: Float64Array | number[],
): Float64Array {
  const n = Math.min(x.length, y.length);
  if (n < 2) return new Float64Array(y);

  // Trapezoidal area
  let area = 0;
  for (let i = 1; i < n; i++) {
    area +=
      Math.abs((x[i] as number) - (x[i - 1] as number)) *
      (Math.abs(y[i] as number) + Math.abs(y[i - 1] as number)) *
      0.5;
  }

  if (area === 0) return new Float64Array(y);

  const result = new Float64Array(n);
  for (let i = 0; i < n; i++) {
    result[i] = (y[i] as number) / area;
  }
  return result;
}

/**
 * Standard Normal Variate (SNV) normalization.
 *
 * Centers the spectrum by subtracting the mean, then divides by
 * the standard deviation. Common in chemometrics.
 */
export function normalizeSNV(y: Float64Array | number[]): Float64Array {
  const n = y.length;
  if (n === 0) return new Float64Array(0);

  let sum = 0;
  for (let i = 0; i < n; i++) {
    sum += y[i] as number;
  }
  const mean = sum / n;

  let variance = 0;
  for (let i = 0; i < n; i++) {
    const d = (y[i] as number) - mean;
    variance += d * d;
  }
  const std = Math.sqrt(variance / n);

  if (std === 0) return new Float64Array(n);

  const result = new Float64Array(n);
  for (let i = 0; i < n; i++) {
    result[i] = ((y[i] as number) - mean) / std;
  }
  return result;
}

// ─── Smoothing ─────────────────────────────────────────────────────

/**
 * Savitzky-Golay smoothing (polynomial order 2).
 *
 * Uses pre-computed convolution coefficients for common window sizes.
 * Falls back to a simple moving average for unsupported window sizes.
 *
 * @param y - Input Y values
 * @param windowSize - Must be odd and >= 3. Defaults to 5.
 * @returns Smoothed Y values
 */
export function smoothSavitzkyGolay(
  y: Float64Array | number[],
  windowSize = 5,
): Float64Array {
  const n = y.length;
  if (n < windowSize || windowSize < 3) return new Float64Array(y);

  // Ensure odd window
  const w = windowSize % 2 === 0 ? windowSize + 1 : windowSize;
  const halfW = (w - 1) / 2;

  // Pre-computed SG coefficients (quadratic, normalized)
  const coefficients = getSGCoefficients(w);

  const result = new Float64Array(n);

  // Copy edges unchanged
  for (let i = 0; i < halfW; i++) {
    result[i] = y[i] as number;
    result[n - 1 - i] = y[n - 1 - i] as number;
  }

  // Apply convolution
  for (let i = halfW; i < n - halfW; i++) {
    let sum = 0;
    for (let j = -halfW; j <= halfW; j++) {
      sum += coefficients[j + halfW] * (y[i + j] as number);
    }
    result[i] = sum;
  }

  return result;
}

/**
 * Get Savitzky-Golay coefficients for quadratic polynomial smoothing.
 */
function getSGCoefficients(windowSize: number): number[] {
  // Pre-computed for common sizes (quadratic smoothing)
  const precomputed: Record<number, number[]> = {
    5: [-3, 12, 17, 12, -3].map((v) => v / 35),
    7: [-2, 3, 6, 7, 6, 3, -2].map((v) => v / 21),
    9: [-21, 14, 39, 54, 59, 54, 39, 14, -21].map((v) => v / 231),
    11: [-36, 9, 44, 69, 84, 89, 84, 69, 44, 9, -36].map((v) => v / 429),
  };

  if (precomputed[windowSize]) {
    return precomputed[windowSize];
  }

  // Fallback: uniform weights (simple moving average)
  return Array(windowSize).fill(1 / windowSize);
}

// ─── Derivatives ───────────────────────────────────────────────────

/**
 * First derivative using central differences.
 *
 * @param x - X values (for spacing)
 * @param y - Y values
 * @returns First derivative dy/dx
 */
export function derivative1st(
  x: Float64Array | number[],
  y: Float64Array | number[],
): Float64Array {
  const n = Math.min(x.length, y.length);
  if (n < 2) return new Float64Array(n);

  const result = new Float64Array(n);

  // Forward difference for first point
  result[0] =
    ((y[1] as number) - (y[0] as number)) /
    ((x[1] as number) - (x[0] as number));

  // Central differences for interior
  for (let i = 1; i < n - 1; i++) {
    result[i] =
      ((y[i + 1] as number) - (y[i - 1] as number)) /
      ((x[i + 1] as number) - (x[i - 1] as number));
  }

  // Backward difference for last point
  result[n - 1] =
    ((y[n - 1] as number) - (y[n - 2] as number)) /
    ((x[n - 1] as number) - (x[n - 2] as number));

  return result;
}

/**
 * Second derivative using central differences.
 *
 * @param x - X values (for spacing)
 * @param y - Y values
 * @returns Second derivative d²y/dx²
 */
export function derivative2nd(
  x: Float64Array | number[],
  y: Float64Array | number[],
): Float64Array {
  const n = Math.min(x.length, y.length);
  if (n < 3) return new Float64Array(n);

  const result = new Float64Array(n);

  // Interior points using central difference
  for (let i = 1; i < n - 1; i++) {
    const dx1 = (x[i] as number) - (x[i - 1] as number);
    const dx2 = (x[i + 1] as number) - (x[i] as number);
    const dxAvg = (dx1 + dx2) / 2;
    result[i] =
      ((y[i + 1] as number) - 2 * (y[i] as number) + (y[i - 1] as number)) /
      (dxAvg * dxAvg);
  }

  // Copy boundary values from nearest interior
  result[0] = result[1];
  result[n - 1] = result[n - 2];

  return result;
}
