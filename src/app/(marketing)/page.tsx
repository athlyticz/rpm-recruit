import Link from "next/link";
import Image from "next/image";
import { PLANS } from "@/config/pricing";
import { TachometerShowcase } from "@/components/marketing/tachometer-showcase";

function FeatureCard({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="bg-white border border-black/[0.06] p-6 shadow-sm">
      <h3 className="font-display text-lg font-semibold text-ink mb-2">
        {title}
      </h3>
      <p className="text-sm text-ink-5 leading-relaxed">{description}</p>
    </div>
  );
}

function EvaluationLadder() {
  const levels = [
    { n: 10, label: "Professional Prospect" },
    { n: 9, label: "High Level Div I Player" },
    { n: 8, label: "Mid Level Div I Player" },
    { n: 7, label: "Lower Level Div I Player" },
    { n: 6, label: "Div 2 / Div 3 College Player" },
    { n: 5, label: "Above Average HS Player" },
  ];

  return (
    <div className="flex flex-col gap-px">
      {levels.map((level) => (
        <div
          key={level.n}
          className="flex items-center gap-3 px-4 py-2.5 border-l-[3px] border-transparent hover:border-gold hover:bg-gold/[0.06] transition-all"
        >
          <span className="font-display text-xl font-bold text-bone-3 w-7 text-center">
            {level.n}
          </span>
          <span className="text-sm text-slate">{level.label}</span>
        </div>
      ))}
    </div>
  );
}

