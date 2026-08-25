import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PageHeader } from "@/components/app/page-header";
import { LoadFailure } from "@/components/ui/states";
import { Tachometer } from "@/components/ui/tachometer";
import {
  ProfileStrengthCard,
  VerificationLadder,
  NextTierPanel,
  ReadinessStages,
} from "@/components/progression/progression";
import {
  getCurrentPlayer,
  getProfileName,
  getColleges,
  getMetrics,
  getChecklistItems,
} from "@/lib/data/player";
import {
  profileStrength,
  readinessStage,
  nextTierLevers,
  verificationMix,
} from "@/lib/progression";
import { scoreAll } from "@/lib/match/interim-scorer";

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const [name, player, collegesResult] = await Promise.all([
    getProfileName(),
    getCurrentPlayer(),
    getColleges(),
  ]);

  // The dashboard still works without programs, so a failed load degrades the
  // program-dependent panels rather than blanking the screen. It is shown as
  // an explicit fault, never as an empty result.
  const colleges = collegesResult.data ?? [];
  const collegesError = collegesResult.error;

  const [metrics, checklist] = await Promise.all([
    getMetrics(player?.id ?? null),
    getChecklistItems(player?.id ?? null),
  ]);

  const strength = profileStrength(player, metrics);
  const readiness = readinessStage(player, metrics, checklist);
  const levers = nextTierLevers(player, colleges);
  const mix = verificationMix(metrics);

  const results = player ? scoreAll(player, colleges) : [];
  const inRange = results.filter((r) => r.score !== null && r.score >= 65).length;
  const topFit = results[0]?.score ?? null;

  return (
    <>
      <PageHeader
        eyebrow="RPM Recruit"
        title={`${name}'s Dashboard`}
        subtitle="Every number here comes from your own data. Nothing is estimated."
        bgText="DASH"
      />

      <div className="px-gutter lg:px-gutter-lg py-5 lg:py-6 pb-10 lg:pb-14 space-y-4">
        {collegesError !== null && (
          <LoadFailure
            title="Could not load the program database"
            what="Your program matches and Next Tier"
            reason={collegesError}
          />
        )}

        {/* ── Anchor 1: the gauge ─────────────────────────────── */}
        <section className="bg-ink border border-ink-2 rounded-lg overflow-hidden">
          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 px-5 py-6">
            <Tachometer
              score={player?.overall_score ?? null}
              size="lg"
              precision={1}
              className="shrink-0"
            />

            <div className="text-center sm:text-left min-w-0">
              <p className="font-condensed text-label font-bold tracking-[0.22em] uppercase text-gold mb-1">
                Showcase Rating
              </p>
              <p className="font-display text-display sm:text-display-lg font-bold text-bone leading-tight text-balance">
                {player?.overall_score !== null && player?.overall_score !== undefined
                  ? "Rated on the Scanzano scale"
                  : "Not yet rated"}
              </p>
              <p className="text-caption text-slate-2 mt-1.5 leading-relaxed max-w-[44ch] text-pretty">
                {player?.overall_score !== null && player?.overall_score !== undefined
                  ? `Your rating drives athletic projection, which carries the most weight in every program match.`
                  : "Rate your position skills to unlock athletic projection. Until then your program matches are scored without it."}
              </p>

              {!player?.overall_score && (
                <Link
                  href="/scores"
                  className="pressable focusable mt-3 inline-flex items-center gap-1.5 min-h-touch px-4 bg-gold text-ink font-condensed text-meta font-bold tracking-[0.14em] uppercase rounded-sm hover:bg-gold-2 transition-colors dur-fast"
                >
                  Enter position scores
                  <ArrowRight size={14} aria-hidden />
                </Link>
              )}
            </div>
          </div>

          {/* Two real counts, both traceable to rows. */}
          <div className="grid grid-cols-2 border-t border-ink-3 divide-x divide-ink-3">
            <div className="px-5 py-3">
              <p className="font-mono text-title-lg text-gold-3 leading-none tabular-nums">
                {colleges.length}
              </p>
              <p className="font-condensed text-micro font-bold tracking-[0.16em] uppercase text-slate mt-1">
                Programs loaded
              </p>
            </div>
            <div className="px-5 py-3">
              <p className="font-mono text-title-lg text-gold-3 leading-none tabular-nums">
                {inRange}
              </p>
              <p className="font-condensed text-micro font-bold tracking-[0.16em] uppercase text-slate mt-1">
                In range now
              </p>
            </div>
          </div>
        </section>

        {/* ── Anchor 2: Next Tier ─────────────────────────────── */}
        <NextTierPanel levers={levers} />

        {/* ── Anchors 3 and 4 ─────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <ProfileStrengthCard strength={strength} />
          <ReadinessStages state={readiness} />
        </div>

        <VerificationLadder mix={mix} />

        {topFit !== null && (
          <Link
            href="/college-match"
            className="pressable focusable flex items-center gap-3 p-4 min-h-touch bg-white border border-black/[0.07] rounded-md shadow-sm hover:border-gold transition-colors dur-fast group"
          >
            <span className="flex-1 min-w-0">
              <span className="block font-display text-title-sm font-bold text-ink leading-tight">
                See all {colleges.length} programs scored
              </span>
              <span className="block text-caption text-ink-5 mt-0.5">
                Best current fit scores {topFit.toFixed(0)} out of 100
              </span>
            </span>
            <ArrowRight
              size={17}
              aria-hidden
              className="text-slate group-hover:text-gold shrink-0 transition-colors dur-fast"
            />
          </Link>
        )}
      </div>
    </>
  );
}
