"use client";

import { TrendingDown, TrendingUp } from "lucide-react";
import { VERIFICATION_RANKS } from "@/lib/progression";
import type { Database } from "@/types/database";

type Metric = Database["public"]["Tables"]["metrics"]["Row"];
type VerificationStatus = Database["public"]["Enums"]["verification_status"];

export interface MetricTypeInfo {
  key: string;
  label: string;
  unit: string;
  lower_is_better: boolean;
}

export interface ScaleBand {
  score: number;
  min_value: number | null;
  max_value: number | null;
}

export interface TrajectorySeries {
  type: MetricTypeInfo;
  points: Metric[];
  bands: ScaleBand[];
}

const W = 300;
const H = 96;
const PAD_L = 6;
const PAD_R = 38;
const PAD_T = 10;
const PAD_B = 16;

/** Event-verified reads as solid, self-reported as hollow. */
function pointStyle(status: VerificationStatus) {
  if (status === "event_verified") {
    return { fill: "var(--viz-verify-event)", stroke: "var(--viz-verify-event)", width: 1.5 };
  }
  if (status === "coach_verified") {
    return { fill: "var(--viz-verify-coach)", stroke: "var(--viz-verify-event)", width: 1.5 };
  }
  return { fill: "white", stroke: "var(--viz-verify-self)", width: 1.5 };
}

