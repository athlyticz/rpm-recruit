/**
 * Seeds the canonical demo fixture: one coherent player who exercises every
 * visualization in the product at once.
 *
 * A right-handed pitcher, because fastball velocity is the metric that has
 * published scale bands, which makes the metric-driven what-if lever
 * demonstrable. A shortstop cannot show that lever at all.
 *
 * What this produces:
 *   - a complete player row, so Profile Strength has something to score
 *   - metric history across three verification levels, so Trajectory shows a
 *     real climb and the verification styling is all visible at once
 *   - self and coach evaluations on the pitcher skill set, so the radar draws
 *     both polygons and the overlay argument lands
 *   - an overall_score consistent with those evaluations
 *
 * Idempotent: re-running replaces this player's metrics and evaluations rather
 * than stacking duplicates.
 *
 *   npm run db:seed:demo -- <email>
 */

import { createClient } from "@supabase/supabase-js";
import type { Database } from "../src/types/database";

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is required.`);
  return value;
}

/**
 * Guard. This script deletes a player's metrics and evaluations before
 * reseeding, so pointing it at the wrong account destroys real data. It
 * therefore refuses to run without an explicit email, and refuses any address
 * that is not clearly a disposable test or demo alias.
 */
const EMAIL = process.argv[2];

if (!EMAIL) {
  console.error(
    "Refusing to run without an explicit email.\n" +
      "  npm run db:seed:demo -- someone+test@example.com"
  );
  process.exit(1);
}

if (!/\+(test|demo)@/.test(EMAIL)) {
  console.error(
    `Refusing to seed ${EMAIL}.\n` +
      "This script deletes that player's metrics and evaluations first, so it only\n" +
      "accepts a +test@ or +demo@ alias. Use a disposable address."
  );
  process.exit(1);
}

const METRICS: {
  metric_type: string;
  value: number;
  verification_status: Database["public"]["Enums"]["verification_status"];
  source: string | null;
  measured_at: string;
}[] = [
  { metric_type: "fastball_velocity", value: 79, verification_status: "self_reported", source: null, measured_at: "2025-06-14" },
  { metric_type: "fastball_velocity", value: 82, verification_status: "self_reported", source: null, measured_at: "2025-09-20" },
  { metric_type: "fastball_velocity", value: 84, verification_status: "coach_verified", source: "Scanzano Showcase", measured_at: "2026-02-08" },
  { metric_type: "fastball_velocity", value: 87, verification_status: "event_verified", source: "PBR", measured_at: "2026-06-21" },
  { metric_type: "sixty_yard_dash", value: 7.35, verification_status: "self_reported", source: null, measured_at: "2025-06-14" },
  { metric_type: "sixty_yard_dash", value: 7.08, verification_status: "coach_verified", source: "Scanzano Showcase", measured_at: "2026-02-08" },
  { metric_type: "sixty_yard_dash", value: 6.92, verification_status: "event_verified", source: "PBR", measured_at: "2026-06-21" },
  { metric_type: "bat_speed", value: 66, verification_status: "self_reported", source: null, measured_at: "2025-09-20" },
  { metric_type: "bat_speed", value: 70, verification_status: "event_verified", source: "PBR", measured_at: "2026-06-21" },
];

/** Self ratings, with the coach a notch harsher on the soft skills. */
const SELF: Record<string, number> = {
  fastball_velocity: 8,
  fastball_command: 7,
  changeup_command: 6,
  changeup_velocity: 6,
  breaking_ball_command: 7,
  breaking_ball_velocity: 6,
  "strikes_walks": 7,
  "pfp_fielding": 6,
};

const COACH: Record<string, number> = {
  fastball_velocity: 8,
  fastball_command: 6,
  changeup_command: 5,
  changeup_velocity: 5,
  breaking_ball_command: 6,
  breaking_ball_velocity: 5,
  "strikes_walks": 6,
  "pfp_fielding": 6,
};

async function main() {
  const supabase = createClient<Database>(
    requireEnv("NEXT_PUBLIC_SUPABASE_URL"),
    requireEnv("SUPABASE_SERVICE_ROLE_KEY"),
    { auth: { persistSession: false } }
  );

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id")
    .eq("email", EMAIL)
    .maybeSingle();

  if (profileError) throw new Error(profileError.message);
  if (!profile) throw new Error(`No profile for ${EMAIL}. Sign up first.`);

  // players has no unique constraint on profile_id, so this is a lookup then
  // update-or-insert rather than an upsert.
  const fields = {
    first_name: "Michael",
    last_name: "T.",
    position: "Pitcher RHP",
    grad_year: 2027,
    high_school: "Washington Township HS",
    city_state: "Sewell, NJ",
    height_inches: 74,
    weight_lbs: 195,
    bats: "R" as const,
    throws: "R" as const,
    gpa: 3.6,
    sat_score: 1180,
    act_score: 25,
    majors: ["Business", "Engineering"],
  };

  const { data: existing } = await supabase
    .from("players")
    .select("id")
    .eq("profile_id", profile.id)
    .maybeSingle();

  let playerId: string;
  if (existing) {
    const { error } = await supabase.from("players").update(fields).eq("id", existing.id);
    if (error) throw new Error(error.message);
    playerId = existing.id;
  } else {
    const { data, error } = await supabase
      .from("players")
      .insert({ profile_id: profile.id, ...fields })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    playerId = data.id;
  }
  const player = { id: playerId };

  console.log("player:", player.id);

  await supabase.from("metrics").delete().eq("player_id", player.id);
  const { error: metricError } = await supabase
    .from("metrics")
    .insert(METRICS.map((m) => ({ ...m, player_id: player.id })));
  if (metricError) throw new Error(`metrics: ${metricError.message}`);
  console.log(`metrics: ${METRICS.length}`);

  const { data: skills } = await supabase
    .from("skill_definitions")
    .select("id,skill_key")
    .eq("position", "pitcher-rhp");

  if (!skills || skills.length === 0) {
    throw new Error("No pitcher-rhp skills. Run db:seed:ladder first.");
  }

  await supabase.from("evaluations").delete().eq("player_id", player.id);

  const rows = skills.flatMap((skill) => {
    const self = SELF[skill.skill_key];
    const coach = COACH[skill.skill_key];
    const out = [];
    if (self !== undefined) {
      out.push({
        player_id: player.id,
        skill_definition_id: skill.id,
        score: self,
        evaluator_id: profile.id,
        evaluator_role: "self" as const,
        evaluated_at: "2026-02-10",
      });
    }
    if (coach !== undefined) {
      out.push({
        player_id: player.id,
        skill_definition_id: skill.id,
        score: coach,
        evaluator_id: profile.id,
        evaluator_role: "coach" as const,
        evaluated_at: "2026-06-25",
      });
    }
    return out;
  });

  const { error: evalError } = await supabase.from("evaluations").insert(rows);
  if (evalError) throw new Error(`evaluations: ${evalError.message}`);
  console.log(`evaluations: ${rows.length}`);

  // overall_score is a cache of the most authoritative rating per skill.
  const best = new Map<string, number>();
  for (const skill of skills) {
    const coach = COACH[skill.skill_key];
    const self = SELF[skill.skill_key];
    const value = coach ?? self;
    if (value !== undefined) best.set(skill.id, value);
  }
  const mean =
    [...best.values()].reduce((a, b) => a + b, 0) / Math.max(best.size, 1);
  const overall = Math.round(mean * 10) / 10;

  await supabase.from("players").update({ overall_score: overall }).eq("id", player.id);
  console.log("overall_score:", overall);
}

main().catch((e: unknown) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
