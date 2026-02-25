/**
 * Largest-Triangle-Three-Buckets (LTTB) downsampling algorithm.
 *
 * LTTB produces visually superior downsampled representations compared to
 * simple min-max binning. It works by dividing data into buckets and
 * selecting the point in each bucket that forms the largest triangle with
 * the selected points in adjacent buckets.
 *
 * Reference: Sveinn Steinarsson, "Downsampling Time Series for Visual
 * Representation" (2013).
 *
 * @module lttb
 */

/** A downsampled point with its original index. */
export interface LTTBPoint {
  /** Pixel x coordinate. */
  px: number;
  /** Pixel y coordinate. */
  py: number;
  /** Original index in the source arrays. */
  index: number;
}

/**
 * Downsample data using the LTTB algorithm.
 *
 * @param x - Source x-values
 * @param y - Source y-values
 * @param startIdx - Start index (inclusive) in the source arrays
 * @param endIdx - End index (exclusive) in the source arrays
 * @param xScale - Function mapping data x to pixel x
 * @param yScale - Function mapping data y to pixel y
 * @param targetCount - Desired number of output points
 * @returns Array of downsampled points
 */
export function lttbDownsample(
  x: Float64Array | number[],
  y: Float64Array | number[],
  startIdx: number,
  endIdx: number,
  xScale: (v: number) => number,
  yScale: (v: number) => number,
  targetCount: number,
): LTTBPoint[] {
  const n = endIdx - startIdx;

  // If fewer points than target, return all
  if (n <= targetCount) {
    const result: LTTBPoint[] = [];
    for (let i = startIdx; i < endIdx; i++) {
      result.push({
        px: xScale(x[i] as number),
        py: yScale(y[i] as number),
        index: i,
      });
    }
    return result;
  }

  // Always include first and last points
  const result: LTTBPoint[] = [];
  result.push({
    px: xScale(x[startIdx] as number),
    py: yScale(y[startIdx] as number),
    index: startIdx,
  });

  // Number of buckets (excluding first and last points)
  const bucketCount = targetCount - 2;
  const bucketSize = (n - 2) / bucketCount;

  let prevSelectedIdx = startIdx;

  for (let bucket = 0; bucket < bucketCount; bucket++) {
    // Current bucket range
    const bucketStart = startIdx + 1 + Math.floor(bucket * bucketSize);
    const bucketEnd = startIdx + 1 + Math.min(
      Math.floor((bucket + 1) * bucketSize),
      n - 2,
    );

    // Next bucket average (used as the third vertex of the triangle)
    const nextBucketStart = bucketEnd;
    const nextBucketEnd = startIdx + 1 + Math.min(
      Math.floor((bucket + 2) * bucketSize),
      n - 2,
    );
    // For the last bucket, use the last data point as the average
    let avgX: number;
    let avgY: number;

    if (bucket === bucketCount - 1) {
      avgX = xScale(x[endIdx - 1] as number);
      avgY = yScale(y[endIdx - 1] as number);
    } else {
      avgX = 0;
      avgY = 0;
      const avgCount = nextBucketEnd - nextBucketStart;
      for (let i = nextBucketStart; i < nextBucketEnd; i++) {
        avgX += xScale(x[i] as number);
        avgY += yScale(y[i] as number);
      }
      if (avgCount > 0) {
        avgX /= avgCount;
        avgY /= avgCount;
      }
    }

    // Previous selected point (first vertex)
    const prevPx = xScale(x[prevSelectedIdx] as number);
    const prevPy = yScale(y[prevSelectedIdx] as number);

    // Find point in current bucket with maximum triangle area
    let maxArea = -1;
    let bestIdx = bucketStart;

    for (let i = bucketStart; i < bucketEnd; i++) {
      const px = xScale(x[i] as number);
      const py = yScale(y[i] as number);

      // Triangle area (using cross product formula, no /2 needed for comparison)
      const area = Math.abs(
        (prevPx - avgX) * (py - prevPy) -
        (prevPx - px) * (avgY - prevPy),
      );

      if (area > maxArea) {
        maxArea = area;
        bestIdx = i;
      }
    }

    result.push({
      px: xScale(x[bestIdx] as number),
      py: yScale(y[bestIdx] as number),
      index: bestIdx,
    });
    prevSelectedIdx = bestIdx;
  }

  // Add last point
  result.push({
    px: xScale(x[endIdx - 1] as number),
    py: yScale(y[endIdx - 1] as number),
    index: endIdx - 1,
  });

  return result;
}
