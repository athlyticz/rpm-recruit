import type { ScaleBandRow } from "@/lib/data/player";

/**
 * Translate a raw measurable into its 1-10 score using the published bands.
 *
 * Bands are the mapping that makes "add 3 mph" answerable: a value either
 * falls inside a published band or it sits beyond the ends of the scale. No
 * interpolation happens between bands, because the ladder is defined in steps
 * and inventing fractional scores between them would be inventing precision.
 */
export function scoreFromBands(value: number, bands: ScaleBandRow[]): number | null {
  if (bands.length === 0) return null;

  for (const band of bands) {
    const aboveMin = band.min_value === null || value >= band.min_value;
    const belowMax = band.max_value === null || value <= band.max_value;
    if (aboveMin && belowMax) return band.score;
  }

  // Past either end of the published scale, clamp to the nearest end rather
  // than reporting nothing: a 95 mph fastball is still a 10.
  const sorted = [...bands].sort((a, b) => a.score - b.score);
  const lowest = sorted[0];
  const highest = sorted[sorted.length - 1];
  const lowEdge = lowest.max_value ?? lowest.min_value;
  const highEdge = highest.min_value ?? highest.max_value;
  if (lowEdge !== null && highEdge !== null) {
    return Math.abs(value - lowEdge) < Math.abs(value - highEdge)
      ? lowest.score
      : highest.score;
  }
  return null;
}

/** The playable range of a banded metric, padded slightly past both ends. */
export function bandRange(bands: ScaleBandRow[]): { min: number; max: number } {
  const edges = bands
    .flatMap((b) => [b.min_value, b.max_value])
    .filter((v): v is number => v !== null);
  const min = Math.min(...edges);
  const max = Math.max(...edges);
  const pad = (max - min) * 0.08;
  return { min: min - pad, max: max + pad };
}

/** Where each band starts, as a 0-1 position along the slider track. */
export function bandTicks(bands: ScaleBandRow[]): { score: number; at: number }[] {
  const { min, max } = bandRange(bands);
  const span = max - min || 1;
  return bands
    .map((b) => {
      const edge = b.min_value ?? b.max_value;
      if (edge === null) return null;
      return { score: b.score, at: (edge - min) / span };
    })
    .filter((t): t is { score: number; at: number } => t !== null);
}
