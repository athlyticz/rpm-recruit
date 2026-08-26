"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Tachometer } from "@/components/ui/tachometer";
import { Reveal } from "@/components/marketing/reveal";
import { scoreFromBands, bandRange, bandTicks } from "@/lib/match/bands";
import { IN_RANGE_THRESHOLD, scoreAll, type MatchResult } from "@/lib/match/interim-scorer";
import {
  FASTBALL_BANDS,
  SAMPLE_PLAYER,
  SAMPLE_OVERALL,
  SAMPLE_RATINGS,
  SAMPLE_SKILL_COUNT,
  SAMPLE_VELOCITY,
  SAMPLE_VELOCITY_HISTORY,
} from "@/lib/demo/sample-player";

/* ------------------------------------------------------------------ */
/*  Shared chrome                                                      */
/* ------------------------------------------------------------------ */

const LEVEL_COLOUR: Record<string, string> = {
  d1: "var(--viz-level-d1)",
  d2: "var(--viz-level-d2)",
  d3: "var(--viz-level-d3)",
  naia: "var(--viz-level-naia)",
  njcaa: "var(--viz-level-njcaa)",
};

/**
 * Every demo surface on this page carries this. The page is a sales pitch, so
 * the one thing it cannot do is let a made-up profile read as somebody's real
 * result.
 */
function SampleTag({ children }: { children: string }) {
  return (
    <p className="font-condensed text-micro font-bold tracking-[0.2em] uppercase text-slate mt-3">
      <span className="border border-dashed border-bone-3 rounded-xs px-1.5 py-0.5 mr-2">
        Sample
      </span>
      {children}
    </p>
  );
}

function ActHeading({
  index,
  eyebrow,
  title,
  children,
}: {
  index: string;
  eyebrow: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Reveal className="max-w-[54ch]">
      <p className="font-condensed text-label font-bold tracking-[0.24em] uppercase text-gold mb-2">
        <span className="font-mono num text-ink-5 mr-2">{index}</span>
        {eyebrow}
      </p>
      <h2 className="font-display text-display-lg lg:text-numeral font-bold text-ink leading-none text-balance">
        {title}
      </h2>
      <div className="text-body-lg text-ink-5 leading-relaxed mt-3 text-pretty">
        {children}
      </div>
    </Reveal>
  );
}

/* ------------------------------------------------------------------ */
/*  Act one: the landscape assembles                                   */
/* ------------------------------------------------------------------ */

const PLOT_W = 640;
const PLOT_H = 158;
const PLOT_PAD = 22;

interface Dot {
  id: string;
  x: number;
  y: number;
  division: string;
  score: number;
  order: number;
}

/**
 * Beeswarm packing: dots keep their true x and step sideways in y only when
 * they would otherwise overlap, so the horizontal axis stays exact.
 */
function pack(results: MatchResult[]): Dot[] {
  const scored = results
    .filter((r): r is MatchResult & { score: number } => r.score !== null)
    .sort((a, b) => b.score - a.score);

  const rows: number[][] = [];
  const dots: Dot[] = [];

  scored.forEach((result, order) => {
    const x = PLOT_PAD + (result.score / 100) * (PLOT_W - PLOT_PAD * 2);
    let row = 0;
    while (rows[row]?.some((taken) => Math.abs(taken - x) < 13)) row += 1;
    rows[row] = [...(rows[row] ?? []), x];

    dots.push({
      id: result.college.id,
      x,
      y: PLOT_H - PLOT_PAD - 12 - row * 13,
      division: result.college.division,
      score: result.score,
      order,
    });
  });

  return dots;
}

