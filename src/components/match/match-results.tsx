"use client";

import { useMemo, useState } from "react";
import { ChevronDown, Info, MapPin, ExternalLink, Trophy } from "lucide-react";
import { Tachometer } from "@/components/ui/tachometer";
import { LEVELS, type Division } from "./level-constants";
import type { MatchResult, ScoreComponent } from "@/lib/match/interim-scorer";

/* ------------------------------------------------------------------ */
/*  Presentation helpers                                               */
/* ------------------------------------------------------------------ */

/** Fit bands. Deliberately blunt: a bad fit reads as a bad fit. */
function fitBand(score: number): { label: string; text: string; bar: string } {
  if (score >= 80) return { label: "Strong fit", text: "text-green-2", bar: "bg-green-2" };
  if (score >= 65) return { label: "Realistic", text: "text-gold-2", bar: "bg-gold" };
  if (score >= 45) return { label: "Reach", text: "text-gold", bar: "bg-gold/70" };
  return { label: "Long shot", text: "text-blood-2", bar: "bg-blood-2" };
}

/** Staggered entrance, capped so a long list never feels slow. */
function stagger(index: number): React.CSSProperties {
  return { animationDelay: `${Math.min(index, 8) * 45}ms` };
}

const PODIUM = [
  { ring: "border-gold shadow-gold", chip: "bg-gold text-ink", label: "Best fit" },
  { ring: "border-bone-3", chip: "bg-ink text-gold-3", label: "Runner up" },
  { ring: "border-bone-3", chip: "bg-ink text-gold-3", label: "Third" },
];

/* ------------------------------------------------------------------ */
/*  Score breakdown                                                    */
/* ------------------------------------------------------------------ */

function ComponentBar({ component }: { component: ScoreComponent }) {
  const unavailable = component.score === null;
  const pct = component.score ?? 0;

  return (
    <div className="py-2.5 border-b border-black/[0.05] last:border-0">
      <div className="flex items-baseline justify-between gap-3 mb-1.5">
        <span className="font-condensed text-label font-bold tracking-[0.16em] uppercase text-ink-4">
          {component.label}
        </span>
        <span
          className={`font-mono text-meta tabular-nums ${unavailable ? "text-slate" : "text-ink"}`}
        >
          {unavailable ? "no data" : `${Math.round(pct)} / 100`}
        </span>
      </div>

      <div className="h-1.5 bg-bone-2 rounded-pill overflow-hidden mb-1.5">
        <div
          className={`h-full rounded-pill transition-[width] dur-slow ease-needle ${
            unavailable ? "bg-bone-3" : fitBand(pct).bar
          }`}
          style={{ width: unavailable ? "100%" : `${pct}%`, opacity: unavailable ? 0.4 : 1 }}
        />
      </div>

      <p className="text-caption text-ink-5 text-pretty">{component.explanation}</p>

      {!unavailable && (
        <p className="font-mono text-micro text-slate mt-1 tabular-nums">
          contributes {component.contribution.toFixed(1)} of {Math.round(component.weight * 100)}% weight
        </p>
      )}
    </div>
  );
}

function Breakdown({ result }: { result: MatchResult }) {
  const { college, components } = result;

  return (
    <div className="px-4 pb-4 pt-1 bg-bone/40 border-t border-black/[0.05]">
      <p className="font-condensed text-label font-bold tracking-[0.2em] uppercase text-gold mb-1">
        Why this score
      </p>

      {components.map((component) => (
        <ComponentBar key={component.key} component={component} />
      ))}

      {college.program_notes && (
        <p className="text-caption text-ink-5 mt-3 pt-3 border-t border-black/[0.05] text-pretty">
          {college.program_notes}
        </p>
      )}

      {college.college_board_slug && (
        <a
          href={`https://bigfuture.collegeboard.org/colleges/${college.college_board_slug}`}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-flex items-center gap-1.5 min-h-touch font-condensed text-label font-bold tracking-[0.16em] uppercase text-ink-4 hover:text-gold transition-colors dur-fast"
        >
          College Board profile
          <ExternalLink size={12} aria-hidden />
        </a>
      )}
    </div>
  );
}

