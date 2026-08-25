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
    return { fill: "var(--color-ink)", stroke: "var(--color-ink)", width: 1.5 };
  }
  if (status === "coach_verified") {
    return { fill: "var(--color-gold)", stroke: "var(--color-ink)", width: 1.5 };
  }
  return { fill: "white", stroke: "var(--color-slate)", width: 1.5 };
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
    <div className="py-3 border-b border-black/[0.05] last:border-0">
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
                stroke="var(--color-bone-3)"
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
            stroke="var(--color-gold)"
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
        <div className="px-4 py-6 text-center">
          {/* The dormant state is designed, not a placeholder, because most
              accounts start here. It shows the shape of what will appear and
              says plainly there is nothing yet, rather than drawing a sample
              line a player could mistake for their own data. */}
          <svg viewBox={`0 0 ${W} 56`} width="100%" aria-hidden className="mb-3 opacity-45">
            <line x1={PAD_L} y1={40} x2={W - PAD_R} y2={40} stroke="var(--color-bone-3)" strokeWidth={0.75} strokeDasharray="2 3" />
            <line x1={PAD_L} y1={22} x2={W - PAD_R} y2={22} stroke="var(--color-bone-3)" strokeWidth={0.75} strokeDasharray="2 3" />
            {[0, 1, 2, 3].map((i) => (
              <circle
                key={i}
                cx={PAD_L + i * ((W - PAD_L - PAD_R) / 3)}
                cy={31}
                r={3.4}
                fill="white"
                stroke="var(--color-bone-3)"
                strokeWidth={1.5}
              />
            ))}
          </svg>
          <p className="font-display text-title-sm font-bold text-ink text-balance">
            No measurements on file yet
          </p>
          <p className="text-caption text-ink-5 max-w-[44ch] mx-auto mt-1 text-pretty">
            Once a 60-yard dash, bat speed or velocity is recorded, each one plots here over
            time against the scale bands, so you can see the next band as a line to cross.
            Nothing is shown until it is real.
          </p>
        </div>
      ) : (
        <>
          <div className="px-4">
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
