import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About",
  description:
    "RPM Recruit — Recruit, Profile, Match by Scanzano Baseball.",
};

export default function AboutPage() {
  return (
    <>
      <section className="bg-ink">
        <div className="mx-auto max-w-7xl px-6 py-16">
          <div className="font-condensed text-[10px] font-bold tracking-[0.22em] uppercase text-gold mb-2">
            About
          </div>
          <h1 className="font-display text-4xl font-bold text-bone">
            Scanzano Baseball & All-American Showcases
          </h1>
          <p className="text-slate-2 mt-3 max-w-2xl">
            RPM Recruit is the digital recruiting platform built by the team
            behind All-American Baseball Talent Showcases — connecting high
            school players with college programs for over two decades.
          </p>
        </div>
        <div className="h-px bg-gold/20" />
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="max-w-3xl space-y-12">
          <div>
            <h2 className="font-display text-2xl font-bold text-ink mb-4">
              The Mission
            </h2>
            <p className="text-ink-5 leading-relaxed">
              Every year, thousands of talented high school baseball players fall
              through the cracks — not because they lack ability, but because
              they lack exposure, tools, and guidance. RPM Recruit exists to
              change that. We give every player the same professional-grade
              evaluation, matching, and outreach tools that were once reserved
              for elite travel programs.
            </p>
          </div>

          <div>
            <h2 className="font-display text-2xl font-bold text-ink mb-4">
              The Evaluation Standard
            </h2>
            <p className="text-ink-5 leading-relaxed">
              Our 1&ndash;10 showcase evaluation scale is the foundation. Every
              skill rating, overall score, and college recommendation flows from
              this standard — the same methodology used at All-American Baseball
              Talent Showcases since their inception. When a coach sees an RPM
              score, they know exactly what it means.
            </p>
          </div>

          <div>
            <h2 className="font-display text-2xl font-bold text-ink mb-4">
              Coach John Scanzano
            </h2>
            <p className="text-ink-5 leading-relaxed mb-4">
              Coach John Scanzano has 20+ years of coaching, scouting, and
              athletic administration experience from high school through
              professional sports.
            </p>
            <p className="text-ink-5 leading-relaxed mb-4">
              Head Baseball Coach at Camden County College (2026), where he
              engineered a turnaround from 4 wins to 27 wins in two seasons,
              earned the program&apos;s first playoff berth since 2019, led the
              nation in stolen bases, and produced four All-Region selections
              including the college&apos;s first First-Team All-American since
              2018.
            </p>
            <p className="text-ink-5 leading-relaxed mb-4">
              Managing Partner at Scanzano Baseball in Cherry Hill, NJ — over 7
              years building one of the region&apos;s premier player development
              programs, training 300-350 athletes annually and producing 150+
              college commitments across all NCAA and NJCAA levels.
            </p>
            <p className="text-ink-5 leading-relaxed mb-4">
              Former Head Coach at The King&apos;s Christian School: 100+ wins,
              three straight PJAA Conference Championships (2017-2019), 2017
              NACA National Runner Up, 2018 NACA Division I National Champion,
              2018 NACA National Coach of the Year. In 2021 partnered with MLB
              World Series Champion Coach Milt Thompson to launch a
              post-graduate baseball program.
            </p>
            <p className="text-ink-5 leading-relaxed">
              Pro scouting background. Lifelong athlete — Cherokee High School,
              Milford Academy Prep, Rowan Burlington County College.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
