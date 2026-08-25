"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, Check, Lock, ShieldCheck } from "lucide-react";
import {
  VERIFICATION_RANKS,
  READINESS_STAGES,
  type ProfileStrength,
  type ReadinessState,
  type TierLever,
  type VerificationMix,
} from "@/lib/progression";

/* ------------------------------------------------------------------ */
/*  Profile Strength                                                   */
/* ------------------------------------------------------------------ */

/** Where each strength factor is actually improved. */
const WEAKEST_LINK: Record<string, string> = {
  "Player identity": "/profile",
  Academics: "/academics",
  "Intended majors": "/academics",
  Evaluation: "/scores",
  Measurables: "/athletic",
  Verification: "/athletic",
};

const WEAKEST_CTA: Record<string, string> = {
  "Player identity": "Complete your profile",
  Academics: "Add academics",
  "Intended majors": "Pick majors",
  Evaluation: "Rate your skills",
  Measurables: "Log a measurement",
  Verification: "See your trajectory",
};

/** Sweeps the meter on mount with the needle curve, honouring reduced motion. */
function useSweep(target: number) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduced) {
      setValue(target);
      return;
    }

    const start = performance.now();
    const duration = 1100;
    let raf: number;

    function tick(now: number) {
      const t = Math.min((now - start) / duration, 1);
      const eased = t >= 1 ? 1 : 1 - Math.pow(2, -9 * t) * Math.cos(t * Math.PI * 2.15);
      setValue(target * eased);
      if (t < 1) raf = requestAnimationFrame(tick);
    }

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target]);

  return value;
}

