"use client";

import { useState, useEffect, useMemo } from "react";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface TachometerProps {
  /** Score on a 1-10 scale. Pass null for the "not yet rated" state. */
  score: number | null;
  /** Decimal places on the centre readout. Fit scores read better at 1. */
  precision?: 0 | 1;
  /** Replaces the derived level label. Use when the gauge is not showing a
   *  Scanzano-ladder rating (a program fit, for example). */
  label?: string;
  /** Shown in place of the score when score is null. */
  emptyText?: string;
  /**
   * Marks this gauge as the one that persists across a route change. Only one
   * element per page may carry a given view-transition-name, so pages set this
   * on their single primary gauge.
   */
  transitionName?: string;
  /**
   * Role-named size. hero commands a phone viewport, card sits at podium
   * prominence, inline stays legible in a dense row. The old t-shirt sizes
   * remain as aliases so existing call sites keep working.
   */
  size?: "hero" | "card" | "inline" | "sm" | "md" | "lg" | "xl";
  /** Animate the needle on mount (default true) */
  animated?: boolean;
  /** Show the level label below the score (default true) */
  showLabel?: boolean;
  className?: string;
}

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

/**
 * Sizes resolve to the --size-gauge-* tokens rather than pixel literals, so
 * the dimension lives in exactly one place. Declaring the tokens in @theme and
 * then hardcoding matching numbers here was two sources for one fact, and they
 * would have drifted the first time either changed.
 */
const SIZE_VAR: Record<NonNullable<TachometerProps["size"]>, string> = {
  inline: "var(--size-gauge-inline)",
  card: "var(--size-gauge-card)",
  hero: "var(--size-gauge-hero)",
  // Aliases onto the role scale, so no call site invents its own dimension.
  sm: "var(--size-gauge-inline)",
  md: "var(--size-gauge-card)",
  lg: "var(--size-gauge-hero)",
  xl: "var(--size-gauge-hero)",
};

/**
 * Proportions are re-tuned per tier rather than scaled uniformly. A numeral
 * that reads well at 264px is illegible at 68px if it simply shrinks with the
 * viewBox, and the level label stops being readable at arm's length long
 * before the numeral does.
 */
const PROPORTIONS: Record<
  "hero" | "card" | "inline",
  { score: number; label: number; labelY: number; showLabel: boolean; arc: number }
> = {
  // Sizes are viewBox units against a 200 unit box, so the rendered pixel size
  // is value x (px / 200). The label sizes below are set so the label lands
  // near 14px rendered at hero and 10px at card: the point where it stays
  // readable at arm's length on a phone rather than becoming a smudge under
  // the numeral. Scaling these uniformly with the box is what made the label
  // illegible at hero.
  hero: { score: 42, label: 11, labelY: 26, showLabel: true, arc: 9 },
  card: { score: 42, label: 12.5, labelY: 27, showLabel: true, arc: 8 },
  inline: { score: 54, label: 0, labelY: 0, showLabel: false, arc: 13 },
};

function tierOf(size: NonNullable<TachometerProps["size"]>) {
  if (size === "inline" || size === "sm") return "inline" as const;
  if (size === "card" || size === "md") return "card" as const;
  return "hero" as const;
}

const LEVEL_LABELS: Record<number, string> = {
  10: "Professional Prospect",
  9: "High Level Div I",
  8: "Mid Level Div I",
  7: "Lower Level Div I",
  6: "D2/D3 College Player",
  5: "Above Average HS",
  4: "Average Varsity HS",
  3: "Average JV",
  2: "Below Avg JV",
  1: "Below Avg JV",
};

/** Arc start / end in degrees (0 = 12-o'clock, CW positive) */
const ARC_START_DEG = 210;
const ARC_END_DEG = 330;
const ARC_SPAN_DEG = ARC_END_DEG - ARC_START_DEG; // 120°

const VIEWBOX = 200; // SVG viewBox is 200×200
const CX = 100;
const CY = 100;
const RADIUS = 78;

/**
 * The gauge is the brand's signature component, so it reads the same tokens as
 * everything else. A client theme swap therefore reaches it, which it did not
 * when these were hardcoded hex literals.
 */