/** Height-animated disclosure using the grid 0fr to 1fr technique. */
function Collapse({ open, children }: { open: boolean; children: React.ReactNode }) {
  return (
    <div
      className={`grid transition-[grid-template-rows] dur-base ease-sweep ${
        open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
      }`}
    >
      <div className="overflow-hidden min-h-0">{children}</div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Result cards                                                       */
/* ------------------------------------------------------------------ */

function PodiumCard({
  result,
  rank,
  index,
}: {
  result: MatchResult;
  rank: number;
  index: number;
}) {
  const [open, setOpen] = useState(false);
  const { college, score } = result;
  const band = score === null ? null : fitBand(score);
  const style = PODIUM[rank - 1];
  const first = rank === 1;

  return (
    <article
      style={stagger(index)}
      className={`bg-white border-2 rounded-lg shadow-sm overflow-hidden motion-safe:animate-rise ${style.ring}`}
    >
      <div className={`flex items-center gap-2 px-4 pt-3 ${first ? "" : "pb-0"}`}>
        <span
          className={`inline-flex items-center gap-1.5 font-condensed text-micro font-bold tracking-[0.18em] uppercase px-2 py-1 rounded-xs ${style.chip}`}
        >
          {first && <Trophy size={11} aria-hidden />}
          {style.label}
        </span>
        <span className="font-mono text-micro text-slate tabular-nums">#{rank}</span>
      </div>

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="w-full text-left px-4 pt-2 pb-3.5 min-h-touch flex items-start gap-3 active:bg-bone/40 transition-colors dur-fast"
      >
        <span className="flex-1 min-w-0">
          <span
            className={`block font-display font-bold text-ink text-balance ${
              first ? "text-display-sm" : "text-title-lg"
            }`}
          >
            {college.short_name ?? college.name}
          </span>

          <span className="flex flex-wrap items-center gap-x-2.5 gap-y-1 mt-1.5">
            <span className="font-condensed text-micro font-bold tracking-[0.14em] uppercase px-1.5 py-0.5 bg-ink text-gold-3 rounded-xs">
              {college.division.toUpperCase()}
            </span>
            <span className="inline-flex items-center gap-1 text-meta text-slate">
              <MapPin size={11} aria-hidden />
              {college.state}
            </span>
            {college.net_price_avg !== null && (
              <span className="font-mono text-meta text-ink-5 tabular-nums">
                ${college.net_price_avg.toLocaleString()}/yr
              </span>
            )}
          </span>
        </span>

        <span className="text-right shrink-0 pl-1">
          <span
            className={`block font-display font-bold leading-none tabular-nums text-ink ${
              first ? "text-numeral" : "text-display-xl"
            }`}
          >
            {score === null ? "--" : score.toFixed(0)}
          </span>
          {band && (
            <span
              className={`block font-condensed text-micro font-bold tracking-[0.14em] uppercase mt-1 ${band.text}`}
            >
              {band.label}
            </span>
          )}
        </span>

        <ChevronDown
          size={17}
          aria-hidden
          className={`text-slate shrink-0 mt-1.5 transition-transform dur-base ease-settle ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      <Collapse open={open}>
        <Breakdown result={result} />
      </Collapse>
    </article>
  );
}

function ListRow({
  result,
  rank,
  index,
}: {
  result: MatchResult;
  rank: number;
  index: number;
}) {
  const [open, setOpen] = useState(false);
  const { college, score } = result;
  const band = score === null ? null : fitBand(score);

  return (
    <article
      style={stagger(index)}
      className="bg-white border border-black/[0.07] rounded-md shadow-sm overflow-hidden motion-safe:animate-rise"
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="w-full text-left px-4 py-3 min-h-touch flex items-center gap-3 active:bg-bone/40 transition-colors dur-fast"
      >
        <span className="font-mono text-meta text-slate tabular-nums w-5 shrink-0">{rank}</span>

        <span className="flex-1 min-w-0">
          <span className="block font-display text-title-sm font-bold text-ink truncate">
            {college.short_name ?? college.name}
          </span>
          <span className="flex items-center gap-x-2 gap-y-0.5 flex-wrap mt-0.5">
            <span className="font-condensed text-micro font-bold tracking-[0.14em] uppercase text-ink-5">
              {college.division.toUpperCase()}
            </span>
            <span className="text-meta text-slate">{college.state}</span>
            {college.net_price_avg !== null && (
              <span className="font-mono text-meta text-slate tabular-nums">
                ${college.net_price_avg.toLocaleString()}
              </span>
            )}
          </span>
        </span>

        <span className="text-right shrink-0">
          <span className="block font-display text-title-lg font-bold text-ink leading-none tabular-nums">
            {score === null ? "--" : score.toFixed(0)}
          </span>
          {band && (
            <span className={`block font-condensed text-micro font-bold tracking-[0.14em] uppercase ${band.text}`}>
              {band.label}
            </span>
          )}
        </span>

        <ChevronDown
          size={15}
          aria-hidden
          className={`text-slate shrink-0 transition-transform dur-base ease-settle ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      <Collapse open={open}>
        <Breakdown result={result} />
      </Collapse>
    </article>
  );
}

function EmptyLevel({ division }: { division: Division }) {
  const meta = LEVELS.find((l) => l.key === division)!;
  return (
    <div className="bg-white border border-dashed border-bone-3 rounded-md px-5 py-6 text-center motion-safe:animate-rise">
      <p className="font-display text-title font-bold text-ink mb-1.5 text-balance">
        {meta.emptyHeadline}
      </p>
      <p className="text-caption text-ink-5 max-w-[46ch] mx-auto text-pretty">{meta.emptyBody}</p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Screen                                                             */
/* ------------------------------------------------------------------ */

export function MatchResults({
  results,
  missingComponents,
  hasPlayer,
}: {
  results: MatchResult[];
  missingComponents: string[];
  hasPlayer: boolean;
}) {
  const [level, setLevel] = useState<Division>("d1");

  const byLevel = useMemo(() => {
    const map = new Map<Division, MatchResult[]>();
    for (const meta of LEVELS) map.set(meta.key, []);
    for (const result of results) {
      map.get(result.college.division as Division)?.push(result);
    }
    return map;
  }, [results]);

  const top = results[0];
  const active = byLevel.get(level) ?? [];
  const podium = active.slice(0, 3);
  const rest = active.slice(3);

  return (
    <div className="space-y-4">
      {/* ── Hero: the gauge ─────────────────────────────────────── */}
      <section className="bg-ink rounded-lg border border-ink-2 overflow-hidden">
        <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 px-5 py-6">
          <Tachometer
            score={top?.score !== null && top?.score !== undefined ? top.score / 10 : null}
            size="lg"
            precision={1}
            label={top ? "Top Program Fit" : "No programs scored"}
            className="shrink-0 max-w-full"
          />

          <div className="text-center sm:text-left min-w-0">
            <p className="font-condensed text-label font-bold tracking-[0.22em] uppercase text-gold mb-1">
              Best current fit
            </p>
            {top ? (
              <>
                <p className="font-display text-display font-bold text-bone text-balance">
                  {top.college.short_name ?? top.college.name}
                </p>
                <p className="text-caption text-slate-2 mt-1.5 text-pretty">
                  {top.college.division.toUpperCase()} in {top.college.state}. Scored{" "}
                  <span className="font-mono text-bone">{top.score?.toFixed(0)}</span> out of 100
                  across {top.components.filter((c) => c.score !== null).length} of{" "}
                  {top.components.length} components.
                </p>
              </>
            ) : (
              <p className="text-body text-slate-2 max-w-[42ch]">
                No programs are loaded yet, so there is nothing to score.
              </p>
            )}
          </div>
        </div>

        {missingComponents.length > 0 && (
          <div className="border-t border-ink-3 bg-blood/[0.14] px-5 py-3 flex gap-2.5">
            <Info size={15} className="text-gold shrink-0 mt-0.5" aria-hidden />
            <p className="text-caption text-bone-2 text-pretty">
              These scores exclude {missingComponents.join(" and ").toLowerCase()}, which
              {missingComponents.length === 1 ? " has" : " have"} no data yet. The remaining
              components were reweighted to fill the gap, so every number here is real but
              incomplete.
              {!hasPlayer && " Create your player profile to score against your own data."}
            </p>
          </div>
        )}
      </section>

      {/* ── Level selector ──────────────────────────────────────── */}
      <div
        role="tablist"
        aria-label="Division level"
        className="flex gap-1.5 overflow-x-auto -mx-gutter px-gutter lg:mx-0 lg:px-0 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {LEVELS.map((meta) => {
          const count = byLevel.get(meta.key)?.length ?? 0;
          const selected = level === meta.key;
          return (
            <button
              key={meta.key}
              role="tab"
              aria-selected={selected}
              onClick={() => setLevel(meta.key)}
              className={`shrink-0 min-h-touch px-3.5 rounded-sm border font-condensed text-meta font-bold tracking-[0.14em] uppercase transition-colors dur-fast inline-flex items-center gap-1.5 ${
                selected
                  ? "bg-ink border-redline text-gold-3"
                  : "bg-white border-bone-3 text-ink-4 active:bg-bone-2"
              }`}
            >
              {meta.label}
              <span
                className={`font-mono text-micro tabular-nums ${
                  selected ? "text-slate-2" : "text-slate"
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Keyed on level so switching tabs replays the staggered entrance. */}
      <section key={level} aria-live="polite" className="space-y-2.5">
        {active.length === 0 ? (
          <EmptyLevel division={level} />
        ) : (
          <>
            {podium.map((result, i) => (
              <PodiumCard key={result.college.id} result={result} rank={i + 1} index={i} />
            ))}

            {rest.length > 0 && (
              <>
                <p
                  style={stagger(3)}
                  className="font-condensed text-label font-bold tracking-[0.2em] uppercase text-slate pt-2 motion-safe:animate-rise"
                >
                  {rest.length} more {LEVELS.find((l) => l.key === level)?.label} program
                  {rest.length === 1 ? "" : "s"}
                </p>
                {rest.map((result, i) => (
                  <ListRow
                    key={result.college.id}
                    result={result}
                    rank={i + 4}
                    index={i + 4}
                  />
                ))}
              </>
            )}
          </>
        )}
      </section>

      <p className="text-meta text-slate text-pretty pt-1">
        Interim scoring model. Component weights and the athletic projection band are provisional
        and will be replaced by the full match engine. Scores are never floored: a poor fit scores
        poorly on purpose.
      </p>
    </div>
  );
}
