/**
 * Interim match scorer.
 *
 * This is NOT the Phase 3 engine. It exists so the flagship screen shows real
 * component contributions computed from real seeded columns rather than a
 * fabricated breakdown over the legacy if/else heuristic.
 *
 * It follows the CLAUDE.md Match Engine Direction rules that apply now:
 *   - No floors. A bad fit scores badly.
 *   - Every number is explainable: each component returns its own score, its
 *     weight, and a sentence the UI can show.
 *   - A component with missing inputs is marked unavailable rather than
 *     guessed at, and the total is renormalised over what is actually known.
 *
 * The Phase 3 engine replaces the internals and keeps this shape.
 */

import type { Database } from "@/types/database";

export const INTERIM_ENGINE_VERSION = "interim-0.1";

/** A program is "in range" once the interim scorer puts it at Realistic. */
export const IN_RANGE_THRESHOLD = 65;

type College = Database["public"]["Tables"]["colleges"]["Row"];
type Player = Database["public"]["Tables"]["players"]["Row"];

export type ComponentKey =
  | "athletic"
  | "academic"
  | "cost"
  | "major"
  | "geography";

export interface ScoreComponent {
  key: ComponentKey;
  label: string;
  /** Share of the total this component carries when available. */
  weight: number;
  /** 0-100, or null when the inputs to compute it are missing. */
  score: number | null;
  /**
   * The weight actually applied, after renormalising over the components that
   * could be computed. Equal to `weight` when nothing is missing. This is the
   * number the UI must show and draw with, so what is on screen multiplies out.
   */
  effectiveWeight?: number;
  /** Points this component contributed to the final score. */
  contribution: number;
  /** Plain sentence the UI renders under the component bar. */
  explanation: string;
}

export interface MatchResult {
  college: College;
  /** 0-100. Null only if nothing at all could be computed. */
  score: number | null;
  components: ScoreComponent[];
  /** Components that could not be computed, by label. */
  missing: string[];
  engineVersion: string;
}

const WEIGHTS: Record<ComponentKey, number> = {
  athletic: 0.4,
  academic: 0.25,
  cost: 0.15,
  major: 0.1,
  geography: 0.1,
};

const LABELS: Record<ComponentKey, string> = {
  athletic: "Athletic projection",
  academic: "Academic fit",
  cost: "Cost fit",
  major: "Major overlap",
  geography: "Geography",
};

/** Northeast adjacency for the launch market. Stand-in until lat/lon land. */
const NEIGHBOURS: Record<string, string[]> = {
  NJ: ["PA", "NY", "DE", "MD", "CT"],
  PA: ["NJ", "NY", "DE", "MD", "OH", "WV"],
  DE: ["NJ", "PA", "MD"],
  NY: ["NJ", "PA", "CT", "MA", "VT"],
  MD: ["PA", "DE", "VA", "WV"],
};

function clamp(value: number, min = 0, max = 100): number {
  return Math.min(Math.max(value, min), max);
}

/** Pull a two-letter state out of a free-text "Sewell, NJ". */
export function parseState(cityState: string | null): string | null {
  if (!cityState) return null;
  const match = /,\s*([A-Za-z]{2})\s*$/.exec(cityState.trim());
  return match ? match[1].toUpperCase() : null;
}

/**
 * Athletic projection against the division's expected band.
 *
 * The Scanzano ladder already encodes what each rating means: 9-10 is Division
 * I, 7-8 is lower Division I, 6 is D2/D3. Scoring is the distance between the
 * player's rating and the band the division expects, penalised in both
 * directions but far harder for being under it.
 */
const DIVISION_BANDS: Record<string, [number, number]> = {
  d1: [8, 10],
  d2: [6, 8],
  d3: [5, 7],
  naia: [5, 7],
  njcaa: [4, 7],
};

