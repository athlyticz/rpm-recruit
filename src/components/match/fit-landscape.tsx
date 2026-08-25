"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { RotateCcw } from "lucide-react";
import {
  scoreAll,
  IN_RANGE_THRESHOLD,
  type MatchResult,
} from "@/lib/match/interim-scorer";
import { scoreFromBands, bandRange, bandTicks } from "@/lib/match/bands";
import type { MetricLever } from "@/lib/data/player";
import { LEVELS, type Division } from "./level-constants";
import type { Database } from "@/types/database";

type Player = Database["public"]["Tables"]["players"]["Row"];
type College = Database["public"]["Tables"]["colleges"]["Row"];

/* ------------------------------------------------------------------ */
/*  Geometry                                                           */
/* ------------------------------------------------------------------ */

const W = 320;
const H = 168;
const PAD_L = 8;
const PAD_R = 8;
const AXIS_Y = H - 26;
const PLOT_TOP = 16;
const DOT_R = 5.2;

const LEVEL_COLOUR: Record<Division, string> = {
  d1: "var(--color-redline)",
  d2: "var(--color-blood-2)",
  d3: "var(--color-gold)",
  naia: "var(--color-blue-2)",
  njcaa: "var(--color-green-2)",
};

function xFor(score: number): number {
  return PAD_L + (score / 100) * (W - PAD_L - PAD_R);
}

