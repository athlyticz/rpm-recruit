import type { Metadata } from "next";
import { PageHeader } from "@/components/app/page-header";
import { ScoreBoard, type SkillDef } from "@/components/scores/score-board";
import { createClient } from "@/lib/supabase/server";
import { getCurrentPlayer } from "@/lib/data/player";

export const metadata: Metadata = { title: "Position Scores" };

const POSITIONS = [
  { value: "pitcher-rhp", label: "Pitcher (RHP)" },
  { value: "pitcher-lhp", label: "Pitcher (LHP)" },
  { value: "catcher", label: "Catcher" },
  { value: "first-baseman", label: "First Baseman" },
  { value: "second-baseman", label: "Second Baseman" },
  { value: "shortstop", label: "Shortstop" },
  { value: "third-baseman", label: "Third Baseman" },
  { value: "outfielder", label: "Outfielder" },
];

/** Maps a stored players.position label onto a ladder position key. */
function positionKey(stored: string | null): string {
  if (!stored) return POSITIONS[0].value;
  const normalised = stored.toLowerCase();
  const direct = POSITIONS.find((p) => p.label.toLowerCase() === normalised);
  if (direct) return direct.value;
  if (normalised.includes("shortstop")) return "shortstop";
  if (normalised.includes("catcher")) return "catcher";
  if (normalised.includes("outfield")) return "outfielder";
  if (normalised.includes("first")) return "first-baseman";
  if (normalised.includes("second")) return "second-baseman";
  if (normalised.includes("third")) return "third-baseman";
  if (normalised.includes("lhp")) return "pitcher-lhp";
  if (normalised.includes("pitcher")) return "pitcher-rhp";
  return POSITIONS[0].value;
}

export default async function ScoresPage() {
  const player = await getCurrentPlayer();
  const supabase = await createClient();

  const [{ data: definitions }, { data: metricTypes }] = await Promise.all([
    supabase
      .from("skill_definitions")
      .select("id,position,skill_key,label,group_heading,sort_order,scale_metric_type,skill_scale_bands(score,min_value,max_value)")
      .eq("is_active", true)
      .order("sort_order"),
    supabase.from("metric_types").select("key,unit"),
  ]);

  const unitFor = new Map((metricTypes ?? []).map((m) => [m.key, m.unit]));

  const skills: SkillDef[] = (definitions ?? []).map((d) => ({
    id: d.id,
    position: d.position,
    skill_key: d.skill_key,
    label: d.label,
    group_heading: d.group_heading,
    sort_order: d.sort_order,
    bands: d.skill_scale_bands ?? [],
    unit: d.scale_metric_type ? (unitFor.get(d.scale_metric_type) ?? null) : null,
  }));

  const initialRatings: Record<string, number> = {};
  if (player) {
    const { data: evaluations } = await supabase
      .from("evaluations")
      .select("skill_definition_id,score,evaluated_at")
      .eq("player_id", player.id)
      .order("evaluated_at", { ascending: true });

    // Later rows win, so the most recent rating per skill is what shows.
    for (const row of evaluations ?? []) {
      initialRatings[row.skill_definition_id] = row.score;
    }
  }

  return (
    <>
      <PageHeader
        eyebrow="Evaluation"
        title="Position Scores"
        subtitle="Rate each skill on the All-American showcase scale. Your rating feeds the tachometer and the athletic projection in every program match."
        bgText="SCORES"
      />

      <div className="px-gutter lg:px-gutter-lg py-5 lg:py-6 pb-10 lg:pb-14">
        {skills.length === 0 ? (
          <p className="bg-white border border-black/[0.07] rounded-md shadow-sm p-5 text-body text-ink-5 leading-relaxed">
            The evaluation ladder has not been loaded into this environment yet. Run{" "}
            <code className="font-mono text-caption">npm run db:seed:ladder</code> to populate it.
          </p>
        ) : (
          <ScoreBoard
            positions={POSITIONS}
            skills={skills}
            initialRatings={initialRatings}
            initialOverall={player?.overall_score ?? null}
            initialPosition={positionKey(player?.position ?? null)}
            canSave={player !== null}
          />
        )}
      </div>
    </>
  );
}