function scoreAthletic(player: Player, college: College): ScoreComponent {
  const rating = player.overall_score;
  const band = DIVISION_BANDS[college.division];

  if (rating === null || !band) {
    return {
      key: "athletic",
      label: LABELS.athletic,
      weight: WEIGHTS.athletic,
      score: null,
      contribution: 0,
      explanation:
        "No evaluation on file yet. Rate your position skills to include athletic projection, which carries the most weight of any component.",
    };
  }

  const [low, high] = band;
  let score: number;
  let explanation: string;

  if (rating >= low && rating <= high) {
    score = 100;
    explanation = `Your ${rating.toFixed(1)} rating sits inside the ${college.division.toUpperCase()} band of ${low} to ${high}.`;
  } else if (rating > high) {
    // Overqualified is still a fit, just not the best use of the player.
    score = clamp(100 - (rating - high) * 12);
    explanation = `Your ${rating.toFixed(1)} rating is above the ${college.division.toUpperCase()} band of ${low} to ${high}. You project higher.`;
  } else {
    // Under the band falls off hard. This is the honest part.
    score = clamp(100 - (low - rating) * 28);
    explanation = `Your ${rating.toFixed(1)} rating is below the ${college.division.toUpperCase()} band of ${low} to ${high}. Closing that gap is what moves this program into range.`;
  }

  return {
    key: "athletic",
    label: LABELS.athletic,
    weight: WEIGHTS.athletic,
    score,
    contribution: 0,
    explanation,
  };
}

function scoreAcademic(player: Player, college: College): ScoreComponent {
  const sat = player.sat_score;
  const low = college.sat_25;
  const high = college.sat_75;

  if (sat === null || low === null || high === null) {
    return {
      key: "academic",
      label: LABELS.academic,
      weight: WEIGHTS.academic,
      score: null,
      contribution: 0,
      explanation:
        sat === null
          ? "Add your SAT score to score academic fit against this program's admitted band."
          : "This program has no published SAT band in our data yet.",
    };
  }

  let score: number;
  let explanation: string;

  if (sat >= high) {
    score = 100;
    explanation = `Your ${sat} is at or above the 75th percentile of ${high}. Academically comfortable.`;
  } else if (sat >= low) {
    const position = (sat - low) / Math.max(high - low, 1);
    score = 72 + position * 26;
    explanation = `Your ${sat} sits inside the admitted band of ${low} to ${high}.`;
  } else {
    const shortfall = low - sat;
    score = clamp(72 - shortfall * 0.45);
    explanation = `Your ${sat} is ${shortfall} points below the 25th percentile of ${low}. Admission is the constraint here, not baseball.`;
  }

  return {
    key: "academic",
    label: LABELS.academic,
    weight: WEIGHTS.academic,
    score,
    contribution: 0,
    explanation,
  };
}

/**
 * Cost fit on net price after aid, per the CLAUDE.md rule. Scored on an
 * absolute affordability curve rather than against a player budget, which we
 * do not collect yet.
 */
function scoreCost(college: College): ScoreComponent {
  const net = college.net_price_avg;

  if (net === null) {
    return {
      key: "cost",
      label: LABELS.cost,
      weight: WEIGHTS.cost,
      score: null,
      contribution: 0,
      explanation: "No net price on file for this program yet.",
    };
  }

  // $10k or less scores full; $45k or more scores zero; linear between.
  const score = clamp(100 - ((net - 10000) / 35000) * 100);
  const formatted = `$${net.toLocaleString()}`;

  const explanation =
    college.is_public === true
      ? `${formatted} average net price after aid. Public program, so an out-of-state student may pay more than this figure.`
      : `${formatted} average net price after aid.`;

  return {
    key: "cost",
    label: LABELS.cost,
    weight: WEIGHTS.cost,
    score,
    contribution: 0,
    explanation,
  };
}

function scoreMajor(player: Player, college: College): ScoreComponent {
  const wanted = player.majors ?? [];
  const offered = college.majors ?? [];

  if (wanted.length === 0) {
    return {
      key: "major",
      label: LABELS.major,
      weight: WEIGHTS.major,
      score: null,
      contribution: 0,
      explanation:
        "Pick your intended majors on the Academics page to score academic-program overlap.",
    };
  }

  if (offered.length === 0) {
    return {
      key: "major",
      label: LABELS.major,
      weight: WEIGHTS.major,
      score: null,
      contribution: 0,
      explanation: "No program list on file for this school yet.",
    };
  }

  const matched = wanted.filter((m) => offered.includes(m));
  const score = (matched.length / wanted.length) * 100;

  const explanation =
    matched.length === 0
      ? `None of your intended majors appear in this program's listed offerings.`
      : `Offers ${matched.length} of your ${wanted.length} intended majors: ${matched.join(", ")}.`;

  return {
    key: "major",
    label: LABELS.major,
    weight: WEIGHTS.major,
    score,
    contribution: 0,
    explanation,
  };
}

