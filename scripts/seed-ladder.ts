/**
 * Seeds the evaluation ladder: metric_types, skill_definitions, and the
 * skill_scale_bands that map a measurable to a 1-10 score.
 *
 * Source data is extracted from the position configs that the Position Scores
 * page already uses, so the database and the screen agree by construction.
 *
 * Idempotent: upserts on the natural keys. Service role only, since these are
 * reference tables that only the service role may write (migration 00004).
 *
 *   npm run db:seed:ladder
 */

import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "../src/types/database";

interface LadderFile {
  metricTypes: Database["public"]["Tables"]["metric_types"]["Insert"][];
  skills: {
    position: string;
    skill_key: string;
    label: string;
    group_heading: string;
    sort_order: number;
    scale_metric_type: string | null;
  }[];
  bands: {
    position: string;
    skill_key: string;
    score: number;
    min_value: number | null;
    max_value: number | null;
  }[];
}

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is required to seed.`);
  return value;
}

async function main() {
  const ladder = JSON.parse(
    readFileSync(resolve(process.cwd(), "data/evaluation-ladder.json"), "utf8")
  ) as LadderFile;

  const supabase = createClient<Database>(
    requireEnv("NEXT_PUBLIC_SUPABASE_URL"),
    requireEnv("SUPABASE_SERVICE_ROLE_KEY"),
    { auth: { persistSession: false } }
  );

  const { error: metricError } = await supabase
    .from("metric_types")
    .upsert(ladder.metricTypes, { onConflict: "key" });
  if (metricError) throw new Error(`metric_types: ${metricError.message}`);
  console.log(`metric_types: upserted ${ladder.metricTypes.length}`);

  const { data: skillRows, error: skillError } = await supabase
    .from("skill_definitions")
    .upsert(ladder.skills, { onConflict: "position,skill_key" })
    .select("id,position,skill_key");
  if (skillError) throw new Error(`skill_definitions: ${skillError.message}`);
  console.log(`skill_definitions: upserted ${skillRows?.length ?? 0}`);

  const idFor = new Map(
    (skillRows ?? []).map((r) => [`${r.position}|${r.skill_key}`, r.id])
  );

  const bandRows = ladder.bands.map((b) => {
    const id = idFor.get(`${b.position}|${b.skill_key}`);
    if (!id) throw new Error(`no skill_definition for ${b.position}/${b.skill_key}`);
    return {
      skill_definition_id: id,
      score: b.score,
      min_value: b.min_value,
      max_value: b.max_value,
    };
  });

  const { error: bandError } = await supabase
    .from("skill_scale_bands")
    .upsert(bandRows, { onConflict: "skill_definition_id,score" });
  if (bandError) throw new Error(`skill_scale_bands: ${bandError.message}`);
  console.log(`skill_scale_bands: upserted ${bandRows.length}`);
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
