import Link from "next/link";
import Image from "next/image";
import { ArrowDown } from "lucide-react";
import { PLANS } from "@/config/pricing";
import { Tachometer } from "@/components/ui/tachometer";
import { PitchStage } from "@/components/marketing/pitch-stage";
import { Reveal } from "@/components/marketing/reveal";
import { getColleges } from "@/lib/data/player";
import { scoreAll } from "@/lib/match/interim-scorer";
import { SAMPLE_PLAYER } from "@/lib/demo/sample-player";

/**
 * The landing page is a server component that scores the sample player against
 * the real program database once, at build or revalidation time, and hands the
 * result to the client stage. The visitor gets a live demonstration of the
 * actual scorer without a login and without a request of their own.
 */
export const revalidate = 3600;

const LADDER = [
  { n: 10, label: "Professional prospect" },
  { n: 9, label: "High level Division I" },
  { n: 8, label: "Mid level Division I" },
  { n: 7, label: "Lower level Division I" },
  { n: 6, label: "Division II and Division III" },
  { n: 5, label: "Above average high school player" },
];

const INSIDE = [
  {
    title: "College match engine",
    body: "Every program in the database scored on five components, with the arithmetic shown.",
  },
  {
    title: "Position evaluations",
    body: "Rated on the 1 to 10 showcase scale, skill by skill, on the ladder coaches already use.",
  },
  {
    title: "Athletic profile",
    body: "Measurables tracked over time, each one carrying the level of proof it arrived with.",
  },
  {
    title: "Letter builder",
    body: "Coach outreach drafted from your real evaluation data, not from a blank page.",
  },
  {
    title: "Bio draft builder",
    body: "A third-person scouting narrative you can put in front of a coaching staff.",
  },
  {
    title: "Recruiting toolkit",
    body: "Cost tracker, eligibility checklist, interview prep, and a pitching log.",
  },
];

