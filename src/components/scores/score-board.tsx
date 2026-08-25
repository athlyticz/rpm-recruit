"use client";

import { useMemo, useState, useTransition } from "react";
import { Check, Loader2, TriangleAlert } from "lucide-react";
import { Tachometer } from "@/components/ui/tachometer";
import { saveSkillRating } from "@/app/(app)/scores/actions";

export interface SkillDef {
  id: string;
  position: string;
  skill_key: string;
  label: string;
  group_heading: string;
  sort_order: number;
  bands: { score: number; min_value: number | null; max_value: number | null }[];
  unit: string | null;
}

export interface PositionOption {
  value: string;
  label: string;
}

function bandText(
  band: { min_value: number | null; max_value: number | null },
  unit: string | null
): string {
  const u = unit ? ` ${unit}` : "";
  if (band.min_value === null && band.max_value !== null) return `up to ${band.max_value}${u}`;
  if (band.max_value === null && band.min_value !== null) return `${band.min_value}+${u}`;
  return `${band.min_value} to ${band.max_value}${u}`;
}

export function ScoreBoard({
  positions,
  skills,
  initialRatings,
  initialOverall,
  initialPosition,
  canSave,
}: {
  positions: PositionOption[];
  skills: SkillDef[];
  initialRatings: Record<string, number>;
  initialOverall: number | null;
  initialPosition: string;
  canSave: boolean;
}) {
  const [position, setPosition] = useState(initialPosition);
  const [ratings, setRatings] = useState(initialRatings);
  const [overall, setOverall] = useState(initialOverall);
  const [pending, startTransition] = useTransition();
  const [savingId, setSavingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const groups = useMemo(() => {
    const forPosition = skills
      .filter((s) => s.position === position)
      .sort((a, b) => a.sort_order - b.sort_order);
    const map = new Map<string, SkillDef[]>();
    for (const skill of forPosition) {
      if (!map.has(skill.group_heading)) map.set(skill.group_heading, []);
      map.get(skill.group_heading)!.push(skill);
    }
    return [...map.entries()];
  }, [skills, position]);

  const scaled = useMemo(
    () => skills.filter((s) => s.position === position && s.bands.length > 0),
    [skills, position]
  );

  function setRating(skill: SkillDef, value: number) {
    const next = value === ratings[skill.id] ? 0 : value;
    setRatings((prev) => ({ ...prev, [skill.id]: next }));
    setError(null);

    if (!canSave || next === 0) return;

    setSavingId(skill.id);
    startTransition(async () => {
      const result = await saveSkillRating(skill.id, next);
      setSavingId(null);
      if (!result.ok) {
        setError(result.error ?? "Could not save that rating.");
        // Roll the optimistic value back, so the screen never shows an unsaved
        // number as though it were stored.
        setRatings((prev) => ({ ...prev, [skill.id]: initialRatings[skill.id] ?? 0 }));
        return;
      }
      setOverall(result.overallScore ?? null);
    });
  }

  const entered = Object.values(ratings).filter((v) => v > 0).length;

  return (
    <div className="space-y-4">
      <section className="bg-ink border border-ink-2 rounded-lg flex flex-col sm:flex-row items-center gap-4 sm:gap-6 px-5 py-6">
        <Tachometer score={overall} size="lg" precision={1} className="shrink-0" />
        <div className="text-center sm:text-left min-w-0">
          <p className="font-condensed text-label font-bold tracking-[0.22em] uppercase text-gold mb-1">
            Showcase Rating
          </p>
          <p className="font-display text-display sm:text-display-lg font-bold num text-bone leading-tight">
            {overall === null ? "Not yet rated" : overall.toFixed(1)}
          </p>
          <p className="text-caption text-slate-2 mt-1.5 leading-relaxed max-w-[44ch] text-pretty">
            {entered === 0
              ? "Rate each skill 1 to 10. Your rating is the mean of every skill you have rated, and it saves as you go."
              : `Mean of ${entered} rated skill${entered === 1 ? "" : "s"}. Saves automatically.`}
          </p>
          {!canSave && (
            <p className="text-caption text-gold mt-2 leading-relaxed">
              Create your player profile first and these ratings will save.
            </p>
          )}
        </div>
      </section>

      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
        <label
          htmlFor="position"
          className="font-condensed text-label font-bold tracking-[0.2em] uppercase text-ink-4"
        >
          Position
        </label>
        <select
          id="position"
          value={position}
          onChange={(e) => setPosition(e.target.value)}
          className="min-h-touch border-[1.5px] border-bone-3 rounded-sm px-3 text-sm text-ink bg-white outline-none focus:border-gold transition-colors dur-fast"
        >
          {positions.map((p) => (
            <option key={p.value} value={p.value}>
              {p.label}
            </option>
          ))}
        </select>
      </div>

      {error && (
        <p
          role="alert"
          className="flex items-start gap-2 text-caption text-blood-2 bg-blood/[0.07] border border-blood/25 rounded-sm px-3 py-2.5"
        >
          <TriangleAlert size={15} className="shrink-0 mt-0.5" aria-hidden />
          {error}
        </p>
      )}

      {groups.map(([heading, groupSkills]) => (
        <section
          key={heading}
          className="bg-white border border-black/[0.07] rounded-md shadow-sm overflow-hidden"
        >
          <h2 className="font-condensed text-label font-bold tracking-[0.2em] uppercase text-ink-4 px-4 pt-3.5 pb-2 border-b border-black/[0.06]">
            {heading}
          </h2>

          <div className="px-4 py-2">
            {groupSkills.map((skill) => {
              const value = ratings[skill.id] ?? 0;
              const saving = savingId === skill.id && pending;

              return (
                <div key={skill.id} className="py-2 border-b border-black/[0.04] last:border-0">
                  <div className="flex items-baseline justify-between gap-2 mb-1.5">
                    <span className="text-body font-medium text-ink-4 leading-tight">
                      {skill.label}
                    </span>
                    <span className="flex items-center gap-1.5 shrink-0">
                      {saving && (
                        <Loader2 size={12} className="animate-spin text-slate" aria-hidden />
                      )}
                      {!saving && value > 0 && canSave && (
                        <Check size={12} className="text-green-2" aria-hidden />
                      )}
                      <span className="font-mono text-caption font-bold text-ink tabular-nums w-4 text-right">
                        {value > 0 ? value : "—"}
                      </span>
                    </span>
                  </div>

                  <div role="group" aria-label={`${skill.label} rating`} className="flex gap-[2px]">
                    {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => {
                      const on = n <= value;
                      const peak = n === value;
                      return (
                        <button
                          key={n}
                          type="button"
                          aria-label={`${skill.label}: ${n}`}
                          aria-pressed={peak}
                          onClick={() => setRating(skill, n)}
                          className={`flex-1 min-w-0 h-11 sm:h-8 rounded-xs border text-label font-mono transition-all dur-fast ${
                            on
                              ? n >= 9
                                ? "bg-redline border-redline text-white"
                                : n >= 7
                                  ? "bg-blood border-blood text-white"
                                  : "bg-gold border-gold-2 text-ink"
                              : "bg-bone-2 border-bone-3 text-ink-5"
                          } ${peak ? "shadow-md scale-y-110 relative z-10" : ""}`}
                        >
                          {n}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      ))}

      {scaled.length > 0 && (
        <section className="bg-white border border-black/[0.07] rounded-md shadow-sm p-4">
          <h2 className="font-condensed text-label font-bold tracking-[0.2em] uppercase text-ink-4 mb-1">
            Measured scale
          </h2>
          <p className="text-caption text-ink-5 leading-relaxed mb-3 text-pretty">
            These skills have a measurable behind them, so the rating is not a matter of opinion.
          </p>
          {scaled.map((skill) => (
            <div key={skill.id} className="mb-3 last:mb-0">
              <p className="font-condensed text-meta font-bold tracking-[0.14em] uppercase text-ink mb-1.5">
                {skill.label}
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-1">
                {skill.bands
                  .slice()
                  .sort((a, b) => a.score - b.score)
                  .map((band) => (
                    <div key={band.score} className="border border-bone-3 rounded-xs px-2 py-1.5 text-center">
                      <div className="font-mono text-body font-bold text-ink tabular-nums">
                        {band.score}
                      </div>
                      <div className="text-label text-slate leading-tight">
                        {bandText(band, skill.unit)}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </section>
      )}
    </div>
  );
}