function Landscape({ results }: { results: MatchResult[] }) {
  const dots = useMemo(() => pack(results), [results]);
  const [shown, setShown] = useState(false);
  const ref = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setShown(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setShown(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const threshold =
    PLOT_PAD + (IN_RANGE_THRESHOLD / 100) * (PLOT_W - PLOT_PAD * 2);
  const inRange = dots.filter((d) => d.score >= IN_RANGE_THRESHOLD).length;

  const levels = useMemo(() => {
    const counts = new Map<string, number>();
    for (const dot of dots) counts.set(dot.division, (counts.get(dot.division) ?? 0) + 1);
    return [...counts.entries()].sort((a, b) => b[1] - a[1]);
  }, [dots]);

  return (
    <div className="bg-white border border-black/[0.07] rounded-md shadow-sm overflow-hidden">
      <div className="flex items-baseline justify-between gap-3 px-4 pt-3.5 pb-2">
        <h3 className="font-condensed text-micro font-bold tracking-[0.24em] uppercase text-slate">
          Every program, scored
        </h3>
        <p className="font-mono num text-meta text-ink-5">
          <span className="text-ink font-bold">{inRange}</span> of {dots.length} in range
        </p>
      </div>

      <svg
        ref={ref}
        viewBox={`0 0 ${PLOT_W} ${PLOT_H}`}
        className="w-full h-auto"
        role="img"
        aria-label={`${dots.length} programs plotted by fit score for the sample player. ${inRange} score at or above ${IN_RANGE_THRESHOLD}.`}
      >
        <line
          x1={PLOT_PAD}
          x2={PLOT_W - PLOT_PAD}
          y1={PLOT_H - PLOT_PAD}
          y2={PLOT_H - PLOT_PAD}
          stroke="var(--viz-reference)"
          strokeWidth={1}
        />
        <line
          x1={threshold}
          x2={threshold}
          y1={12}
          y2={PLOT_H - PLOT_PAD}
          stroke="var(--viz-reference)"
          strokeWidth={1}
          strokeDasharray="3 3"
        />
        <text
          x={threshold + 6}
          y={20}
          className="font-condensed plot-label"
          letterSpacing="1.6"
          fill="var(--viz-label)"
        >
          IN RANGE
        </text>

        {[0, 25, 50, 75, 100].map((tick) => (
          <text
            key={tick}
            x={PLOT_PAD + (tick / 100) * (PLOT_W - PLOT_PAD * 2)}
            y={PLOT_H - 6}
            textAnchor="middle"
            className="font-mono plot-label"
            fill="var(--viz-label)"
          >
            {tick}
          </text>
        ))}

        {dots.map((dot) => (
          <circle
            key={dot.id}
            className="dot-settle plot-dot"
            data-shown={shown ? "true" : "false"}
            style={
              {
                transitionDelay: `${Math.min(dot.order * 18, 620)}ms`,
                "--dot-drop": `${PLOT_H - PLOT_PAD - dot.y}px`,
              } as React.CSSProperties
            }
            cx={dot.x}
            cy={dot.y}
            r={5}
            fill={
              dot.score >= IN_RANGE_THRESHOLD
                ? LEVEL_COLOUR[dot.division] ?? "var(--color-slate)"
                : "white"
            }
            stroke={LEVEL_COLOUR[dot.division] ?? "var(--color-slate)"}
            strokeWidth={1.5}
          />
        ))}
      </svg>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 px-4 pb-3.5">
        {levels.map(([division, count]) => (
          <span
            key={division}
            className="inline-flex items-center gap-1.5 font-condensed text-micro font-bold tracking-[0.16em] uppercase text-ink-4"
          >
            <span
              className="w-2 h-2 rounded-pill"
              style={{ background: LEVEL_COLOUR[division] ?? "var(--color-slate)" }}
            />
            {division}
            <span className="font-mono num text-slate">{count}</span>
          </span>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Act two: the lever                                                 */
/* ------------------------------------------------------------------ */

function Lever({
  velocity,
  rating,
  overall,
  moved,
  inRange,
  realInRange,
  total,
  best,
  onVelocity,
  onRating,
  onReset,
}: {
  velocity: number;
  rating: number | null;
  overall: number;
  moved: boolean;
  inRange: number;
  realInRange: number;
  total: number;
  best: { name: string; score: number } | null;
  onVelocity: (value: number) => void;
  onRating: (value: number) => void;
  onReset: () => void;
}) {
  const range = bandRange(FASTBALL_BANDS, true);
  const ticks = bandTicks(FASTBALL_BANDS, true);
  const gained = inRange - realInRange;

  return (
    <div className="bg-white border border-black/[0.07] rounded-md shadow-sm overflow-hidden">
      <div className="flex items-baseline justify-between gap-3 px-4 pt-3.5 pb-2">
        <h3 className="font-condensed text-micro font-bold tracking-[0.24em] uppercase text-slate">
          What if
        </h3>
        {moved && (
          <span className="font-condensed text-micro font-bold tracking-[0.14em] uppercase text-ink-4 border border-dashed border-ink-4 rounded-xs px-1.5 py-0.5">
            Projection
          </span>
        )}
      </div>

      <div className="px-4 pb-4">
        {/* Lever one: a measurable, translated through the published bands. */}
        <div className="flex items-baseline justify-between gap-3">
          <label htmlFor="landing-velocity" className="text-body text-ink-4">
            Fastball velocity
          </label>
          <span className="font-mono num text-body text-ink-5">
            <span className="text-ink font-bold">{velocity}</span> mph
            {rating !== null && (
              <>
                <span className="text-slate"> = </span>
                {/* Keyed on the rating so crossing a band boundary remounts
                    this and replays the beat. The bands are the pedagogy. */}
                <span
                  key={rating}
                  className="inline-block font-bold text-ink motion-safe:animate-tick"
                >
                  {rating}
                </span>
              </>
            )}
          </span>
        </div>

        {/* Band edges, drawn where they actually fall on the scale. */}
        <div className="relative h-3 mt-1" aria-hidden>
          {ticks.map((tick) => {
            const current = rating === tick.score;
            return (
              <span
                key={tick.score}
                className="absolute -translate-x-1/2 flex flex-col items-center"
                style={{ left: `${tick.at * 100}%` }}
              >
                <span className={`w-px ${current ? "bg-ink h-2" : "bg-bone-3 h-1.5"}`} />
                <span
                  className={`font-mono text-micro leading-none ${
                    current ? "text-ink font-bold" : "text-bone-3"
                  }`}
                >
                  {tick.score}
                </span>
              </span>
            );
          })}
        </div>

        <input
          id="landing-velocity"
          type="range"
          min={range.min}
          max={range.max}
          step={1}
          value={velocity}
          onChange={(e) => onVelocity(Number(e.target.value))}
          className="w-full accent-gold mt-1.5"
        />

        {/*
          Lever two: the rating itself. The velocity lever moves one of eight
          rated skills, which is honestly small. This one asks the bigger
          question a player is actually asking, and it is the same lever the
          app offers on the match screen.
        */}
        <div className="flex items-baseline justify-between gap-3 mt-5">
          <label htmlFor="landing-rating" className="text-body text-ink-4">
            Overall showcase rating
          </label>
          <span className="font-mono num text-body text-ink-5">
            <span className="text-ink font-bold">{overall.toFixed(1)}</span>
            {moved && <span className="text-slate"> was {SAMPLE_OVERALL.toFixed(1)}</span>}
          </span>
        </div>
        <input
          id="landing-rating"
          type="range"
          min={1}
          max={10}
          step={0.1}
          value={overall}
          onChange={(e) => onRating(Number(e.target.value))}
          className="w-full accent-gold mt-1.5"
        />

        <dl className="grid grid-cols-2 gap-3 mt-5 pt-3 border-t border-black/[0.06]">
          <div>
            <dt className="font-condensed text-micro font-bold tracking-[0.2em] uppercase text-slate">
              Programs in range
            </dt>
            <dd className="font-display num text-display-sm font-bold text-ink leading-none mt-1">
              {inRange}
              <span className="font-mono text-meta text-slate ml-2">of {total}</span>
              {moved && (
                <span className="font-mono text-meta text-ink-4 ml-2">
                  {gained === 0 ? "no change" : gained > 0 ? `+${gained}` : gained}
                </span>
              )}
            </dd>
          </div>
          <div>
            <dt className="font-condensed text-micro font-bold tracking-[0.2em] uppercase text-slate">
              Best fit
            </dt>
            <dd className="font-display num text-display-sm font-bold text-ink leading-none mt-1">
              {best ? best.score : "--"}
              {best && (
                <span className="font-body text-meta text-slate ml-2">{best.name}</span>
              )}
            </dd>
          </div>
        </dl>

        <p className="text-caption text-ink-5 mt-3 text-pretty">
          The overall rating is the mean of {SAMPLE_SKILL_COUNT} rated skills, so
          four miles an hour moves it by a tenth. That is the honest arithmetic,
          and it is why this product does not sell one number as a shortcut.
        </p>

        {moved && (
          <button
            type="button"
            onClick={onReset}
            className="pressable focusable mt-1 inline-flex items-center min-h-touch font-condensed text-micro font-bold tracking-[0.16em] uppercase text-ink-4 hover:text-gold transition-colors dur-fast"
          >
            Back to the sample
          </button>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Act three: the trajectory draws itself                             */
/* ------------------------------------------------------------------ */

const TRAJ_W = 640;
const TRAJ_H = 170;

const VERIFY_STYLE: Record<string, { fill: string; label: string }> = {
  self_reported: { fill: "white", label: "Self reported" },
  coach_verified: { fill: "var(--viz-verify-coach)", label: "Coach verified" },
  event_verified: { fill: "var(--viz-verify-event)", label: "Event verified" },
};

function TrajectoryDemo() {
  const points = SAMPLE_VELOCITY_HISTORY;
  const values = points.map((p) => p.value);
  const lo = Math.min(...values) - 3;
  const hi = Math.max(...values) + 3;

  const x = (i: number) => 34 + (i / (points.length - 1)) * (TRAJ_W - 34 - 54);
  const y = (v: number) => 20 + (1 - (v - lo) / (hi - lo)) * (TRAJ_H - 20 - 34);

  const path = points.map((p, i) => `${i === 0 ? "M" : "L"}${x(i)},${y(p.value)}`).join(" ");

  return (
    <div className="bg-white border border-black/[0.07] rounded-md shadow-sm overflow-hidden">
      <h3 className="font-condensed text-micro font-bold tracking-[0.24em] uppercase text-slate px-4 pt-3.5">
        Fastball velocity, oldest to newest
      </h3>

      <Reveal effect="wipe" className="block">
        <svg
          viewBox={`0 0 ${TRAJ_W} ${TRAJ_H}`}
          className="w-full h-auto"
          role="img"
          aria-label={`Four fastball velocity readings for the sample player, from ${values[0]} to ${values[values.length - 1]} miles per hour.`}
        >
          {FASTBALL_BANDS.filter(
            (b) => b.min_value !== null && b.min_value >= lo && b.min_value <= hi
          ).map((band) => (
            <g key={band.score}>
              <line
                x1={34}
                x2={TRAJ_W - 54}
                y1={y(band.min_value as number)}
                y2={y(band.min_value as number)}
                stroke="var(--viz-reference)"
                strokeWidth={0.5}
                strokeDasharray="2 4"
              />
              <text
                x={TRAJ_W - 48}
                y={y(band.min_value as number) + 3}
                className="font-mono plot-label"
                fill="var(--viz-label)"
              >
                {band.score}
              </text>
            </g>
          ))}

          <path d={path} fill="none" stroke="var(--color-ink)" strokeWidth={1.75} />

          {points.map((point, i) => {
            const style = VERIFY_STYLE[point.verification_status];
            return (
              <g key={point.id}>
                <circle
                  className="plot-dot"
                  cx={x(i)}
                  cy={y(point.value)}
                  r={5}
                  fill={style.fill}
                  stroke="var(--viz-verify-event)"
                  strokeWidth={1.5}
                />
                <text
                  x={x(i)}
                  y={TRAJ_H - 14}
                  textAnchor="middle"
                  className="font-mono plot-label"
                  fill="var(--viz-label)"
                >
                  {point.value}
                </text>
              </g>
            );
          })}
        </svg>
      </Reveal>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 px-4 pb-3.5">
        {Object.entries(VERIFY_STYLE).map(([key, style]) => (
          <span
            key={key}
            className="inline-flex items-center gap-1.5 font-condensed text-micro font-bold tracking-[0.16em] uppercase text-ink-4"
          >
            <span
              className="w-2.5 h-2.5 rounded-pill border-[1.5px]"
              style={{ background: style.fill, borderColor: "var(--viz-verify-event)" }}
            />
            {style.label}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  The stage                                                          */
/* ------------------------------------------------------------------ */

export function PitchStage({ results }: { results: MatchResult[] }) {
  const stageRef = useRef<HTMLDivElement | null>(null);
  const [progress, setProgress] = useState(0);
  /*
   * One draft at a time, named by which lever produced it. Two independent
   * values could disagree with each other on screen, and a demo that shows
   * two answers at once is worse than no demo.
   */
  const [draft, setDraft] = useState<
    { kind: "velocity" | "rating"; value: number } | null
  >(null);

  const velocity = draft?.kind === "velocity" ? draft.value : SAMPLE_VELOCITY;

  /*
   * The needle answers to the scroll position, but it never invents a number:
   * it sweeps from the peg up to the sample player's real showcase rating and
   * stops there. Past that point the only thing that moves it is the visitor's
   * own hand on the lever.
   */
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setProgress(1);
      return;
    }

    let frame = 0;
    let queued = false;

    function measure() {
      queued = false;
      const el = stageRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const start = window.innerHeight * 0.85;
      const end = window.innerHeight * 0.25;
      const raw = (start - rect.top) / (start - end);
      // Quantised, so a scroll produces a handful of renders rather than one
      // per frame. The needle reads the same and the phone stays cool.
      const next = Math.max(0, Math.min(1, Math.round(raw * 40) / 40));
      setProgress((current) => (current === next ? current : next));
    }

    function onScroll() {
      if (queued) return;
      queued = true;
      frame = requestAnimationFrame(measure);
    }

    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  const projectedRating = scoreFromBands(velocity, FASTBALL_BANDS);
  const moved = draft !== null;

  const projectedOverall = useMemo(() => {
    if (draft?.kind === "rating") return Math.round(draft.value * 10) / 10;
    if (projectedRating === null) return SAMPLE_OVERALL;
    const ratings = { ...SAMPLE_RATINGS, fastball_velocity: projectedRating };
    const values = Object.values(ratings);
    return Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 10) / 10;
  }, [draft, projectedRating]);

  /*
   * The fit scores are recomputed rather than approximated: the showcase
   * rating is what the athletic component reads, so moving it genuinely
   * re-ranks the field, by the same scorer, exactly as it would in the app.
   * That includes fits going down, which happens when a stronger player
   * becomes a worse match for a lower division.
   */
  const colleges = useMemo(() => results.map((r) => r.college), [results]);

  const rescored = useMemo(() => {
    if (!moved) return results;
    return scoreAll({ ...SAMPLE_PLAYER, overall_score: projectedOverall }, colleges);
  }, [moved, projectedOverall, colleges, results]);

  const countInRange = (list: MatchResult[]) =>
    list.filter((r) => r.score !== null && r.score >= IN_RANGE_THRESHOLD).length;

  const realInRange = countInRange(results);
  const shownInRange = countInRange(rescored);

  const best = useMemo(() => {
    const top = rescored
      .filter((r): r is MatchResult & { score: number } => r.score !== null)
      .sort((a, b) => b.score - a.score)[0];
    return top ? { name: top.college.name, score: top.score } : null;
  }, [rescored]);

  const gaugeScore = moved
    ? projectedOverall
    : Math.max(1, SAMPLE_OVERALL * (0.18 + 0.82 * progress));

  const scoredCount = results.filter((r) => r.score !== null).length;

  const setVelocity = useCallback(
    (value: number) => setDraft({ kind: "velocity", value }),
    []
  );
  const setRating = useCallback(
    (value: number) => setDraft({ kind: "rating", value }),
    []
  );
  const reset = useCallback(() => setDraft(null), []);

  return (
    <div ref={stageRef} className="bg-bone">
      {/* The gauge, on a phone: a slim strip that stays with you. */}
      <div className="lg:hidden sticky top-topbar z-30 bg-bone/95 backdrop-blur-sm border-b border-black/[0.06]">
        <div className="flex items-center gap-3 px-gutter py-2">
          <Tachometer
            score={gaugeScore}
            size="inline"
            precision={1}
            animated={false}
            showLabel={false}
          />
          <div className="min-w-0">
            <p className="font-condensed text-micro font-bold tracking-[0.2em] uppercase text-slate">
              Sample player
            </p>
            <p className="text-caption text-ink-5">
              {moved ? "Projected showcase rating" : "Showcase rating"}
            </p>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-gutter lg:px-6 py-14 lg:py-24">
        {/* No items-start: the gauge column has to stretch to the row height or
            its sticky child has nothing to travel inside. */}
        <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_260px] lg:gap-16">
          <div className="flex flex-col gap-16 lg:gap-28 min-w-0">
            {/* Act one */}
            <section>
              <ActHeading
                index="01"
                eyebrow="The landscape"
                title="Every program, on one honest line."
              >
                <p>
                  The sample profile below is scored against the whole program
                  database at once, on the same five components the app uses:
                  athletic projection, academics, cost, majors, distance. No
                  floors, no padding. A bad fit scores badly and stays on the
                  chart where you can see it.
                </p>
              </ActHeading>

              <Reveal className="mt-6 block" delay={80}>
                {results.length > 0 ? (
                  <>
                    <Landscape results={rescored} />
                    <SampleTag>
                      Fictional player, real program database, real scorer.
                    </SampleTag>
                  </>
                ) : (
                  <p className="text-body text-ink-5">
                    The live sample runs against the program database, which is
                    not reachable from this page right now.
                  </p>
                )}
              </Reveal>
            </section>

            {/* Act two */}
            <section>
              <ActHeading
                index="02"
                eyebrow="The lever"
                title="Move a real number and watch what it costs."
              >
                <p>
                  Drag the velocity. It runs through the published showcase
                  bands to a 1 to 10 rating, the rating moves the mean, and the
                  mean is what the scorer reads. Nothing is saved and nothing
                  here is yours yet.
                </p>
              </ActHeading>

              <Reveal className="mt-6 block" delay={80}>
                <Lever
                  velocity={velocity}
                  rating={projectedRating}
                  overall={projectedOverall}
                  moved={moved}
                  inRange={shownInRange}
                  realInRange={realInRange}
                  total={scoredCount}
                  best={best}
                  onVelocity={setVelocity}
                  onRating={setRating}
                  onReset={reset}
                />
                <SampleTag>
                  Published bands, fictional profile, nothing recorded.
                </SampleTag>
              </Reveal>
            </section>

            {/* Act three */}
            <section>
              <ActHeading
                index="03"
                eyebrow="The record"
                title="Progress you can hand to a coach."
              >
                <p>
                  Every measurement keeps the level of proof it arrived with.
                  Self reported stays hollow, coach verified and event verified
                  fill in. A coach can see which is which, which is the only
                  reason the number is worth anything to them.
                </p>
              </ActHeading>

              <Reveal className="mt-6 block" delay={80}>
                <TrajectoryDemo />
                <SampleTag>Fictional measurement history.</SampleTag>
              </Reveal>
            </section>
          </div>

          {/* The gauge, on a desktop: it rides alongside the whole pitch. */}
          <aside className="hidden lg:block">
            <div className="sticky top-28 bg-ink border border-ink-3 rounded-lg p-5 flex flex-col items-center text-center">
              <Tachometer
                score={gaugeScore}
                size="card"
                precision={1}
                animated={false}
                label={moved ? "Projected" : "Showcase rating"}
              />
              <p className="font-condensed text-micro font-bold tracking-[0.2em] uppercase text-gold mt-3">
                Sample player
              </p>
              <p className="text-caption text-slate-2 mt-1 max-w-[24ch] text-pretty">
                {moved
                  ? "Projected from your drag. Nothing is saved."
                  : "A fictional right-handed pitcher, class of 2027."}
              </p>
              <Link
                href="/signup"
                className="pressable focusable press-redline mt-5 inline-flex items-center min-h-touch font-condensed text-label font-bold tracking-[0.16em] uppercase bg-gold text-ink px-5 rounded-sm hover:bg-gold-2 transition-colors dur-fast"
              >
                Score your own
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
