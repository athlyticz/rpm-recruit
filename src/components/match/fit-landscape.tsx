"use client";

import { useMemo, useRef, useState } from "react";
import { RotateCcw } from "lucide-react";
import {
  scoreAll,
  IN_RANGE_THRESHOLD,
  type MatchResult,
} from "@/lib/match/interim-scorer";
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

/**
 * Beeswarm packing. Dots keep their true x (the score is never nudged) and are
 * stacked upward only when they would otherwise overlap, so vertical position
 * carries no meaning beyond "these share a score".
 */
function pack(results: MatchResult[]) {
  const rows: number[][] = [];
  return results
    .filter((r) => r.score !== null)
    .map((r) => {
      const x = xFor(r.score as number);
      let row = 0;
      while (rows[row]?.some((taken) => Math.abs(taken - x) < DOT_R * 2.05)) row++;
      (rows[row] ??= []).push(x);
      return { result: r, x, y: AXIS_Y - 12 - row * (DOT_R * 2.15) };
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
}: {
  player: Player;
  colleges: College[];
  onSelect: (result: MatchResult) => void;
  selectedId: string | null;
}) {
  const [draft, setDraft] = useState<{ key: Lever["key"]; value: number } | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);

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
    const lever = levers.find((l) => l.key === draft.key);
    if (!lever) return null;
    return scoreAll(lever.apply(player, draft.value), colleges);
  }, [draft, levers, player, colleges]);

  const shown = projected ?? real;
  const packed = useMemo(() => pack(shown), [shown]);

  const realInRange = real.filter(
    (r) => r.score !== null && r.score >= IN_RANGE_THRESHOLD
  ).length;
  const shownInRange = shown.filter(
    (r) => r.score !== null && r.score >= IN_RANGE_THRESHOLD
  ).length;
  const gained = shownInRange - realInRange;

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
                className="cursor-pointer motion-safe:transition-all motion-safe:dur-slow"
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
      <div className="border-t border-black/[0.06] bg-bone/40 px-4 py-3">
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

        {levers.map((lever) => {
          const isDrafting = draft?.key === lever.key;
          const anchor = lever.actual ?? lever.fallback;
          const value = isDrafting ? draft.value : anchor;

          return (
            <div key={lever.key} className="mb-3 last:mb-0">
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