export function ProfileStrengthCard({ strength }: { strength: ProfileStrength }) {
  const swept = useSweep(strength.score);

  return (
    <section className="bg-white border border-black/[0.07] rounded-md shadow-sm p-4">
      <div className="flex items-baseline justify-between gap-3 mb-3">
        <h2 className="font-condensed text-micro font-bold tracking-[0.24em] uppercase text-slate">
          Profile Strength
        </h2>
        <span className="font-display text-display-lg font-bold num text-ink leading-none">
          {Math.round(swept)}
          <span className="text-body text-slate font-body font-normal">/100</span>
        </span>
      </div>

      <div className="h-2 bg-bone-2 rounded-pill overflow-hidden mb-3">
        <div
          className="h-full rounded-pill bg-gradient-to-r from-blood via-gold to-gold-2"
          style={{ width: `${swept}%` }}
        />
      </div>

      <ul className="space-y-1.5">
        {strength.factors.map((factor) => (
          <li key={factor.label} className="flex items-baseline justify-between gap-3">
            <span className="text-caption text-ink-5 shrink-0">{factor.label}</span>
            <span className="flex-1 border-b border-dotted border-bone-3 translate-y-[-3px]" />
            <span className="font-mono text-meta text-slate tabular-nums shrink-0">
              {Math.round(factor.value * 100)}%
            </span>
          </li>
        ))}
      </ul>

      {strength.weakest && (
        <div className="mt-3 pt-3 border-t border-black/[0.05]">
          <p className="text-caption text-ink-5 leading-relaxed text-pretty">
            Biggest gap: <strong className="text-ink">{strength.weakest.label}</strong>.{" "}
            {strength.weakest.detail}.
          </p>
          <Link
            href={WEAKEST_LINK[strength.weakest.label] ?? "/profile"}
            className="pressable focusable mt-2 inline-flex items-center gap-1.5 min-h-touch font-condensed text-micro font-bold tracking-[0.16em] uppercase text-ink-4 hover:text-gold transition-colors dur-fast"
          >
            {WEAKEST_CTA[strength.weakest.label] ?? "Open profile"}
            <ArrowRight size={12} aria-hidden />
          </Link>
        </div>
      )}
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Verification status                                                */
/* ------------------------------------------------------------------ */

export function VerificationLadder({ mix }: { mix: VerificationMix }) {
  const counts = [mix.selfReported, mix.coachVerified, mix.eventVerified];
  const highestEarned = counts.reduce((acc, c, i) => (c > 0 ? i : acc), -1);

  return (
    <section className="bg-white border border-black/[0.07] rounded-md shadow-sm p-4">
      <h2 className="font-condensed text-micro font-bold tracking-[0.24em] uppercase text-slate mb-1">
        Credibility
      </h2>
      <p className="text-caption text-ink-5 leading-relaxed mb-3 text-pretty">
        In recruiting, who confirmed the number matters as much as the number.
      </p>

      <ol className="space-y-2">
        {VERIFICATION_RANKS.map((rank, i) => {
          const count = counts[i];
          const earned = count > 0;
          const isHighest = i === highestEarned;

          return (
            <li
              key={rank.status}
              className={`flex items-start gap-2.5 p-2.5 rounded-sm border transition-colors dur-base ${
                isHighest
                  ? "border-gold bg-gold/[0.08]"
                  : earned
                    ? "border-bone-3 bg-bone/40"
                    : "border-dashed border-bone-3"
              }`}
            >
              <span
                className={`mt-0.5 shrink-0 ${earned ? "text-gold" : "text-bone-3"}`}
                aria-hidden
              >
                {earned ? <ShieldCheck size={16} /> : <Lock size={16} />}
              </span>

              <span className="flex-1 min-w-0">
                <span className="flex items-baseline justify-between gap-2">
                  <span
                    className={`font-condensed text-meta font-bold tracking-[0.14em] uppercase ${
                      earned ? "text-ink" : "text-slate"
                    }`}
                  >
                    {rank.label}
                  </span>
                  <span className="font-mono text-meta tabular-nums text-slate">
                    {count}
                  </span>
                </span>
                <span className="block text-meta text-ink-5 leading-snug mt-0.5 text-pretty">
                  {rank.blurb}
                </span>
              </span>
            </li>
          );
        })}
      </ol>

      {mix.total === 0 && (
        <p className="text-caption text-slate leading-relaxed mt-3 text-pretty">
          No measurables on file yet. Nothing here is estimated: these counts are zero because
          the table is empty.
        </p>
      )}
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Next tier                                                          */
/* ------------------------------------------------------------------ */

export function NextTierPanel({ levers }: { levers: TierLever[] }) {
  return (
    <section className="bg-ink border border-ink-2 rounded-md p-4">
      <h2 className="font-condensed text-label font-bold tracking-[0.2em] uppercase text-gold mb-1">
        Next Tier
      </h2>
      <p className="text-caption text-slate-2 leading-relaxed mb-3 text-pretty">
        What actually moves programs into range, measured by re-running the match engine.
      </p>

      {levers.length === 0 ? (
        <p className="text-caption text-slate-2 leading-relaxed text-pretty">
          No lever changes the result yet. Once your rating and academics are on file, this
          panel shows exactly how many programs each improvement would bring into range.
        </p>
      ) : (
        <ul className="space-y-2">
          {levers.map((lever, i) => (
            <li key={`${lever.action}-${lever.level}-${i}`}>
              <Link
                href={lever.href}
                className="pressable focusable flex items-center gap-3 p-3 min-h-touch bg-ink-2 border border-ink-3 rounded-sm hover:border-gold transition-colors dur-fast group"
              >
                <span className="flex-1 min-w-0">
                  <span className="block font-display text-title-sm font-bold text-gold-3 leading-tight text-balance">
                    {lever.effect}
                  </span>
                  <span className="block text-caption text-slate-2 mt-0.5 text-pretty">
                    {lever.action}
                  </span>
                  {lever.assumed && (
                    <span className="inline-block mt-1 font-condensed text-micro font-bold tracking-[0.14em] uppercase text-gold/80 border border-gold/30 rounded-xs px-1.5 py-0.5">
                      Projection
                    </span>
                  )}
                </span>
                <ArrowRight
                  size={16}
                  aria-hidden
                  className="text-slate group-hover:text-gold shrink-0 transition-colors dur-fast"
                />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Readiness stages                                                   */
/* ------------------------------------------------------------------ */

export function ReadinessStages({ state }: { state: ReadinessState }) {
  return (
    <section className="bg-white border border-black/[0.07] rounded-md shadow-sm p-4">
      <div className="flex items-baseline justify-between gap-3 mb-3">
        <h2 className="font-condensed text-micro font-bold tracking-[0.24em] uppercase text-slate">
          Recruiting Readiness
        </h2>
        {state.gradYear && (
          <span className="font-mono text-meta text-slate tabular-nums">
            Class of {state.gradYear}
          </span>
        )}
      </div>

      <ol className="relative">
        {READINESS_STAGES.map((stage, i) => {
          const reached = i <= state.reachedIndex;
          const isCurrent = i === state.reachedIndex;
          const isNext = i === state.reachedIndex + 1;
          const last = i === READINESS_STAGES.length - 1;

          return (
            <li key={stage.key} className="flex gap-3 pb-3 last:pb-0 relative">
              {!last && (
                <span
                  aria-hidden
                  className={`absolute left-[11px] top-6 bottom-0 w-px ${
                    reached ? "bg-gold" : "bg-bone-3"
                  }`}
                />
              )}

              <span
                aria-hidden
                className={`relative z-10 size-6 shrink-0 rounded-pill border-2 flex items-center justify-center ${
                  isCurrent
                    ? "bg-gold border-gold text-ink"
                    : reached
                      ? "bg-ink border-ink text-gold"
                      : "bg-white border-bone-3 text-bone-3"
                }`}
              >
                {reached ? <Check size={12} strokeWidth={3} /> : <span className="size-1.5 rounded-pill bg-current" />}
              </span>

              <span className="flex-1 min-w-0 pt-0.5">
                <span
                  className={`block font-condensed text-caption font-bold tracking-[0.1em] uppercase ${
                    reached ? "text-ink" : isNext ? "text-ink-4" : "text-slate"
                  }`}
                >
                  {stage.name}
                </span>
                <span className="block text-meta text-ink-5 leading-snug mt-0.5 text-pretty">
                  {isNext ? `Next: ${stage.requirement}` : stage.requirement}
                </span>
              </span>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
