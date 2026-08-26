"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { IN_RANGE_THRESHOLD, type MatchResult } from "@/lib/match/interim-scorer";
import type { Database } from "@/types/database";

type Division = Database["public"]["Enums"]["college_division"];

const W = 300;
const H = 44;
const PAD = 6;
const DOT_R = 3.4;

const LEVEL_COLOUR: Record<Division, string> = {
  d1: "var(--viz-level-d1)",
  d2: "var(--viz-level-d2)",
  d3: "var(--viz-level-d3)",
  naia: "var(--viz-level-naia)",
  njcaa: "var(--viz-level-njcaa)",
};

function seeded(id: string): number {
  let h = 2166136261;
  for (let i = 0; i < id.length; i++) {
    h ^= id.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return ((h >>> 0) % 1000) / 1000;
}

/**
 * A compact read of the same landscape, on the dashboard. It shares the
 * scorer, the colours and the seeded jitter with the full view, so the shape a
 * player sees here is the shape they find when they open the flagship.
 */
export function LandscapeTeaser({ results }: { results: MatchResult[] }) {
  const scored = results.filter((r) => r.score !== null);
  if (scored.length === 0) return null;

  const inRange = scored.filter((r) => (r.score as number) >= IN_RANGE_THRESHOLD).length;
  const x = (score: number) => PAD + (score / 100) * (W - PAD * 2);

  return (
    <Link
      href="/college-match"
      prefetch
      className="pressable-sink focusable block bg-white border border-black/[0.07] rounded-md shadow-sm overflow-hidden hover:border-gold transition-colors dur-fast group"
    >
      <div className="px-4 pt-3.5 pb-1 flex items-baseline justify-between gap-3">
        <span className="font-condensed text-micro font-bold tracking-[0.24em] uppercase text-slate">
          The landscape
        </span>
        <span className="font-mono num text-meta text-ink-5">
          {inRange}
          <span className="text-slate"> of {scored.length} in range</span>
        </span>
      </div>

      <div className="px-4 max-w-[560px]">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          width="100%"
          role="img"
          aria-label={`${scored.length} programs by fit, ${inRange} in range`}
        >
          <line
            x1={x(IN_RANGE_THRESHOLD)}
            y1={2}
            x2={x(IN_RANGE_THRESHOLD)}
            y2={H - 2}
            stroke="var(--viz-reference)"
            strokeWidth={1}
            strokeDasharray="3 3"
          />
          {scored.map((r) => (
            <circle
              key={r.college.id}
              cx={x(r.score as number)}
              cy={DOT_R + 2 + seeded(r.college.id) * (H - DOT_R * 2 - 4)}
              r={DOT_R}
              fill={
                (r.score as number) >= IN_RANGE_THRESHOLD
                  ? LEVEL_COLOUR[r.college.division as Division]
                  : "white"
              }
              stroke={
                (r.score as number) >= IN_RANGE_THRESHOLD
                  ? "white"
                  : LEVEL_COLOUR[r.college.division as Division]
              }
              strokeWidth={1.2}
            />
          ))}
        </svg>
      </div>

      <div className="px-4 pb-3 pt-1 flex items-center justify-between gap-3">
        <span className="text-caption text-ink-5">
          Open the full landscape and try what-if
        </span>
        <ArrowRight
          size={15}
          aria-hidden
          className="text-slate group-hover:text-gold shrink-0 transition-colors dur-fast"
        />
      </div>
    </Link>
  );
}
