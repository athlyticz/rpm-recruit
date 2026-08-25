/**
 * Progression: gamification that serves honesty.
 *
 * The rule this file exists to enforce is that every number a player sees
 * traces to a database row. There are no streaks, no points, no login rewards
 * and no invented urgency. What a player advances through here is real
 * completeness, real verification, and real programs entering range.
 */

import type { Player, College, Metric, ChecklistItem } from "@/lib/data/player";
import { scoreAll } from "@/lib/match/interim-scorer";
import type { Database } from "@/types/database";

type VerificationStatus = Database["public"]["Enums"]["verification_status"];

/* ------------------------------------------------------------------ */
/*  Verification as status                                             */
/* ------------------------------------------------------------------ */

export const VERIFICATION_RANKS: {
  status: VerificationStatus;
  label: string;
  short: string;
  blurb: string;
}[] = [
  {
    status: "self_reported",
    label: "Self reported",
    short: "Self",
    blurb: "You entered it. Coaches discount it, and they should.",
  },
  {
    status: "coach_verified",
    label: "Coach verified",
    short: "Coach",
    blurb: "A coach stood behind the number. It starts to carry weight.",
  },
  {
    status: "event_verified",
    label: "Event verified",
    short: "Event",
    blurb: "Measured at a showcase or by PBR or Perfect Game. This is the standard.",
  },
];

export function rankOf(status: VerificationStatus): number {
  return VERIFICATION_RANKS.findIndex((r) => r.status === status);
}

export interface VerificationMix {
  total: number;
  selfReported: number;
  coachVerified: number;
  eventVerified: number;
  /** 0-1. Event-verified counts full, coach half, self nothing. */
  credibility: number;
}

export function verificationMix(metrics: Metric[]): VerificationMix {
  const selfReported = metrics.filter((m) => m.verification_status === "self_reported").length;
  const coachVerified = metrics.filter((m) => m.verification_status === "coach_verified").length;
  const eventVerified = metrics.filter((m) => m.verification_status === "event_verified").length;
  const total = metrics.length;

  const credibility =
    total === 0 ? 0 : (eventVerified + coachVerified * 0.5) / total;

  return { total, selfReported, coachVerified, eventVerified, credibility };
}

/* ------------------------------------------------------------------ */
/*  Profile strength                                                   */
/* ------------------------------------------------------------------ */

export interface StrengthFactor {
  label: string;
  /** 0-1 */
  value: number;
  weight: number;
  detail: string;
}

export interface ProfileStrength {
  /** 0-100 */
  score: number;
  factors: StrengthFactor[];
  /** The single weakest factor with room to move. */
  weakest: StrengthFactor | null;
}

const IDENTITY_FIELDS: (keyof Player)[] = [
  "first_name",
  "last_name",
  "position",
  "grad_year",
  "high_school",
  "city_state",
  "height_inches",
  "weight_lbs",
  "bats",
  "throws",
];

const ACADEMIC_FIELDS: (keyof Player)[] = ["gpa", "sat_score", "act_score"];

export function profileStrength(
  player: Player | null,
  metrics: Metric[]
): ProfileStrength {
  if (!player) {
    return {
      score: 0,
      factors: [],
      weakest: null,
    };
  }

  const filled = (fields: (keyof Player)[]) =>
    fields.filter((f) => {
      const v = player[f];
      return v !== null && v !== undefined && v !== "";
    }).length;

  const identityFilled = filled(IDENTITY_FIELDS);
  const academicFilled = filled(ACADEMIC_FIELDS);
  const majors = player.majors ?? [];
  const mix = verificationMix(metrics);

  const factors: StrengthFactor[] = [
    {
      label: "Player identity",
      value: identityFilled / IDENTITY_FIELDS.length,
      weight: 0.25,
      detail: `${identityFilled} of ${IDENTITY_FIELDS.length} profile fields complete`,
    },
    {
      label: "Academics",
      value: academicFilled / ACADEMIC_FIELDS.length,
      weight: 0.2,
      detail: `${academicFilled} of ${ACADEMIC_FIELDS.length} academic fields complete`,
    },
    {
      label: "Intended majors",
      value: majors.length > 0 ? 1 : 0,
      weight: 0.05,
      detail: majors.length > 0 ? `${majors.length} selected` : "None selected",
    },
    {
      label: "Evaluation",
      value: player.overall_score !== null ? 1 : 0,
      weight: 0.2,
      detail:
        player.overall_score !== null
          ? `Rated ${player.overall_score.toFixed(1)} on the showcase scale`
          : "No position scores entered",
    },
    {
      label: "Measurables",
      value: Math.min(mix.total / 6, 1),
      weight: 0.15,
      detail: `${mix.total} measurement${mix.total === 1 ? "" : "s"} on file`,
    },
    {
      label: "Verification",
      value: mix.credibility,
      weight: 0.15,
      detail:
        mix.total === 0
          ? "Nothing to verify yet"
          : `${mix.eventVerified} event verified, ${mix.coachVerified} coach verified of ${mix.total}`,
    },
  ];

  const score =
    factors.reduce((sum, f) => sum + f.value * f.weight, 0) * 100;

  const improvable = factors
    .filter((f) => f.value < 1)
    .sort((a, b) => (b.weight * (1 - b.value)) - (a.weight * (1 - a.value)));

  return {
    score: Math.round(score),
    factors,
    weakest: improvable[0] ?? null,
  };
}

/* ------------------------------------------------------------------ */
/*  Recruiting readiness stages                                        */
/* ------------------------------------------------------------------ */

export interface ReadinessStage {
  key: string;
  name: string;
  requirement: string;
}

/**
 * Named stages a player advances through, not points. Each stage has a real
 * requirement checked against real rows.
 */
