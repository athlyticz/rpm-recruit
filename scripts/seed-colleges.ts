/**
 * Seeds the colleges table.
 *
 * Two sources, both idempotent (upsert on the slug unique constraint), so the
 * script is safe to re-run:
 *
 *   1. data/legacy-colleges.json      the 31 prototype schools, parsed once from
 *                                     diamond-path-v3.html into numeric columns
 *                                     and tagged data_source = 'legacy_seed'.
 *
 *   2. data/region19-naia-reviewed.json  NJCAA Region 19 and NAIA programs for the
 *                                     NJ/PA/DE footprint, tagged 'region19_naia'.
 *                                     Optional. It is only created after Coach
 *                                     Scanzano reviews data/region19-naia-draft.md.
 *                                     Drafted rows are never seeded unreviewed.
 *
 * Writes require the service role key, which is the only role granted write
 * privileges on colleges (see migration 00002).
 *
 *   npm run db:seed
 */

import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "../src/types/database";

type CollegeInsert = Database["public"]["Tables"]["colleges"]["Insert"];

const LEGACY_PATH = resolve(process.cwd(), "data/legacy-colleges.json");
const REVIEWED_PATH = resolve(process.cwd(), "data/region19-naia-reviewed.json");

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} is required to seed. It is not in .env.local.example by default; pull it from the Supabase project settings or supabase status.`);
  }
  return value;
}

function loadRows(path: string, expectedSource: string): CollegeInsert[] {
  const rows = JSON.parse(readFileSync(path, "utf8")) as CollegeInsert[];

  if (!Array.isArray(rows) || rows.length === 0) {
    throw new Error(`${path} is empty or not an array.`);
  }

  const slugs = new Set<string>();
  for (const row of rows) {
    if (!row.name || !row.slug || !row.division || !row.state) {
      throw new Error(`${path}: row missing a required field (name, slug, division, state): ${JSON.stringify(row).slice(0, 120)}`);
    }
    if (slugs.has(row.slug)) {
      throw new Error(`${path}: duplicate slug ${row.slug}`);
    }
    slugs.add(row.slug);

    if (row.data_source !== expectedSource) {
      throw new Error(`${path}: row ${row.slug} has data_source ${row.data_source}, expected ${expectedSource}`);
    }
  }

  return rows;
}

async function main() {
  const url = requireEnv("NEXT_PUBLIC_SUPABASE_URL");
  const serviceRoleKey = requireEnv("SUPABASE_SERVICE_ROLE_KEY");

  const supabase = createClient<Database>(url, serviceRoleKey, {
    auth: { persistSession: false },
  });

  const batches: { label: string; rows: CollegeInsert[] }[] = [
    { label: "legacy_seed", rows: loadRows(LEGACY_PATH, "legacy_seed") },
  ];

  if (existsSync(REVIEWED_PATH)) {
    batches.push({
      label: "region19_naia",
      rows: loadRows(REVIEWED_PATH, "region19_naia"),
    });
  } else {
    console.log("No data/region19-naia-reviewed.json found. Skipping NJCAA Region 19 and NAIA programs.");
    console.log("Those rows stay out of the database until data/region19-naia-draft.md is reviewed and converted.");
  }

  for (const batch of batches) {
    const { error, count } = await supabase
      .from("colleges")
      .upsert(batch.rows, { onConflict: "slug", count: "exact" });

    if (error) {
      throw new Error(`Upsert failed for ${batch.label}: ${error.message}`);
    }

    console.log(`${batch.label}: upserted ${count ?? batch.rows.length} rows.`);
  }

  const { count: total, error: countError } = await supabase
    .from("colleges")
    .select("*", { count: "exact", head: true });

  if (countError) {
    throw new Error(`Count failed: ${countError.message}`);
  }

  console.log(`colleges now holds ${total} rows.`);
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