/** Stable hash of a school id, so jitter never reshuffles between renders. */
function seeded(id: string): number {
  let h = 2166136261;
  for (let i = 0; i < id.length; i++) {
    h ^= id.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return ((h >>> 0) % 1000) / 1000;
}

/**
 * Dots keep their true x, always: the score is never nudged. Vertical position
 * is deterministic jitter seeded by school id, which spreads the field through
 * the plot so density is legible. Stacking alone left the dots hugging the
 * axis with two thirds of the box empty, which read as a chart that had not
 * finished loading rather than as a populated landscape.
 */
function pack(results: MatchResult[]) {
  const top = PLOT_TOP + DOT_R;
  const bottom = AXIS_Y - DOT_R - 6;
  const band = bottom - top;

  return results
    .filter((r) => r.score !== null)
    .map((r) => {
      const x = xFor(r.score as number);
      const y = top + seeded(r.college.id) * band;
      return { result: r, x, y };
    });
}

/* ------------------------------------------------------------------ */
/*  Lever definitions                                                  */
/* ------------------------------------------------------------------ */

interface Lever {
  key: "rating" | "sat";
  label: string;
  unit: string;
  min: number;
  max: number;
  step: number;
  /** The player's real, database-backed value. Null when not on file. */
  actual: number | null;
  /** Where the slider starts when there is no real value to anchor to. */
  fallback: number;
  apply: (player: Player, value: number) => Player;
  format: (value: number) => string;
}

const LEVERS: Lever[] = [
  {
    key: "rating",
    label: "Showcase rating",
    unit: "",
    min: 1,
    max: 10,
    step: 0.1,
    actual: null,
    fallback: 6,
    apply: (p, v) => ({ ...p, overall_score: v }),
    format: (v) => v.toFixed(1),
  },
  {
    key: "sat",
    label: "SAT",
    unit: "",
    min: 800,
    max: 1600,
    step: 10,
    actual: null,
    fallback: 1100,
    apply: (p, v) => ({ ...p, sat_score: Math.round(v) }),
    format: (v) => String(Math.round(v)),
  },
];

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function FitLandscape({
  player,
  colleges,
  onSelect,
  selectedId,
  metricLevers = [],
  currentRatings = {},
}: {
  player: Player;
  colleges: College[];
  onSelect: (result: MatchResult) => void;
  selectedId: string | null;
  metricLevers?: MetricLever[];
  currentRatings?: Record<string, number>;
}) {
  const [draft, setDraft] = useState<{ key: string; value: number } | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const leversRef = useRef<HTMLDivElement | null>(null);

  /*
   * Arriving from a Next Tier lever on the dashboard, the panel scrolls into
   * view and the named lever is highlighted. It is deliberately not dragged
   * for the player: a projection is something you hold, and priming one on
   * their behalf would put a number on screen nobody asked for.
   */
  /*
   * Read from location rather than useSearchParams: that hook forces a
   * Suspense boundary at the route level, and a Suspense boundary on this
   * route silently breaks hydration. See the route notes in CLAUDE.md.
   */
  const [primed, setPrimed] = useState<string | null>(null);

  useEffect(() => {
    setPrimed(new URLSearchParams(window.location.search).get("lever"));
  }, []);

  useEffect(() => {
    if (!primed) return;
    leversRef.current?.scrollIntoView({
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "auto"
        : "smooth",
      block: "center",
    });
  }, [primed]);

  /**
   * A metric lever moves the rating it drives, and the rating moves the mean
   * that the scorer reads. metric -> band -> rating -> overall -> score.
   */
  function playerWithMetric(lever: MetricLever, rawValue: number): Player {
    const bandScore = scoreFromBands(rawValue, lever.bands);
    if (bandScore === null) return player;

    const ratings = { ...currentRatings, [lever.skillDefinitionId]: bandScore };
    const values = Object.values(ratings);
    if (values.length === 0) return { ...player, overall_score: bandScore };

    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    return { ...player, overall_score: Math.round(mean * 10) / 10 };
  }

  const levers = useMemo(
    () =>
      LEVERS.map((l) => ({
        ...l,
        actual: l.key === "rating" ? player.overall_score : player.sat_score,
      })),
    [player]
  );

  // Reality: always the database-backed player.
  const real = useMemo(() => scoreAll(player, colleges), [player, colleges]);

  // Projection: only while a slider is held. Released, it does not exist.
  const projected = useMemo(() => {
    if (!draft) return null;

    const metric = metricLevers.find((l) => l.metricKey === draft.key);
    if (metric) return scoreAll(playerWithMetric(metric, draft.value), colleges);

    const lever = levers.find((l) => l.key === draft.key);
    if (!lever) return null;
    return scoreAll(lever.apply(player, draft.value), colleges);
    // playerWithMetric is derived from props that are already dependencies.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft, levers, metricLevers, player, colleges, currentRatings]);

  const shown = projected ?? real;
  const packed = useMemo(() => pack(shown), [shown]);

  const realInRange = real.filter(
    (r) => r.score !== null && r.score >= IN_RANGE_THRESHOLD
  ).length;
  const shownInRange = shown.filter(
    (r) => r.score !== null && r.score >= IN_RANGE_THRESHOLD
  ).length;
  const gained = shownInRange - realInRange;

  /*
   * Raising ability can lower a fit, because a stronger player is a worse
   * match for a lower division. That is the honesty working, but in a demo it
   * reads as a bug unless it is named the moment it happens.
   */
  const droppedByLevel = useMemo(() => {
    if (!projected) return null;
    const realById = new Map(real.map((r) => [r.college.id, r.score]));
    const dropped = projected.filter((r) => {
      const before = realById.get(r.college.id);
      return before !== undefined && before !== null && r.score !== null && r.score < before;
    });
    if (dropped.length === 0) return null;
    const levels = [...new Set(dropped.map((d) => d.college.division))];
    return { count: dropped.length, levels };
  }, [projected, real]);

  const best = real[0]?.score ?? null;

  return (
    <section className="bg-white border border-black/[0.07] rounded-md shadow-sm overflow-hidden">
      <div className="px-4 pt-3.5 pb-2 flex items-baseline justify-between gap-3">
        <h2 className="font-condensed text-micro font-bold tracking-[0.24em] uppercase text-slate">
          The landscape
        </h2>
        <span className="font-mono num text-meta text-ink-5">
          {shownInRange}
          <span className="text-slate"> of {shown.length} in range</span>
        </span>
      </div>

      <div className="px-4">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${W} ${H}`}
          width="100%"
          role="img"
          aria-label={`${shown.length} programs plotted by fit score. ${shownInRange} are in range.`}
          className="overflow-visible"
        >
          {/* In-range threshold. Everything right of this line is reachable. */}
          <line
            x1={xFor(IN_RANGE_THRESHOLD)}
            y1={PLOT_TOP - 6}
            x2={xFor(IN_RANGE_THRESHOLD)}
            y2={AXIS_Y}
            stroke="var(--color-bone-3)"
            strokeWidth={1}
            strokeDasharray="3 3"
          />
          <text
            x={xFor(IN_RANGE_THRESHOLD) + 4}
            y={PLOT_TOP - 8}
            fontSize={8}
            fontFamily="var(--font-condensed)"
            letterSpacing={1}
            fill="var(--color-slate)"
          >
            IN RANGE
          </text>

          {/* Axis */}
          <line
            x1={PAD_L}
            y1={AXIS_Y}
            x2={W - PAD_R}
            y2={AXIS_Y}
            stroke="var(--color-bone-3)"
            strokeWidth={1}
          />
          {[0, 25, 50, 75, 100].map((tick) => (
            <g key={tick}>
              <line
                x1={xFor(tick)}
                y1={AXIS_Y}
                x2={xFor(tick)}
                y2={AXIS_Y + 4}
                stroke="var(--color-bone-3)"
                strokeWidth={1}
              />
              <text
                x={xFor(tick)}
                y={AXIS_Y + 15}
                textAnchor="middle"
                fontSize={8}
                fontFamily="var(--font-mono)"
                fill="var(--color-slate)"
              >
                {tick}
              </text>
            </g>
          ))}

          {/* The player's best real fit, so the projection can be compared to
              something true even while a slider is held. */}
          {best !== null && (
            <g>
              <line
                x1={xFor(best)}
                y1={PLOT_TOP - 2}
                x2={xFor(best)}
                y2={AXIS_Y}
                stroke="var(--color-ink)"
                strokeWidth={1.25}
              />
              <text
                x={Math.min(xFor(best) + 4, W - 34)}
                y={AXIS_Y - 2}
                fontSize={8}
                fontFamily="var(--font-condensed)"
                letterSpacing={1}
                fill="var(--color-ink-4)"
              >
                YOUR BEST
              </text>
            </g>
          )}

          {packed.map(({ result, x, y }) => {
            const isSelected = result.college.id === selectedId;
            return (
              <circle
                key={result.college.id}
                cx={x}
                cy={y}
                r={isSelected ? DOT_R + 2 : DOT_R}
                fill={LEVEL_COLOUR[result.college.division as Division]}
                stroke={isSelected ? "var(--color-ink)" : "white"}
                strokeWidth={isSelected ? 2 : 1}
                opacity={result.score !== null && result.score >= IN_RANGE_THRESHOLD ? 1 : 0.42}
                /* Geometry moves: the dot travels to its new score on the
                   needle curve. The score text beside it cuts. See the Motion
                   Policy in CLAUDE.md. */
                className="cursor-pointer motion-safe:transition-[cx,cy,r,opacity] motion-safe:dur-slow"
                style={{ transitionTimingFunction: "var(--ease-needle)" }}
                onClick={() => onSelect(result)}
                role="button"
                tabIndex={0}
                aria-label={`${result.college.short_name ?? result.college.name}, ${result.college.division.toUpperCase()}, fit ${result.score}`}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onSelect(result);
                  }
                }}
              />
            );
          })}
        </svg>
      </div>

      {/* Legend */}
      <div className="px-4 pt-1 pb-3 flex flex-wrap gap-x-3 gap-y-1">
        {LEVELS.map((meta) => {
          const count = shown.filter((r) => r.college.division === meta.key).length;
          if (count === 0) return null;
          return (
            <span key={meta.key} className="inline-flex items-center gap-1.5 text-micro text-ink-5">
              <span
                aria-hidden
                className="size-2 rounded-pill"
                style={{ background: LEVEL_COLOUR[meta.key] }}
              />
              {meta.label}
              <span className="font-mono num text-slate">{count}</span>
            </span>
          );
        })}
      </div>

      {/* What-if levers */}
      <div ref={leversRef} className="border-t border-black/[0.06] bg-bone/40 px-4 py-3">
        <div className="flex items-baseline justify-between gap-3 mb-2">
          <h3 className="font-condensed text-micro font-bold tracking-[0.24em] uppercase text-slate">
            What if
          </h3>
          {draft && (
            <span className="inline-flex items-center gap-1.5">
              <span className="font-condensed text-micro font-bold tracking-[0.14em] uppercase text-gold border border-gold/40 rounded-xs px-1.5 py-0.5">
                Projection
              </span>
              <span className="font-mono num text-meta text-ink">
                {gained > 0 ? `+${gained}` : gained} in range
              </span>
            </span>
          )}
        </div>

        {/* Metric levers first: a measurable is more concrete than a rating,
            and the bands make the translation visible. */}
        {metricLevers.map((lever) => {
          const range = bandRange(lever.bands);
          const ticks = bandTicks(lever.bands);
          const isDrafting = draft?.key === lever.metricKey;
          const anchorValue =
            lever.currentValue ?? (range.min + range.max) / 2;
          const value = isDrafting ? draft.value : anchorValue;
          const projectedScore = scoreFromBands(value, lever.bands);

          return (
            <div key={lever.metricKey} className="mb-4 last:mb-0">
              <label className="flex items-baseline justify-between gap-2 mb-1">
                <span className="text-caption text-ink-4">
                  {lever.metricLabel}
                  {lever.skillLabel !== lever.metricLabel && (
                    <span className="text-slate"> drives {lever.skillLabel}</span>
                  )}
                </span>
                <span className="font-mono num text-meta">
                  <span className={isDrafting ? "text-gold" : "text-ink"}>
                    {value.toFixed(lever.unit === "seconds" ? 2 : 0)}
                  </span>
                  <span className="text-slate"> {lever.unit}</span>
                  {projectedScore !== null && (
                    <span className={isDrafting ? "text-gold" : "text-ink-5"}>
                      {" "}
                      = {projectedScore}
                    </span>
                  )}
                </span>
              </label>

              {/* Band boundaries on the track, so the player can see exactly
                  where one score becomes the next. */}
              <div className="relative h-3 mb-0.5" aria-hidden>
                {ticks.map((tick) => (
                  <span
                    key={tick.score}
                    className="absolute top-0 flex flex-col items-center"
                    style={{ left: `${Math.min(Math.max(tick.at, 0), 1) * 100}%`, transform: "translateX(-50%)" }}
                  >
                    <span className="block w-px h-1.5 bg-bone-3" />
                    <span className="font-mono num text-[7px] leading-none text-slate">
                      {tick.score}
                    </span>
                  </span>
                ))}
              </div>

              <input
                type="range"
                min={range.min}
                max={range.max}
                step={lever.unit === "seconds" ? 0.01 : 1}
                value={value}
                aria-label={`${lever.metricLabel} projection`}
                onChange={(e) => setDraft({ key: lever.metricKey, value: Number(e.target.value) })}
                onPointerUp={() => setDraft(null)}
                onPointerCancel={() => setDraft(null)}
                onBlur={() => setDraft(null)}
                onKeyUp={(e) => {
                  if (e.key !== "Tab") setDraft(null);
                }}
                className="focusable w-full accent-gold h-touch cursor-pointer"
              />

              {lever.currentValue === null && (
                <p className="text-micro text-slate mt-0.5">
                  No {lever.metricLabel.toLowerCase()} on file, so this starts mid-scale.
                </p>
              )}
            </div>
          );
        })}

        {levers.map((lever) => {
          const isDrafting = draft?.key === lever.key;
          const anchor = lever.actual ?? lever.fallback;
          const value = isDrafting ? draft.value : anchor;

          return (
            <div
              key={lever.key}
              className={`mb-3 last:mb-0 ${
                primed === lever.key ? "ring-2 ring-gold/50 rounded-sm -mx-1.5 px-1.5 py-1" : ""
              }`}
            >
              <label className="flex items-baseline justify-between gap-2 mb-1">
                <span className="text-caption text-ink-4">{lever.label}</span>
                <span className="font-mono num text-meta">
                  <span className={isDrafting ? "text-gold" : "text-ink"}>
                    {lever.format(value)}
                  </span>
                  {lever.actual === null ? (
                    <span className="text-slate"> · none on file</span>
                  ) : (
                    isDrafting && (
                      <span className="text-slate"> · actual {lever.format(lever.actual)}</span>
                    )
                  )}
                </span>
              </label>

              <input
                type="range"
                min={lever.min}
                max={lever.max}
                step={lever.step}
                value={value}
                aria-label={`${lever.label} projection`}
                onChange={(e) => setDraft({ key: lever.key, value: Number(e.target.value) })}
                /* Release returns to reality. A projection is something you
                   hold, not something the screen keeps claiming. */
                onPointerUp={() => setDraft(null)}
                onPointerCancel={() => setDraft(null)}
                onBlur={() => setDraft(null)}
                onKeyUp={(e) => {
                  if (e.key !== "Tab") setDraft(null);
                }}
                className="focusable w-full accent-gold h-touch cursor-pointer"
              />
            </div>
          );
        })}

        {droppedByLevel && (
          <p className="text-caption text-ink-5 leading-relaxed text-pretty mt-1 mb-2 border-l-2 border-gold pl-2.5">
            {droppedByLevel.count} program
            {droppedByLevel.count === 1 ? "" : "s"} scored lower, mostly{" "}
            {droppedByLevel.levels.map((l) => l.toUpperCase()).join(" and ")}. Stronger
            players fit lower divisions less, and coaches know it too.
          </p>
        )}

        <p className="text-micro text-slate leading-relaxed text-pretty">
          {draft
            ? "Projected only while you hold the slider. Nothing here is saved, and the dark line marks your real best fit."
            : "Drag a slider to see which programs would come into range. Release to return to your real numbers."}
        </p>

        {draft && (
          <button
            type="button"
            onClick={() => setDraft(null)}
            className="pressable focusable mt-2 inline-flex items-center gap-1.5 min-h-touch font-condensed text-micro font-bold tracking-[0.16em] uppercase text-ink-4 hover:text-gold transition-colors dur-fast"
          >
            <RotateCcw size={12} aria-hidden />
            Back to reality
          </button>
        )}
      </div>
    </section>
  );
}