export const READINESS_STAGES: ReadinessStage[] = [
  { key: "profile", name: "Profile Started", requirement: "Player identity on file" },
  { key: "measured", name: "Measured", requirement: "Measurables recorded" },
  { key: "evaluated", name: "Evaluated", requirement: "Position scores complete" },
  { key: "verified", name: "Verified", requirement: "A measurable confirmed by a coach or event" },
  { key: "contacting", name: "Contacting Programs", requirement: "Outreach checklist underway" },
];

export interface ReadinessState {
  /** Index into READINESS_STAGES of the highest stage reached. */
  reachedIndex: number;
  current: ReadinessStage;
  next: ReadinessStage | null;
  /** Why the next stage is not reached yet. */
  nextRequirement: string | null;
  gradYear: number | null;
}

export function readinessStage(
  player: Player | null,
  metrics: Metric[],
  checklist: ChecklistItem[]
): ReadinessState {
  const mix = verificationMix(metrics);
  const identityComplete =
    player !== null &&
    IDENTITY_FIELDS.filter((f) => player[f] !== null && player[f] !== "").length >= 6;

  const reached = [
    identityComplete,
    metrics.length > 0,
    player?.overall_score !== null && player?.overall_score !== undefined,
    mix.coachVerified + mix.eventVerified > 0,
    checklist.some((c) => c.is_complete),
  ];

  let reachedIndex = -1;
  for (let i = 0; i < reached.length; i++) {
    if (reached[i]) reachedIndex = i;
    else break;
  }

  const current = READINESS_STAGES[Math.max(reachedIndex, 0)];
  const next = reachedIndex + 1 < READINESS_STAGES.length ? READINESS_STAGES[reachedIndex + 1] : null;

  return {
    reachedIndex,
    current,
    next,
    nextRequirement: next ? next.requirement : null,
    gradYear: player?.grad_year ?? null,
  };
}

/* ------------------------------------------------------------------ */
/*  Next tier                                                          */
/* ------------------------------------------------------------------ */

export interface TierLever {
  /** Human sentence: "Add 0.5 to your showcase rating". */
  action: string;
  /** "12 more D2 programs enter range". */
  effect: string;
  level: string;
  programsGained: number;
  /** The effect rests on an assumed input, which the action sentence states. */
  assumed: boolean;
  /** Where the player goes to act on it. */
  href: string;
}

/** A program is "in range" once the interim scorer puts it at Realistic or better. */
const IN_RANGE_THRESHOLD = 65;

function countInRange(player: Player, colleges: College[]) {
  const results = scoreAll(player, colleges);
  const byLevel: Record<string, number> = {};
  for (const r of results) {
    if (r.score !== null && r.score >= IN_RANGE_THRESHOLD) {
      byLevel[r.college.division] = (byLevel[r.college.division] ?? 0) + 1;
    }
  }
  return byLevel;
}

/**
 * The single highest-leverage gap, computed by actually re-running the scorer
 * with one input improved and counting how many more programs cross into
 * range. Nothing here is estimated or invented: if a lever gains nothing, it
 * is not offered.
 */
export function nextTierLevers(
  player: Player | null,
  colleges: College[]
): TierLever[] {
  if (!player || colleges.length === 0) return [];

  const base = countInRange(player, colleges);

  const candidates: {
    action: string;
    href: string;
    /** True when the lever had to assume an input the player has not entered. */
    assumed?: boolean;
    mutate: (p: Player) => Player;
  }[] = [];

  if (player.overall_score === null) {
    // The projection needs a rating to work from, so this lever states the
    // rating it assumes rather than presenting a conditional result as fact.
    candidates.push({
      action: "Complete your position scores. Projected at a 6.0 rating, the D2/D3 college band.",
      href: "/scores",
      assumed: true,
      mutate: (p) => ({ ...p, overall_score: 6 }),
    });
  } else {
    candidates.push({
      action: `Raise your showcase rating from ${player.overall_score.toFixed(1)} to ${(player.overall_score + 0.5).toFixed(1)}`,
      href: "/scores",
      mutate: (p) => ({ ...p, overall_score: (p.overall_score ?? 0) + 0.5 }),
    });
    candidates.push({
      action: `Raise your showcase rating from ${player.overall_score.toFixed(1)} to ${(player.overall_score + 1).toFixed(1)}`,
      href: "/scores",
      mutate: (p) => ({ ...p, overall_score: (p.overall_score ?? 0) + 1 }),
    });
  }

  if (player.sat_score === null) {
    candidates.push({
      action: "Add your SAT score. Projected at 1100, roughly the national average.",
      href: "/academics",
      assumed: true,
      mutate: (p) => ({ ...p, sat_score: 1100 }),
    });
  } else {
    candidates.push({
      action: `Raise your SAT from ${player.sat_score} to ${player.sat_score + 60}`,
      href: "/academics",
      mutate: (p) => ({ ...p, sat_score: (p.sat_score ?? 0) + 60 }),
    });
  }

  const levers: TierLever[] = [];

  for (const candidate of candidates) {
    const after = countInRange(candidate.mutate(player), colleges);
    for (const level of Object.keys({ ...base, ...after })) {
      const gained = (after[level] ?? 0) - (base[level] ?? 0);
      if (gained > 0) {
        levers.push({
          action: candidate.action,
          effect: candidate.assumed
            ? `${gained} more ${level.toUpperCase()} program${gained === 1 ? "" : "s"} would enter range`
            : `${gained} more ${level.toUpperCase()} program${gained === 1 ? "" : "s"} enter${gained === 1 ? "s" : ""} range`,
          level,
          programsGained: gained,
          assumed: candidate.assumed ?? false,
          href: candidate.href,
        });
      }
    }
  }

  return levers.sort((a, b) => b.programsGained - a.programsGained).slice(0, 3);
}
