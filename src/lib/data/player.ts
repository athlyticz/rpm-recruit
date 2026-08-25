import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

/**
 * Every load either succeeds or fails, and the caller can tell which.
 *
 * Returning [] on error is what makes a broken query look identical to an
 * empty table on screen, which is exactly the ambiguity this product exists
 * to eliminate. Callers must handle `error` explicitly.
 */
export type Loaded<T> = { data: T; error: null } | { data: null; error: string };

function ok<T>(data: T): Loaded<T> {
  return { data, error: null };
}

function failed<T>(message: string): Loaded<T> {
  return { data: null, error: message };
}

export type Player = Database["public"]["Tables"]["players"]["Row"];
export type College = Database["public"]["Tables"]["colleges"]["Row"];

function supabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

/** The signed-in user's player row, or null when there is not one yet. */
export async function getCurrentPlayer(): Promise<Player | null> {
  if (!supabaseConfigured()) return null;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("players")
    .select("*")
    .eq("profile_id", user.id)
    .maybeSingle();

  if (error) {
    console.error("getCurrentPlayer:", error.message);
    return null;
  }
  return data;
}

export async function getProfileName(): Promise<string> {
  if (!supabaseConfigured()) return "Player";

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (user?.user_metadata?.full_name as string | undefined) || "Player";
}