export default function HomePage() {
  return (
    <>
      {/* ── HERO ── */}
      <section className="relative bg-ink overflow-hidden">
        <div className="mx-auto max-w-7xl px-6 py-24 md:py-36 relative z-10">
          <div className="max-w-2xl">
            <div className="font-condensed text-label font-bold tracking-[0.22em] uppercase text-gold mb-6">
              Scanzano Baseball &middot; All-American Baseball Talent Showcases
            </div>
            <Image
              src="/full.png"
              alt="RPM Recruit"
              width={520}
              height={104}
              className="h-auto w-full max-w-[480px] mb-4"
              style={{
                filter: "drop-shadow(0 0 10px rgba(184,151,90,0.35))",
              }}
              priority
            />
            <p className="font-condensed text-sm font-semibold tracking-[0.18em] uppercase text-ink-4 mt-2 mb-8">
              Recruit &middot; Profile &middot; Match
            </p>
            <p className="text-lg text-slate-2 leading-relaxed max-w-xl mb-10">
              The complete college baseball recruiting platform. Build your
              player profile, get evaluated on the 1&ndash;10 showcase scale,
              match with D1/D2/D3 programs, and generate professional outreach
              materials — all in one place.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/signup"
                className="font-condensed text-sm font-bold tracking-[0.13em] uppercase bg-gold text-ink px-7 py-3.5 hover:bg-gold-2 transition-colors"
              >
                Start Your Profile
              </Link>
              <Link
                href="/pricing"
                className="font-condensed text-sm font-bold tracking-[0.13em] uppercase text-slate-2 border border-ink-3 px-7 py-3.5 hover:border-gold hover:text-gold transition-colors"
              >
                View Pricing
              </Link>
            </div>
          </div>
        </div>
        <div className="h-0.5 bg-gold" />
      </section>

      {/* ── FEATURES GRID ── */}
      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="text-center mb-14">
          <div className="font-condensed text-label font-bold tracking-[0.22em] uppercase text-gold mb-3">
            Platform
          </div>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-ink">
            Everything You Need to Get Recruited
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <FeatureCard
            title="College Match Engine"
            description="Score and rank D1, D2, and D3 programs based on your athletic profile, academics, and campus preferences."
          />
          <FeatureCard
            title="Bio Draft Builder"
            description="Build professional third-person scouting narrative drafts tailored for college coaching staffs."
          />
          <FeatureCard
            title="Letter Builder"
            description="Draft personalized recruiting letters to coaches from proven templates, referencing your real evaluation data."
          />
          <FeatureCard
            title="Position Evaluations"
            description="Rate skills on the 1-10 showcase scale across position-specific categories."
          />
          <FeatureCard
            title="Athletic Profile"
            description="Track measurables — 60-yard dash, bat speed, exit velocity, arm strength — with D1 benchmarks."
          />
          <FeatureCard
            title="Recruiting Toolkit"
            description="Cost tracker, NCAA eligibility checklist, interview prep with 20+ common coach questions, and pitching log."
          />
        </div>
      </section>

      {/* ── SEE WHERE YOU RANK — Tachometer Demos ── */}
      <TachometerShowcase />

      {/* ── EVALUATION SCALE ── */}
      <section className="bg-ink">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="font-condensed text-label font-bold tracking-[0.22em] uppercase text-gold mb-3">
                Showcase Scale
              </div>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-bone mb-4">
                The 1&ndash;10 Evaluation Standard
              </h2>
              <p className="text-slate-2 leading-relaxed mb-6">
                Every player is rated on the same scale used at All-American
                Baseball Talent Showcases. Your overall score drives division
                recommendations and college matching.
              </p>
              <Link
                href="/signup"
                className="inline-block font-condensed text-sm font-bold tracking-[0.13em] uppercase bg-gold text-ink px-6 py-3 hover:bg-gold-2 transition-colors"
              >
                Get Evaluated
              </Link>
            </div>
            <div className="bg-ink-2 border border-ink-3 p-6">
              <div className="font-condensed text-micro font-bold tracking-[0.2em] uppercase text-slate mb-4">
                Player Evaluation Ladder
              </div>
              <EvaluationLadder />
            </div>
          </div>
        </div>
      </section>

      {/* ── PRICING PREVIEW ── */}
      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="text-center mb-14">
          <div className="font-condensed text-label font-bold tracking-[0.22em] uppercase text-gold mb-3">
            Pricing
          </div>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-ink">
            Built for Players, Scouts & Organizations
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {(
            Object.entries(PLANS) as [
              string,
              (typeof PLANS)[keyof typeof PLANS],
            ][]
          ).map(([key, plan]) => (
            <div
              key={key}
              className={`bg-white border p-6 flex flex-col ${
                key === "showcase"
                  ? "border-gold shadow-md"
                  : "border-black/[0.06] shadow-sm"
              }`}
            >
              {key === "showcase" && (
                <div className="font-condensed text-micro font-bold tracking-[0.17em] uppercase text-gold mb-2">
                  Most Popular
                </div>
              )}
              <h3 className="font-display text-lg font-semibold text-ink">
                {plan.name}
              </h3>
              <div className="mt-3 mb-1">
                <span className="font-display text-4xl font-bold text-ink">
                  ${plan.price.toLocaleString()}
                </span>
                {plan.interval && (
                  <span className="text-sm text-slate">/{plan.interval}</span>
                )}
              </div>
              <p className="text-xs text-slate mb-5">{plan.description}</p>
              <ul className="space-y-2 mb-6 flex-1">
                {plan.features.slice(0, 4).map((f) => (
                  <li
                    key={f}
                    className="text-xs text-ink-4 flex items-start gap-2"
                  >
                    <span className="text-gold mt-0.5">&#10003;</span>
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/signup"
                className={`block text-center font-condensed text-xs font-bold tracking-[0.13em] uppercase py-2.5 transition-colors ${
                  key === "showcase"
                    ? "bg-ink text-bone hover:bg-gold hover:text-ink"
                    : "bg-bone text-ink-4 hover:bg-ink hover:text-bone"
                }`}
              >
                Get Started
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="bg-ink">
        <div className="mx-auto max-w-7xl px-6 py-20 text-center">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-bone mb-4">
            Your Diamond Path Starts Here
          </h2>
          <p className="text-slate-2 max-w-lg mx-auto mb-8">
            Join players across the country who use RPM Recruit to find their
            college fit and get in front of the right coaches.
          </p>
          <Link
            href="/signup"
            className="inline-block font-condensed text-sm font-bold tracking-[0.13em] uppercase bg-gold text-ink px-8 py-3.5 hover:bg-gold-2 transition-colors"
          >
            Create Your Profile
          </Link>
        </div>
        <div className="h-0.5 bg-gradient-to-r from-blood to-gold" />
      </section>
    </>
  );
}
