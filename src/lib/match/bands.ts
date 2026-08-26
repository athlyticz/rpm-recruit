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

  /*
   * The value fell outside every published band. There are two different
   * reasons for that and they need different answers.
   *
   * Beyond either end of the scale, clamp to that end: a 95 mph fastball is
   * still a 10, and a 50 mph one is still a 1.
   *
   * In a gap between two bands, snap to the nearest band. Published ladders
   * have gaps (75-77 then 78-80), and a value of 77.5 belongs next to 77, not
   * at the top of the scale. The previous version compared distance to the
   * scale's outer edges instead, which sent every in-gap value to whichever
   * end happened to be closer: 77.08 mph reported as a 10. That put a score on
   * screen the player had not earned, which is the one thing this product
   * cannot do.
   */
  const sorted = [...bands].sort((a, b) => a.score - b.score);
  const lowest = sorted[0];
  const highest = sorted[sorted.length - 1];

  const lowerBound = lowest.min_value ?? lowest.max_value;
  const upperBound = highest.max_value ?? highest.min_value;

  if (lowerBound !== null && value < lowerBound) return lowest.score;
  if (upperBound !== null && value > upperBound) return highest.score;

  let nearest: { score: number; distance: number } | null = null;
  for (const band of sorted) {
    const edges = [band.min_value, band.max_value].filter(
      (v): v is number => v !== null
    );
    for (const edge of edges) {
      const distance = Math.abs(value - edge);
      if (!nearest || distance < nearest.distance) {
        nearest = { score: band.score, distance };
      }
    }
  }
  return nearest?.score ?? null;
}

/** The playable range of a banded metric, padded slightly past both ends. */
export function bandRange(
  bands: ScaleBandRow[],
  whole = false
): { min: number; max: number } {
  const edges = bands
    .flatMap((b) => [b.min_value, b.max_value])
    .filter((v): v is number => v !== null);
  const min = Math.min(...edges);
  const max = Math.max(...edges);
  const pad = (max - min) * 0.08;
  // Whole-number metrics get whole-number bounds. A fractional lower bound plus
  // a step of 1 produced fractional values that landed between bands.
  return whole
    ? { min: Math.floor(min - pad), max: Math.ceil(max + pad) }
    : { min: min - pad, max: max + pad };
}

/** Where each band starts, as a 0-1 position along the slider track. */
export function bandTicks(
  bands: ScaleBandRow[],
  whole = false
): { score: number; at: number }[] {
  const { min, max } = bandRange(bands, whole);
  const span = max - min || 1;
  return bands
    .map((b) => {
      const edge = b.min_value ?? b.max_value;
      if (edge === null) return null;
      return { score: b.score, at: (edge - min) / span };
    })
    .filter((t): t is { score: number; at: number } => t !== null);
}