export default async function HomePage() {
  const collegesResult = await getColleges();
  const results =
    collegesResult.error === null ? scoreAll(SAMPLE_PLAYER, collegesResult.data) : [];

  return (
    <>
      {/* ── HERO ── */}
      <section className="relative bg-ink overflow-hidden">
        <div className="mx-auto max-w-7xl px-gutter lg:px-6 pt-16 pb-14 lg:pt-28 lg:pb-24 relative z-10 lg:grid lg:grid-cols-[minmax(0,1fr)_auto] lg:gap-16 lg:items-center">
          <div className="max-w-3xl">
            <p className="font-condensed text-label font-bold tracking-[0.24em] uppercase text-gold mb-6">
              Scanzano Baseball &middot; All-American Baseball Talent Showcases
            </p>
            <Image
              src="/full.png"
              alt="RPM Recruit"
              width={520}
              height={104}
              className="h-auto w-full max-w-[420px] mb-8"
              style={{ filter: "drop-shadow(0 0 10px rgba(184,151,90,0.35))" }}
              priority
            />
            <h1 className="font-display text-display-lg lg:text-numeral font-bold text-bone leading-none text-balance">
              Find out where you actually stand, and what would move it.
            </h1>
            <p className="text-body-lg text-slate-2 leading-relaxed max-w-[58ch] mt-5">
              Build the profile, get rated on the showcase scale, and see every
              college program scored against you with the reasoning in the open.
              No inflated numbers, no invented matches. If a program is a long
              shot, it says so.
            </p>
            <div className="flex flex-wrap gap-3 mt-9">
              <Link
                href="/start"
                className="pressable focusable press-redline inline-flex items-center min-h-touch font-condensed text-body font-bold tracking-[0.14em] uppercase bg-gold text-ink px-7 rounded-sm hover:bg-gold-2 transition-colors dur-fast"
              >
                Start Today
              </Link>
              <Link
                href="/pricing"
                className="pressable focusable press-redline inline-flex items-center min-h-touch font-condensed text-body font-bold tracking-[0.14em] uppercase text-slate-2 border border-ink-3 px-7 rounded-sm hover:border-gold hover:text-gold transition-colors dur-fast"
              >
                View pricing
              </Link>
            </div>

            <p className="flex items-center gap-2 font-condensed text-micro font-bold tracking-[0.22em] uppercase text-slate mt-12">
              <ArrowDown size={12} aria-hidden />
              Scroll for a live sample
            </p>
          </div>

          {/* Where every profile starts: unrated, and honest about it. */}
          <div className="hidden lg:flex flex-col items-center text-center">
            <Tachometer
              score={null}
              size="hero"
              emptyText="--"
              label="Not rated yet"
              animated={false}
            />
            <p className="text-caption text-slate max-w-[26ch] mt-4 text-pretty">
              Every profile starts here. The number arrives when the evaluation
              does, not before.
            </p>
          </div>
        </div>
        <div className="h-0.5 bg-gold" />
      </section>

      {/* ── THE PITCH: three acts, one gauge ── */}
      <PitchStage results={results} />

      {/* ── THE LADDER ── */}
      <section className="bg-ink">
        <div className="mx-auto max-w-7xl px-gutter lg:px-6 py-16 lg:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
            <Reveal>
              <p className="font-condensed text-label font-bold tracking-[0.24em] uppercase text-gold mb-2">
                The scale
              </p>
              <h2 className="font-display text-display-lg lg:text-numeral font-bold text-bone leading-none text-balance">
                One ladder, used the same way for everyone.
              </h2>
              <p className="text-body-lg text-slate-2 leading-relaxed mt-4 max-w-[52ch] text-pretty">
                Every player is rated on the scale used at All-American Baseball
                Talent Showcases. It is the same ladder behind the ratings, the
                division guidance, and the match scores, and it is published
                rather than implied.
              </p>
              <Link
                href="/start"
                className="pressable-sink focusable press-redline inline-flex items-center min-h-touch font-condensed text-body font-bold tracking-[0.14em] uppercase bg-gold text-ink px-6 rounded-sm hover:bg-gold-2 transition-colors dur-fast mt-7"
              >
                Start Today
              </Link>
            </Reveal>

            <ul className="bg-ink-2 border border-ink-3 rounded-md p-4 lg:p-5 flex flex-col gap-px">
              {LADDER.map((level, i) => (
                <Reveal as="li" key={level.n} delay={i * 55}>
                  <div className="flex items-center gap-4 px-3 py-2.5 border-l-[3px] border-transparent hover:border-gold hover:bg-gold/[0.06] transition-colors dur-fast">
                    <span className="font-display num text-display-sm font-bold text-ink-4 w-8 text-center">
                      {level.n}
                    </span>
                    <span className="text-body text-slate-2">{level.label}</span>
                  </div>
                </Reveal>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ── WHAT IS INSIDE ── */}
      <section className="mx-auto max-w-7xl px-gutter lg:px-6 py-16 lg:py-24">
        <Reveal className="max-w-[46ch] mb-10">
          <p className="font-condensed text-label font-bold tracking-[0.24em] uppercase text-gold mb-2">
            Inside
          </p>
          <h2 className="font-display text-display-lg lg:text-numeral font-bold text-ink leading-none text-balance">
            The whole recruiting job, in one place.
          </h2>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {INSIDE.map((item, i) => (
            <Reveal key={item.title} delay={i * 60}>
              <div className="h-full bg-white border border-black/[0.07] rounded-md shadow-sm p-5">
                <h3 className="font-display text-title font-bold text-ink mb-1.5">
                  {item.title}
                </h3>
                <p className="text-body text-ink-5 leading-relaxed text-pretty">
                  {item.body}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── PRICING ── */}
      <section className="mx-auto max-w-7xl px-gutter lg:px-6 pb-16 lg:pb-24">
        <Reveal className="max-w-[46ch] mb-10">
          <p className="font-condensed text-label font-bold tracking-[0.24em] uppercase text-gold mb-2">
            Pricing
          </p>
          <h2 className="font-display text-display-lg lg:text-numeral font-bold text-ink leading-none text-balance">
            Built for players, scouts, and organizations.
          </h2>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {(
            Object.entries(PLANS) as [string, (typeof PLANS)[keyof typeof PLANS]][]
          ).map(([key, plan], i) => (
            <Reveal key={key} delay={i * 60}>
              <div
                className={`h-full bg-white border rounded-md p-5 flex flex-col ${
                  key === "showcase"
                    ? "border-gold shadow-md"
                    : "border-black/[0.07] shadow-sm"
                }`}
              >
                {key === "showcase" && (
                  <p className="font-condensed text-micro font-bold tracking-[0.2em] uppercase text-gold mb-2">
                    Most popular
                  </p>
                )}
                <h3 className="font-display text-title font-bold text-ink">
                  {plan.name}
                </h3>
                <p className="mt-2 mb-1">
                  <span className="font-display num text-display-xl font-bold text-ink">
                    ${plan.price.toLocaleString()}
                  </span>
                  {plan.interval && (
                    <span className="text-caption text-slate">/{plan.interval}</span>
                  )}
                </p>
                <p className="text-caption text-slate mb-4">{plan.description}</p>
                <ul className="flex flex-col gap-2 mb-5 flex-1">
                  {plan.features.slice(0, 4).map((f) => (
                    <li key={f} className="text-caption text-ink-4 flex items-start gap-2">
                      <span className="text-gold mt-0.5" aria-hidden>
                        &#10003;
                      </span>
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href={`/start?plan=${key}`}
                  className={`pressable focusable flex items-center justify-center min-h-touch text-center font-condensed text-label font-bold tracking-[0.14em] uppercase rounded-sm transition-colors dur-fast ${
                    key === "showcase"
                      ? "bg-ink text-bone hover:bg-gold hover:text-ink"
                      : "bg-bone text-ink-4 hover:bg-ink hover:text-bone"
                  }`}
                >
                  Start Today
                </Link>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="bg-ink">
        <div className="mx-auto max-w-7xl px-gutter lg:px-6 py-16 lg:py-24 text-center">
          <Reveal>
            <h2 className="font-display text-display-lg lg:text-numeral font-bold text-bone leading-none text-balance">
              Your number, your list, your next call.
            </h2>
            <p className="text-body-lg text-slate-2 max-w-[46ch] mx-auto mt-4 text-pretty">
              Build the profile once and every screen in the product reads from
              it: the rating, the program list, the letters you send.
            </p>
            <Link
              href="/start"
              className="pressable-sink focusable press-redline inline-flex items-center min-h-touch font-condensed text-body font-bold tracking-[0.14em] uppercase bg-gold text-ink px-8 rounded-sm hover:bg-gold-2 transition-colors dur-fast mt-8"
            >
              Start Today
            </Link>
          </Reveal>
        </div>
        <div className="h-0.5 bg-gradient-to-r from-blood to-gold" />
      </section>
    </>
  );
}