const COLOR_GOLD = "var(--color-gold)";
const COLOR_OXBLOOD = "var(--color-blood)";
const COLOR_BRIGHT_RED = "var(--color-redline)";
const COLOR_ARC_BG = "var(--color-ink-3)";
const COLOR_BG = "var(--color-ink)";
const COLOR_TICK = "var(--color-ink-5)";
const COLOR_READOUT = "var(--color-bone-2)";
const COLOR_DORMANT = "var(--color-ink-4)";
const COLOR_DORMANT_LABEL = "var(--color-slate)";
const FONT_DISPLAY = "var(--font-display)";

const ANIMATION_DURATION_MS = 1200;

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

/** Convert a "clock" degree (0 = top, CW) to standard math radians. */
function degToRad(deg: number): number {
  return ((deg - 90) * Math.PI) / 180;
}

/** Point on a circle at the given clock-degree. */
function polarPoint(cx: number, cy: number, r: number, deg: number) {
  const rad = degToRad(deg);
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

/**
 * Build an SVG arc path from `startDeg` to `endDeg` at radius `r`
 * around center (`cx`, `cy`).
 */
function arcPath(
  cx: number,
  cy: number,
  r: number,
  startDeg: number,
  endDeg: number
): string {
  const start = polarPoint(cx, cy, r, startDeg);
  const end = polarPoint(cx, cy, r, endDeg);
  const span = endDeg - startDeg;
  const largeArc = span > 180 ? 1 : 0;
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 1 ${end.x} ${end.y}`;
}

/** Map a score (1-10) to the corresponding degree on the arc. */
function scoreToDeg(score: number): number {
  // score 1 → ARC_START_DEG, score 10 → ARC_END_DEG
  const t = (Math.min(Math.max(score, 1), 10) - 1) / 9;
  return ARC_START_DEG + t * ARC_SPAN_DEG;
}

/** Return the zone color for a given score. */
function zoneColor(score: number): string {
  if (score >= 9) return COLOR_BRIGHT_RED;
  if (score >= 7) return COLOR_OXBLOOD;
  return COLOR_GOLD;
}

/* ------------------------------------------------------------------ */
/*  Colored arc segments                                               */
/* ------------------------------------------------------------------ */

interface ArcSegment {
  startScore: number;
  endScore: number;
  color: string;
}

const ARC_SEGMENTS: ArcSegment[] = [
  { startScore: 1, endScore: 6, color: COLOR_GOLD },
  { startScore: 6, endScore: 8, color: COLOR_OXBLOOD },
  { startScore: 8, endScore: 10, color: COLOR_BRIGHT_RED },
];

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function Tachometer({
  score,
  size = "md",
  animated = true,
  showLabel = true,
  precision = 0,
  label: labelOverride,
  emptyText = "--",
  transitionName,
  className = "",
}: TachometerProps) {
  const hasScore = score !== null && Number.isFinite(score);
  // The needle uses the exact value; only the readout rounds.
  const exactScore = hasScore ? Math.min(Math.max(score as number, 1), 10) : 1;
  const clampedScore = Math.min(Math.max(Math.round(exactScore), 1), 10);

  /* ---- animation state ---- */
  const [displayDeg, setDisplayDeg] = useState<number>(
    animated ? ARC_START_DEG : scoreToDeg(exactScore)
  );

  useEffect(() => {
    const targetDeg = scoreToDeg(exactScore);

    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (!animated || !hasScore || prefersReducedMotion) {
      setDisplayDeg(targetDeg);
      return;
    }

    const startDeg = ARC_START_DEG;
    const startTime = performance.now();

    let rafId: number;

    function tick(now: number) {
      const elapsed = now - startTime;
      const t = Math.min(elapsed / ANIMATION_DURATION_MS, 1);
      // Needle physics: fast attack off the peg, then a damped settle that
      // slightly overshoots and returns. Matches --ease-needle in globals.css.
      const eased =
        t >= 1 ? 1 : 1 - Math.pow(2, -9 * t) * Math.cos(t * Math.PI * 2.15);
      setDisplayDeg(startDeg + (targetDeg - startDeg) * eased);

      if (t < 1) {
        rafId = requestAnimationFrame(tick);
      }
    }

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [exactScore, hasScore, animated]);

  /* ---- derived geometry ---- */
  const needleEnd = useMemo(
    () => polarPoint(CX, CY, RADIUS - 10, displayDeg),
    [displayDeg]
  );

  const sizeVar = SIZE_VAR[size];
  const tier = tierOf(size);
  const proportions = PROPORTIONS[tier];

  /* ---- tick marks ---- */
  const ticks = useMemo(() => {
    const result: { x1: number; y1: number; x2: number; y2: number }[] = [];
    for (let s = 1; s <= 10; s++) {
      const deg = scoreToDeg(s);
      const outer = polarPoint(CX, CY, RADIUS + 4, deg);
      const inner = polarPoint(CX, CY, RADIUS - 4, deg);
      result.push({ x1: outer.x, y1: outer.y, x2: inner.x, y2: inner.y });
    }
    return result;
  }, []);

  /* ---- label font sizing ---- */
  const scoreFontSize = proportions.score;
  const labelFontSize = proportions.label;
  // The readout sits slightly above centre so its optical mass is centred once
  // the label below is accounted for.
  const scoreY = proportions.showLabel ? CY - 6 : CY + 2;
  const labelY = CY + proportions.labelY;

  const label = labelOverride ?? (hasScore ? LEVEL_LABELS[clampedScore] ?? "" : "Not yet rated");
  const readout = hasScore ? exactScore.toFixed(precision) : emptyText;
  const needleColor = hasScore ? COLOR_GOLD : COLOR_DORMANT;

  return (
    <div
      className={`inline-flex items-center justify-center ${className}`}
      style={{
        width: sizeVar,
        height: sizeVar,
        ...(transitionName ? { viewTransitionName: transitionName } : {}),
      }}
    >
      <svg
        viewBox={`0 0 ${VIEWBOX} ${VIEWBOX}`}
        width="100%"
        height="100%"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Background circle */}
        <circle cx={CX} cy={CY} r={RADIUS + 14} fill={COLOR_BG} />

        {/* Arc background (unfilled track) */}
        <path
          d={arcPath(CX, CY, RADIUS, ARC_START_DEG, ARC_END_DEG)}
          fill="none"
          stroke={COLOR_ARC_BG}
          strokeWidth={proportions.arc}
          strokeLinecap="round"
        />

        {/* Colored arc segments */}
        {ARC_SEGMENTS.map((seg) => (
          <path
            key={seg.color}
            d={arcPath(
              CX,
              CY,
              RADIUS,
              scoreToDeg(seg.startScore),
              scoreToDeg(seg.endScore)
            )}
            fill="none"
            stroke={seg.color}
            strokeWidth={proportions.arc}
            strokeLinecap="butt"
            opacity={hasScore ? 1 : 0.28}
          />
        ))}

        {/* Tick marks */}
        {ticks.map((t, i) => (
          <line
            key={i}
            x1={t.x1}
            y1={t.y1}
            x2={t.x2}
            y2={t.y2}
            stroke={COLOR_TICK}
            strokeWidth={1.2}
          />
        ))}

        {/* Needle */}
        <line
          x1={CX}
          y1={CY}
          x2={needleEnd.x}
          y2={needleEnd.y}
          stroke={needleColor}
          strokeWidth={2}
          strokeLinecap="round"
        />

        {/* Needle pivot dot */}
        <circle cx={CX} cy={CY} r={4} fill={needleColor} />

        {/* Score text (center) */}
        <text
          x={CX}
          y={scoreY}
          textAnchor="middle"
          dominantBaseline="central"
          fill={COLOR_READOUT}
          fontSize={scoreFontSize}
          fontFamily={FONT_DISPLAY}
          fontWeight={700}
        >
          {readout}
        </text>

        {/* Level label */}
        {showLabel && proportions.showLabel && (
          <text
            x={CX}
            y={labelY}
            textAnchor="middle"
            dominantBaseline="central"
            fill={
              !hasScore
                ? COLOR_DORMANT_LABEL
                : labelOverride
                  ? COLOR_GOLD
                  : zoneColor(clampedScore)
            }
            fontSize={labelFontSize}
            fontFamily={FONT_DISPLAY}
            fontWeight={600}
            letterSpacing={0.4}
            opacity={0.92}
          >
            {label}
          </text>
        )}
      </svg>
    </div>
  );
}

export default Tachometer;
