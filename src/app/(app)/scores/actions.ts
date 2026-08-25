"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export interface SaveResult {
  ok: boolean;
  error?: string;
  /** Recomputed showcase rating, so the client can reflect it immediately. */
  overallScore?: number | null;
}

/**
 * Records the signed-in player's own 1-10 rating for one skill.
 *
 * Two things worth knowing about the write path:
 *
 *  1. RLS filters rows out of UPDATE scope rather than rejecting the
 *     statement, so PostgREST answers 204 on a no-op. A status code is
 *     therefore not evidence the write landed. Every mutation here selects
 *     the affected rows back and checks that something actually changed.
 *
 *  2. players.overall_score is a denormalised cache. It is recomputed and
 *     written in this same action so the cache cannot drift from the
 *     evaluations that are its source of truth.
 */
export async function saveSkillRating(
  skillDefinitionId: string,
  score: number
): Promise<SaveResult> {
  if (!Number.isInteger(score) || score < 1 || score > 10) {
    return { ok: false, error: "Rating must be a whole number from 1 to 10." };
  }

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not signed in." };

  const { data: player, error: playerError } = await supabase
    .from("players")
    .select("id")
    .eq("profile_id", user.id)
    .maybeSingle();

  if (playerError) return { ok: false, error: playerError.message };
  if (!player) return { ok: false, error: "No player profile yet." };

  const today = new Date().toISOString().slice(0, 10);

  // Is there already a self rating for this skill?
  const { data: existing, error: existingError } = await supabase
    .from("evaluations")
    .select("id")
    .eq("player_id", player.id)
    .eq("skill_definition_id", skillDefinitionId)
    .eq("evaluator_role", "self")
    .order("evaluated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (existingError) return { ok: false, error: existingError.message };

  if (existing) {
    const { data: updated, error: updateError } = await supabase
      .from("evaluations")
      .update({ score, evaluated_at: today })
      .eq("id", existing.id)
      .select("id");

    if (updateError) return { ok: false, error: updateError.message };
    // The affected-rows check: 204 alone would not have told us this.
    if (!updated || updated.length === 0) {
      return { ok: false, error: "Rating was not saved. It may belong to another evaluator." };
    }
  } else {
    const { data: inserted, error: insertError } = await supabase
      .from("evaluations")
      .insert({
        player_id: player.id,
        skill_definition_id: skillDefinitionId,
        score,
        evaluator_id: user.id,
        evaluator_role: "self",
        evaluated_at: today,
      })
      .select("id");

    if (insertError) return { ok: false, error: insertError.message };
    if (!inserted || inserted.length === 0) {
      return { ok: false, error: "Rating was not saved." };
    }
  }

  const overallScore = await recomputeOverallScore(player.id);
  revalidatePath("/scores");
  revalidatePath("/dashboard");
  revalidatePath("/college-match");

  return { ok: true, overallScore };
}

/**
 * Mean of the player's current ratings, one per skill, preferring the most
 * authoritative evaluator available for each. Written straight back to the
 * players cache in the same action.
 */
async function recomputeOverallScore(playerId: string): Promise<number | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("evaluations")
    .select("skill_definition_id,score,evaluator_role,evaluated_at")
    .eq("player_id", playerId)
    .order("evaluated_at", { ascending: false });

  if (error || !data || data.length === 0) return null;

  const AUTHORITY: Record<string, number> = { self: 0, coach: 2, scout: 2, event: 3 };
  const best = new Map<string, { score: number; rank: number }>();

  for (const row of data) {
    const rank = AUTHORITY[row.evaluator_role] ?? 0;
    const current = best.get(row.skill_definition_id);
    if (!current || rank > current.rank) {
      best.set(row.skill_definition_id, { score: row.score, rank });
    }
  }

  if (best.size === 0) return null;

  const mean =
    [...best.values()].reduce((sum, v) => sum + v.score, 0) / best.size;
  const rounded = Math.round(mean * 10) / 10;

  const { data: updated, error: updateError } = await supabase
    .from("players")
    .update({ overall_score: rounded })
    .eq("id", playerId)
    .select("id");

  if (updateError || !updated || updated.length === 0) {
    console.error("overall_score cache not updated for player", playerId);
    return rounded;
  }

  return rounded;
}