function scoreGeography(player: Player, college: College): ScoreComponent {
  const home = parseState(player.city_state);

  if (!home) {
    return {
      key: "geography",
      label: LABELS.geography,
      weight: WEIGHTS.geography,
      score: null,
      contribution: 0,
      explanation:
        "Add your city and state to score travel distance for family attendance.",
    };
  }

  let score: number;
  let explanation: string;

  if (home === college.state) {
    score = 100;
    explanation = `In your home state. Family can see you play without travel.`;
  } else if ((NEIGHBOURS[home] ?? []).includes(college.state)) {
    score = 75;
    explanation = `${college.state} borders your home state. Reachable for a weekend series.`;
  } else {
    score = 30;
    explanation = `${college.state} is outside your home region. Factor travel into visits and family attendance.`;
  }

  return {
    key: "geography",
    label: LABELS.geography,
    weight: WEIGHTS.geography,
    score,
    contribution: 0,
    explanation,
  };
}

export function scoreMatch(player: Player, college: College): MatchResult {
  const components = [
    scoreAthletic(player, college),
    scoreAcademic(player, college),
    scoreCost(college),
    scoreMajor(player, college),
    scoreGeography(player, college),
  ];

  const available = components.filter((c) => c.score !== null);
  const totalWeight = available.reduce((sum, c) => sum + c.weight, 0);

  if (totalWeight === 0) {
    return {
      college,
      score: null,
      components,
      missing: components.map((c) => c.label),
      engineVersion: INTERIM_ENGINE_VERSION,
    };
  }

  // Renormalise over what is known, so a missing component does not silently
  // drag every school toward zero.
  let total = 0;
  for (const component of components) {
    if (component.score === null) {
      component.effectiveWeight = 0;
      continue;
    }
    /*
     * The component score is rounded before it is weighted, for the same reason
     * the total is rounded below: the UI prints 61, so 61 is what has to
     * multiply out. Leaving 60.8 underneath meant the breakdown showed a
     * player 61 and 24.3 points at a 40% weighting, and those two numbers do
     * not agree on any calculator they own.
     */
    component.score = Math.round(component.score);
    component.effectiveWeight = component.weight / totalWeight;
    component.contribution = component.score * component.effectiveWeight;
    total += component.contribution;
  }

  return {
    college,
    // Whole numbers on purpose. The score is displayed as an integer, so it is
    // stored as one: keeping a hidden decimal would let two programs that both
    // read 80 rank differently on a digit the player never sees. Precision the
    // reader cannot inspect is precision we cannot defend, and it would turn a
    // real tie into a manufactured winner.
    score: Math.round(total),
    components,
    missing: components.filter((c) => c.score === null).map((c) => c.label),
    engineVersion: INTERIM_ENGINE_VERSION,
  };
}

/**
 * How rows that score the same are ordered on screen.
 *
 * Ties are real and are shown as ties. We do not reach for hidden decimal
 * places to manufacture a winner, because a distinction the player cannot see
 * is a distinction we cannot defend. Equal scores share a rank, and the only
 * thing separating them in the list is alphabetical order, which the UI names
 * out loud rather than leaving the reader to guess.
 */
export const TIE_BREAK_LABEL = "listed alphabetically";

export interface RankedMatch extends MatchResult {
  /** Dense rank. Equal scores share the same number. */
  rank: number;
  /** True when at least one other program shares this exact score. */
  tied: boolean;
}

export function scoreAll(player: Player, colleges: College[]): MatchResult[] {
  return colleges
    .map((college) => scoreMatch(player, college))
    .sort(
      (a, b) =>
        (b.score ?? -1) - (a.score ?? -1) ||
        // The named tie-break. Nothing hidden happens here.
        a.college.name.localeCompare(b.college.name)
    );
}

/** Assigns dense ranks, so two programs on 80 are both rank 1 and the next is 2. */
export function rankMatches(results: MatchResult[]): RankedMatch[] {
  const counts = new Map<number | null, number>();
  for (const r of results) {
    counts.set(r.score, (counts.get(r.score) ?? 0) + 1);
  }

  let rank = 0;
  let previousScore: number | null | undefined;

  return results.map((result) => {
    if (result.score !== previousScore) {
      rank += 1;
      previousScore = result.score;
    }
    return {
      ...result,
      rank,
      tied: (counts.get(result.score) ?? 0) > 1,
    };
  });
}