function Sparkline({ series }: { series: TrajectorySeries }) {
  const points = [...series.points].sort(
    (a, b) => new Date(a.measured_at).getTime() - new Date(b.measured_at).getTime()
  );

  const values = points.map((p) => Number(p.value));
  const bandEdges = series.bands
    .flatMap((b) => [b.min_value, b.max_value])
    .filter((v): v is number => v !== null);

  const all = [...values, ...bandEdges];
  const lo = Math.min(...all);
  const hi = Math.max(...all);
  const span = hi - lo || 1;

  const x = (i: number) =>
    PAD_L + (points.length === 1 ? 0 : (i / (points.length - 1)) * (W - PAD_L - PAD_R));
  // Lower-is-better metrics are drawn with better at the top, so "up" always
  // means improvement no matter which way the number runs.
  const y = (v: number) => {
    const t = (v - lo) / span;
    const normalised = series.type.lower_is_better ? t : 1 - t;
    return PAD_T + normalised * (H - PAD_T - PAD_B);
  };

  const path = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${x(i)} ${y(Number(p.value))}`)
    .join(" ");

  const first = values[0];
  const last = values[values.length - 1];
  const improved = series.type.lower_is_better ? last < first : last > first;
  const changed = values.length > 1 && last !== first;

  return (
    <div className="py-3 border-b border-black/[0.05] last:border-0 lg:border-0 max-w-[520px]">
      <div className="flex items-baseline justify-between gap-3 mb-1">
        <span className="font-condensed text-micro font-bold tracking-[0.2em] uppercase text-ink-4">
          {series.type.label}
        </span>
        <span className="inline-flex items-baseline gap-1.5">
          {changed && (
            <span className={improved ? "text-green-2" : "text-blood-2"} aria-hidden>
              {improved ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            </span>
          )}
          <span className="font-mono num text-body text-ink">{last}</span>
          <span className="text-micro text-slate">{series.type.unit}</span>
        </span>
      </div>

      <svg
        viewBox={`0 0 ${W} ${H}`}
        width="100%"
        role="img"
        aria-label={`${series.type.label} over ${points.length} measurement${points.length === 1 ? "" : "s"}, currently ${last} ${series.type.unit}`}
      >
        {series.bands.map((band) => {
          const edge = series.type.lower_is_better ? band.max_value : band.min_value;
          if (edge === null || edge < lo || edge > hi) return null;
          return (
            <g key={band.score}>
              <line
                x1={PAD_L}
                y1={y(edge)}
                x2={W - PAD_R}
                y2={y(edge)}
                stroke="var(--viz-reference)"
                strokeWidth={0.75}
                strokeDasharray="2 3"
              />
              <text
                x={W - PAD_R + 4}
                y={y(edge) + 3}
                fontSize={8}
                fontFamily="var(--font-mono)"
                fill="var(--color-slate)"
              >
                {band.score}
              </text>
            </g>
          );
        })}

        {points.length > 1 && (
          <path
            d={path}
            fill="none"
            stroke="var(--viz-projection-line)"
            strokeWidth={1.75}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}

        {points.map((p, i) => {
          const style = pointStyle(p.verification_status);
          return (
            <circle
              key={p.id}
              cx={x(i)}
              cy={y(Number(p.value))}
              r={3.4}
              fill={style.fill}
              stroke={style.stroke}
              strokeWidth={style.width}
            >
              <title>{`${p.value} ${series.type.unit} on ${p.measured_at}, ${p.verification_status.replace("_", " ")}`}</title>
            </circle>
          );
        })}
      </svg>
    </div>
  );
}

export function Trajectory({ series }: { series: TrajectorySeries[] }) {
  const withPoints = series.filter((s) => s.points.length > 0);
  // The empty state teaches every banded metric this position has, not just
  // the first one. A pitcher has velocity, a catcher has pop time, and showing
  // one of a set implied the set was one.
  const teachable = series.filter((s) => s.bands.length > 0);

  return (
    <section className="bg-white border border-black/[0.07] rounded-md shadow-sm overflow-hidden">
      <div className="px-4 pt-3.5 pb-2 border-b border-black/[0.06]">
        <h2 className="font-condensed text-micro font-bold tracking-[0.24em] uppercase text-slate">
          Trajectory
        </h2>
        <p className="text-caption text-ink-5 mt-0.5 text-pretty">
          Every measurement you have on file, oldest to newest, against the scale bands.
        </p>
      </div>

      {withPoints.length === 0 ? (
        /*
         * Dormant parity: this is drawn to the same bar as the populated
         * chart, because most accounts start here and an empty state is the
         * first thing many players will ever see. It shows the real axes and
         * the real scale bands with their real score labels, so the chart
         * teaches how it will be read before there is anything to read. What
         * it never draws is a data line, because a sample trend is
         * indistinguishable from a real one.
         */
        <div className="px-4 py-4 lg:grid lg:grid-cols-2 lg:gap-x-8 lg:items-start">
          {teachable.length > 0 ? (
            <>
              {teachable.map((entry) => {
                const edges = entry.bands
                  .map((b) => (entry.type.lower_is_better ? b.max_value : b.min_value))
                  .filter((v): v is number => v !== null);
                const lo = Math.min(...edges);
                const hi = Math.max(...edges);
                const target = entry.bands.find((b) => b.score === 8);
                const targetEdge = target
                  ? entry.type.lower_is_better
                    ? target.max_value
                    : target.min_value
                  : null;

                return (
                  <div key={entry.type.key} className="py-3 border-b border-black/[0.05] last:border-0">
                    <div className="flex items-baseline justify-between gap-3 mb-1">
                      <span className="font-condensed text-micro font-bold tracking-[0.2em] uppercase text-ink-4">
                        {entry.type.label}
                      </span>
                      <span className="text-micro text-slate">awaiting first measurement</span>
                    </div>

                    <svg
                      viewBox={`0 0 ${W} ${H}`}
                      width="100%"
                      role="img"
                      aria-label={`${entry.type.label} chart, no measurements yet. Scale bands shown.`}
                    >
                      {entry.bands.map((band) => {
                        const edge = entry.type.lower_is_better ? band.max_value : band.min_value;
                        if (edge === null) return null;
                        const t = (edge - lo) / (hi - lo || 1);
                        const yy =
                          PAD_T + (entry.type.lower_is_better ? t : 1 - t) * (H - PAD_T - PAD_B);
                        return (
                          <g key={band.score}>
                            <line
                              x1={PAD_L}
                              y1={yy}
                              x2={W - PAD_R}
                              y2={yy}
                              stroke="var(--viz-reference)"
                              strokeWidth={0.75}
                              strokeDasharray="2 3"
                            />
                            <text
                              x={W - PAD_R + 4}
                              y={yy + 3}
                              fontSize={8}
                              fontFamily="var(--font-mono)"
                              fill="var(--color-slate)"
                            >
                              {band.score}
                            </text>
                            <text
                              x={PAD_L + 2}
                              y={yy - 2}
                              fontSize={7}
                              fontFamily="var(--font-mono)"
                              fill="var(--viz-reference)"
                            >
                              {edge}
                            </text>
                          </g>
                        );
                      })}
                    </svg>

                    <p className="text-caption text-ink-5 mt-1 text-pretty">
                      {targetEdge !== null
                        ? `Those lines are the real ${entry.type.label.toLowerCase()} bands: hit ${targetEdge} ${entry.type.unit} and you are an 8.`
                        : `Those lines are the real ${entry.type.label.toLowerCase()} bands.`}
                    </p>
                  </div>
                );
              })}

              <p className="text-caption text-ink-5 pt-3 text-pretty">
                Your first logged measurement plots on the matching chart, and every one
                after it joins the line.
              </p>
            </>
          ) : (
            <p className="text-caption text-ink-5 text-pretty">
              Your first logged measurement plots here, and every one after it joins the
              line, drawn against the scale bands for that metric.
            </p>
          )}
        </div>
      ) : (
        <>
          <div className="px-4 lg:grid lg:grid-cols-2 lg:gap-x-8">
            {withPoints.map((s) => (
              <Sparkline key={s.type.key} series={s} />
            ))}
          </div>

          <div className="px-4 py-2.5 border-t border-black/[0.06] bg-bone/40 flex flex-wrap gap-x-3 gap-y-1">
            {VERIFICATION_RANKS.map((rank) => {
              const style = pointStyle(rank.status);
              return (
                <span key={rank.status} className="inline-flex items-center gap-1.5 text-micro text-ink-5">
                  <svg width="10" height="10" aria-hidden>
                    <circle cx="5" cy="5" r="3.4" fill={style.fill} stroke={style.stroke} strokeWidth={style.width} />
                  </svg>
                  {rank.label}
                </span>
              );
            })}
          </div>
        </>
      )}
    </section>
  );
}