/** Every active program, ordered so the list is stable between renders. */
export async function getColleges(): Promise<Loaded<College[]>> {
  if (!supabaseConfigured()) {
    return failed("The program database is not configured in this environment.");
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("colleges")
    .select("*")
    .eq("is_active", true)
    .order("name");

  if (error) {
    console.error("getColleges:", error.message);
    return failed(error.message);
  }
  return ok(data ?? []);
}

export type Metric = Database["public"]["Tables"]["metrics"]["Row"];
export type ChecklistItem = Database["public"]["Tables"]["checklist_items"]["Row"];
export type Evaluation = Database["public"]["Tables"]["evaluations"]["Row"];

export async function getMetrics(playerId: string | null): Promise<Metric[]> {
  if (!supabaseConfigured() || !playerId) return [];

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("metrics")
    .select("*")
    .eq("player_id", playerId)
    .order("measured_at", { ascending: false });

  if (error) {
    console.error("getMetrics:", error.message);
    return [];
  }
  return data ?? [];
}

export async function getChecklistItems(
  playerId: string | null
): Promise<ChecklistItem[]> {
  if (!supabaseConfigured() || !playerId) return [];

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("checklist_items")
    .select("*")
    .eq("player_id", playerId)
    .order("sort_order");

  if (error) {
    console.error("getChecklistItems:", error.message);
    return [];
  }
  return data ?? [];
}

export async function getEvaluations(
  playerId: string | null
): Promise<Evaluation[]> {
  if (!supabaseConfigured() || !playerId) return [];

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("evaluations")
    .select("*")
    .eq("player_id", playerId)
    .order("evaluated_at", { ascending: false });

  if (error) {
    console.error("getEvaluations:", error.message);
    return [];
  }
  return data ?? [];
}

/**
 * Metric history grouped by type, with the scale bands that belong to whichever
 * skill each metric drives. Types with no measurements are still returned so
 * the caller can decide what to show; nothing here invents a data point.
 */
export interface ScaleBandRow {
  score: number;
  min_value: number | null;
  max_value: number | null;
}

export async function getTrajectory(playerId: string | null): Promise<{
  types: { key: string; label: string; unit: string; lower_is_better: boolean }[];
  metrics: Metric[];
  bands: Map<string, ScaleBandRow[]>;
}> {
  if (!supabaseConfigured()) {
    return { types: [], metrics: [], bands: new Map<string, ScaleBandRow[]>() };
  }

  const supabase = await createClient();

  const [{ data: types }, { data: skills }] = await Promise.all([
    supabase
      .from("metric_types")
      .select("key,label,unit,lower_is_better,sort_order")
      .eq("is_active", true)
      .order("sort_order"),
    supabase
      .from("skill_definitions")
      .select("scale_metric_type,skill_scale_bands(score,min_value,max_value)")
      .not("scale_metric_type", "is", null),
  ]);

  const bands = new Map<string, ScaleBandRow[]>();
  for (const skill of skills ?? []) {
    if (!skill.scale_metric_type) continue;
    if (!bands.has(skill.scale_metric_type)) {
      bands.set(skill.scale_metric_type, skill.skill_scale_bands ?? []);
    }
  }

  const metrics = await getMetrics(playerId);

  return { types: types ?? [], metrics, bands };
}

/**
 * The player's skill shape for their own position: the most authoritative
 * rating per skill from themselves and, separately, from a coach or scout.
 * Skills with no rating come back null rather than zero, so the chart can
 * refuse to draw a shape rather than draw a misleading one.
 */
export async function getSkillShape(player: Player | null) {
  if (!supabaseConfigured() || !player) return { position: null, axes: [] };

  const supabase = await createClient();

  const { data: definitions } = await supabase
    .from("skill_definitions")
    .select("id,position,label,sort_order")
    .eq("is_active", true)
    .order("sort_order");

  const { data: evaluations } = await supabase
    .from("evaluations")
    .select("skill_definition_id,score,evaluator_role,evaluated_at")
    .eq("player_id", player.id)
    .order("evaluated_at", { ascending: true });

  const rated = new Set((evaluations ?? []).map((e) => e.skill_definition_id));
  const positions = new Map<string, number>();
  for (const d of definitions ?? []) {
    if (rated.has(d.id)) positions.set(d.position, (positions.get(d.position) ?? 0) + 1);
  }

  // Use whichever position actually has ratings, falling back to none.
  const position = [...positions.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;
  if (!position) return { position: null, axes: [] };

  const forPosition = (definitions ?? []).filter((d) => d.position === position);

  const axes = forPosition.map((d) => {
    const rows = (evaluations ?? []).filter((e) => e.skill_definition_id === d.id);
    const self = rows.filter((r) => r.evaluator_role === "self").at(-1)?.score ?? null;
    const coach =
      rows.filter((r) => r.evaluator_role === "coach" || r.evaluator_role === "scout").at(-1)
        ?.score ?? null;
    return { label: d.label, self, coach };
  });

  return { position, axes };
}

export interface MetricLever {
  metricKey: string;
  metricLabel: string;
  unit: string;
  lowerIsBetter: boolean;
  skillDefinitionId: string;
  skillLabel: string;
  /** Band edges, ascending by score, for translating a raw value to 1-10. */
  bands: ScaleBandRow[];
  /** The player's most recent measurement for this metric, if any. */
  currentValue: number | null;
  /** The player's current rating for the skill this metric drives, if any. */
  currentScore: number | null;
}

/**
 * Levers where a raw measurable maps to a 1-10 rating through
 * skill_scale_bands: a pitcher's fastball velocity, a catcher's pop time.
 *
 * This is the chain that makes "add 3 mph" answerable. The bands are the
 * translation layer, so nothing here is estimated: a value either falls in a
 * published band or it does not.
 */
/** Maps a stored players.position label onto a ladder position key. */
function positionKey(stored: string | null): string | null {
  if (!stored) return null;
  const n = stored.toLowerCase();
  if (n.includes("shortstop")) return "shortstop";
  if (n.includes("catcher")) return "catcher";
  if (n.includes("outfield")) return "outfielder";
  if (n.includes("first")) return "first-baseman";
  if (n.includes("second")) return "second-baseman";
  if (n.includes("third")) return "third-baseman";
  if (n.includes("lhp")) return "pitcher-lhp";
  if (n.includes("pitcher") || n.includes("rhp")) return "pitcher-rhp";
  return null;
}

export async function getMetricLevers(player: Player | null): Promise<MetricLever[]> {
  if (!supabaseConfigured() || !player) return [];

  const supabase = await createClient();

  const { data: skills } = await supabase
    .from("skill_definitions")
    .select(
      "id,position,label,scale_metric_type,skill_scale_bands(score,min_value,max_value),metric_types(key,label,unit,lower_is_better)"
    )
    .eq("is_active", true)
    .not("scale_metric_type", "is", null);

  if (!skills || skills.length === 0) return [];

  const [{ data: evaluations }, metrics] = await Promise.all([
    supabase
      .from("evaluations")
      .select("skill_definition_id,score,evaluated_at")
      .eq("player_id", player.id)
      .order("evaluated_at", { ascending: true }),
    getMetrics(player.id),
  ]);

  /*
   * Only the player's own position gets levers. A shortstop has no business
   * dragging a fastball velocity slider, and an earlier version handed them
   * one twice over because both pitcher positions define that skill.
   */
  const rated = new Set((evaluations ?? []).map((e) => e.skill_definition_id));
  const ratedPositions = new Set(
    skills.filter((s) => rated.has(s.id)).map((s) => s.position)
  );
  const own = positionKey(player.position);
  const allowed =
    ratedPositions.size > 0 ? ratedPositions : own ? new Set([own]) : new Set<string>();

  return skills
    .filter((s) => (own ? s.position === own : allowed.has(s.position)))
    .map((skill) => {
      const type = skill.metric_types;
      if (!type) return null;
      const latest = metrics.find((m) => m.metric_type === skill.scale_metric_type);
      const score =
        (evaluations ?? []).filter((e) => e.skill_definition_id === skill.id).at(-1)?.score ??
        null;
      return {
        metricKey: type.key,
        metricLabel: type.label,
        unit: type.unit,
        lowerIsBetter: type.lower_is_better,
        skillDefinitionId: skill.id,
        skillLabel: skill.label,
        bands: (skill.skill_scale_bands ?? []).slice().sort((a, b) => a.score - b.score),
        currentValue: latest ? Number(latest.value) : null,
        currentScore: score,
      } satisfies MetricLever;
    })
    .filter((l): l is MetricLever => l !== null && l.bands.length > 0);
}

/** Every current rating for the player, so a lever can recompute their mean. */
export async function getCurrentRatings(
  player: Player | null
): Promise<Record<string, number>> {
  if (!supabaseConfigured() || !player) return {};

  const supabase = await createClient();
  const { data } = await supabase
    .from("evaluations")
    .select("skill_definition_id,score,evaluated_at")
    .eq("player_id", player.id)
    .order("evaluated_at", { ascending: true });

  const out: Record<string, number> = {};
  for (const row of data ?? []) out[row.skill_definition_id] = row.score;
  return out;
}
