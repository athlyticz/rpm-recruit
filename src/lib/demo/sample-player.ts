/**
 * The sample player used on the public landing page.
 *
 * Nothing here is a real recruit and nothing here is a live number. The
 * profile is fictional and openly labelled as a sample everywhere it appears.
 * What is real is the machinery it runs through: the scale bands come from the
 * published evaluation ladder in data/evaluation-ladder.json, the same file
 * that seeds the database, and the fit scores come from the same scorer the
 * app uses. A visitor dragging the lever on the landing page is exercising the
 * real translation from a measurable to a rating to a fit, on a made-up
 * player.
 *
 * It mirrors the canonical demo fixture (a right-handed pitcher) for the same
 * reason: fastball velocity is the metric with published bands, so it is the
 * only one that can demonstrate the lever at all.
 */
import ladder from "../../../data/evaluation-ladder.json";
import type { ScaleBandRow } from "@/lib/data/player";
import type { Database } from "@/types/database";

type Player = Database["public"]["Tables"]["players"]["Row"];
type Metric = Database["public"]["Tables"]["metrics"]["Row"];

/** Coach ratings on the pitcher skill set. Their mean is the showcase rating. */
export const SAMPLE_RATINGS: Record<string, number> = {
  fastball_velocity: 8,
  fastball_command: 6,
  changeup_command: 5,
  changeup_velocity: 5,
  breaking_ball_command: 6,
  breaking_ball_velocity: 5,
  strikes_walks: 6,
  pfp_fielding: 6,
};

export const SAMPLE_SKILL_COUNT = Object.keys(SAMPLE_RATINGS).length;

function meanRating(ratings: Record<string, number>): number {
  const values = Object.values(ratings);
  return Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 10) / 10;
}

export const SAMPLE_OVERALL = meanRating(SAMPLE_RATINGS);

export const SAMPLE_PLAYER: Player = {
  id: "sample",
  profile_id: "sample",
  first_name: "Sample",
  last_name: "Player",
  position: "Pitcher RHP",
  grad_year: 2027,
  high_school: null,
  city_state: "Sewell, NJ",
  height_inches: 74,
  weight_lbs: 195,
  bats: "R",
  throws: "R",
  gpa: 3.6,
  sat_score: 1180,
  act_score: 25,
  overall_score: SAMPLE_OVERALL,
  majors: ["Business", "Engineering"],
  created_at: "",
  updated_at: "",
};

/** Published bands for a right-handed pitcher's fastball velocity. */
export const FASTBALL_BANDS: ScaleBandRow[] = ladder.bands
  .filter((b) => b.position === "pitcher-rhp" && b.skill_key === "fastball_velocity")
  .map((b) => ({ score: b.score, min_value: b.min_value, max_value: b.max_value }))
  .sort((a, b) => a.score - b.score);

/**
 * The lever starts at the coach-verified reading rather than the newest one,
 * because that is the measurement the rating of 8 was given against. Starting
 * it anywhere else would show a rating that disagrees with the profile.
 */
export const SAMPLE_VELOCITY = 84;

export const SAMPLE_VELOCITY_TYPE = {
  key: "fastball_velocity",
  label: "Fastball Velocity",
  unit: "mph",
  lower_is_better: false,
};

function metric(
  value: number,
  measured_at: string,
  verification_status: Database["public"]["Enums"]["verification_status"],
  source: string | null
): Metric {
  return {
    id: `sample-${measured_at}`,
    player_id: "sample",
    metric_type: "fastball_velocity",
    value,
    measured_at,
    verification_status,
    source,
    notes: null,
    verified_by: null,
    created_at: "",
    updated_at: "",
  };
}

/** Four readings across all three verification levels. */
export const SAMPLE_VELOCITY_HISTORY: Metric[] = [
  metric(79, "2025-06-14", "self_reported", null),
  metric(82, "2025-09-20", "self_reported", null),
  metric(84, "2026-02-08", "coach_verified", "Scanzano Showcase"),
  metric(87, "2026-06-21", "event_verified", "PBR"),
];
