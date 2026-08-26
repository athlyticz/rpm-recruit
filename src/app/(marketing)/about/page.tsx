import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Reveal } from "@/components/marketing/reveal";

export const metadata: Metadata = {
  title: "The Team",
  description:
    "RPM Recruit is built by Coach John J. Scanzano, head baseball coach at Camden County College, and Dr. Michael S. Czahor, who spent seven years in Major League Baseball front offices.",
};

/* ------------------------------------------------------------------ */
/*  The people                                                         */
/* ------------------------------------------------------------------ */

interface Stat {
  value: string;
  label: string;
}

interface Section {
  heading: string;
  paragraphs: string[];
}

interface Person {
  name: string;
  role: string;
  photo: string;
  photoAlt: string;
  pull: string;
  intro: string;
  stats: Stat[];
  meta: { label: string; value: string }[];
  sections: Section[];
}

const SCANZANO: Person = {
  name: "Coach John J. Scanzano",
  role: "Head Coach and Director of Evaluation",
  photo: "/team/scanzano.jpg",
  photoAlt: "Coach John J. Scanzano",
  pull: "From 4 wins to 27.",
  intro:
    "A proven baseball coach, program director, and leader with over 20 years of coaching, scouting, and athletic administration experience, working with athletes from the high school level through professional sports.",
  stats: [
    { value: "4 to 27", label: "wins in two seasons" },
    { value: "150+", label: "college commitments" },
    { value: "2018", label: "NACA National Coach of the Year" },
    { value: "300+", label: "athletes trained annually" },
    { value: "20+", label: "years coaching and scouting" },
    { value: "100+", label: "wins and a national title at King's Christian" },
  ],
  meta: [
    { label: "Now", value: "Head Baseball Coach, Camden County College" },
    { label: "Also", value: "Scanzano Sports, Cherry Hill, NJ" },
    { label: "Experience", value: "20+ years, high school through pro" },
  ],
  sections: [
    {
      heading: "Camden County",
      paragraphs: [
        "This will be his third official season as Head Baseball Coach at Camden County College in 2026. Coach Scanzano has engineered a dramatic program turnaround, raising the team from just 4 wins to 27 wins within two seasons.",
        "Under his leadership, Camden County earned its first playoff berth since 2019, led the nation in stolen bases with an aggressive, high IQ style of play, and produced four All-Region selections, including the college's first First-Team All-American honoree since 2018.",
      ],
    },
    {
      heading: "Scanzano Sports",
      paragraphs: [
        "Alongside his collegiate coaching success, John was Managing Partner and Director of Baseball Operations at Scanzano Sports and Combat Baseball in Cherry Hill, NJ. For over seven years he and his brother Mike have built the organization into one of the region's premier player development programs, overseeing more than 25 tournament teams and training 300 to 350 athletes annually.",
        "Through individualized development plans, advanced training systems, and year round instruction, the program has helped produce more than 150 college baseball commitments across all NCAA and NJCAA levels.",
      ],
    },
    {
      heading: "The championship years",
      paragraphs: [
        "Before joining Camden County College, John spent nine years as Head Baseball Coach at The King's Christian School, where he rebuilt a one win team into a nationally recognized program.",
        "His tenure included over 100 victories, three straight PJAA Conference Championships from 2017 to 2019, a 2017 NACA National Runner Up finish, and the 2018 NACA Division I National Championship. That same year, he was named the 2018 NACA National Coach of the Year.",
      ],
    },
    {
      heading: "Pro scouting",
      paragraphs: [
        "John's professional background also includes scouting at the pro level. In 2021, he partnered with MLB World Series Champion Coach Milt Thompson to launch a post-graduate baseball program designed to support high school athletes whose opportunities were impacted by the pandemic, further extending his commitment to player development and long term athletic guidance.",
      ],
    },
    {
      heading: "Earlier career",
      paragraphs: [
        "Earlier in his career, Scanzano served as Athletic Director and Physical Education Teacher at Living Faith Christian Academy, beginning in 2002. There he built multiple athletic programs from the ground up, coached soccer, basketball, track and field, and baseball, and developed an international student host family exchange program. LFCA's boys' basketball program won two national championships during his tenure.",
        "In 2008, he helped establish a partnership with Apex Academies, whose notable alumni include NBA stars Marcus and Markieff Morris.",
        "A lifelong athlete, John was a multisport standout at Cherokee High School and Milford Academy Prep, competing in football, basketball, track and field, and baseball, where he served as a team captain. He continued his baseball career at Rowan Burlington County College.",
      ],
    },
  ],
};

const CZAHOR: Person = {
  name: "Dr. Michael S. Czahor",
  role: "Founder and CTO",
  photo: "/team/czahor.webp",
  photoAlt: "Dr. Michael S. Czahor",
  pull: "Seven years inside MLB front offices.",
  intro: "",
  stats: [
    { value: "7", label: "years, senior quant roles across three MLB front offices" },
    { value: "Dual PhD", label: "Statistics and Wind Engineering, Iowa State" },
    { value: "AthlyticZ", label: "founder" },
    { value: "15+", label: "countries, students trained in AI and data science" },
    { value: "Boston College", label: "graduate instructor, sports analytics" },
    { value: "NSF IGERT", label: "fellow" },
  ],
  meta: [
    { label: "Now", value: "Founder and CTO, RPM Recruit" },
    { label: "Also", value: "Founder, AthlyticZ" },
    { label: "Teaches", value: "Graduate analytics, Boston College" },
  ],
  sections: [
    {
      heading: "The front office years",
      paragraphs: [
        "Dr. Czahor spent seven years holding senior quantitative roles across three Major League Baseball front offices, working on player evaluation, forecasting, and the tools that put analysis in front of coaches, scouts, and executives.",
        "He holds a dual PhD in Statistics and Wind Engineering and is the founder of AthlyticZ, a sports data science education platform training students and professionals in over 15 countries.",
      ],
    },
    {
      heading: "Now",
      paragraphs: [
        "He teaches graduate analytics at Boston College and serves as CTO of an elite golf training facility. At RPM Recruit, he leads product and engineering: the player experience, the app, and the team building the systems behind it.",
      ],
    },
  ],
};

/* ------------------------------------------------------------------ */
/*  Composition                                                        */
/* ------------------------------------------------------------------ */

function ScoutingCard({ person }: { person: Person }) {
  return (
    <div className="bg-ink border border-ink-3 rounded-lg overflow-hidden shadow-lg">
      <div className="duotone relative aspect-[3/4]">
        <Image
          src={person.photo}
          alt={person.photoAlt}
          fill
          sizes="(min-width: 1024px) 360px, 100vw"
          className="object-cover object-top"
          priority
        />
      </div>

      <div className="p-4 lg:p-5">
        <p className="font-condensed text-micro font-bold tracking-[0.24em] uppercase text-gold">
          {person.role}
        </p>
        <h2 className="font-display text-title-lg lg:text-display-sm font-bold text-bone leading-tight mt-1">
          {person.name}
        </h2>

        <dl className="mt-4 flex flex-col">
          {person.meta.map((row) => (
            <div
              key={row.label}
              className="flex items-baseline gap-3 py-2 border-t border-ink-3"
            >
              <dt className="font-condensed text-micro font-bold tracking-[0.2em] uppercase text-ink-5 w-20 shrink-0">
                {row.label}
              </dt>
              <dd className="text-caption text-slate-2 text-pretty">{row.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}

/**
 * Stat callouts. Six per person, which divides evenly into both grids the
 * page uses, so no cell is ever left empty at any width. The grid is a
 * hairline lattice: an unfilled cell would read as a block of rule colour,
 * which is exactly the bug this replaced.
 *
 * The card geometry arrives on the needle curve; the figure inside it does
 * not animate at all. A number mid flight is a number that is not yet true,
 * and these are the claims the page rests on.
 */
function Stats({ stats }: { stats: Stat[] }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-px bg-bone-3 border border-bone-3 rounded-md overflow-hidden">
      {stats.map((stat, i) => (
        <Reveal key={stat.label} effect="stat" delay={i * 70} className="block">
          <div className="h-full bg-white px-3.5 py-3.5">
            <p
              className={`font-mono num font-bold text-ink leading-none ${
                stat.value.length > 7 ? "text-title-sm" : "text-display-sm"
              }`}
            >
              {stat.value}
            </p>
            <p className="font-condensed text-micro font-bold tracking-[0.16em] uppercase text-ink-5 mt-1.5 text-pretty">
              {stat.label}
            </p>
          </div>
        </Reveal>
      ))}
    </div>
  );
}

function Profile({ person, reversed = false }: { person: Person; reversed?: boolean }) {
  return (
    <section className="mx-auto max-w-7xl px-gutter lg:px-6 py-12 lg:py-20">
      <div
        className={`lg:grid lg:gap-14 xl:gap-20 ${
          reversed
            ? "lg:grid-cols-[minmax(0,1fr)_minmax(0,340px)]"
            : "lg:grid-cols-[minmax(0,340px)_minmax(0,1fr)]"
        }`}
      >
        <Reveal
          className={`block mb-8 lg:mb-0 ${reversed ? "lg:order-2" : ""}`}
        >
          <div className="lg:sticky lg:top-24">
            <ScoutingCard person={person} />
          </div>
        </Reveal>

        <div className={`min-w-0 ${reversed ? "lg:order-1" : ""}`}>
          <Reveal className="block">
            <p className="font-display text-display-lg lg:text-numeral font-bold text-ink leading-none text-balance">
              {person.pull}
            </p>
            {person.intro && (
              <p className="text-body-lg text-ink-5 leading-relaxed mt-4 max-w-[62ch] text-pretty">
                {person.intro}
              </p>
            )}
          </Reveal>

          <div className="mt-7">
            <Stats stats={person.stats} />
          </div>

          <div className="mt-9 flex flex-col gap-8">
            {person.sections.map((section, i) => (
              <Reveal key={section.heading} className="block" delay={i * 50}>
                <h3 className="font-condensed text-label font-bold tracking-[0.24em] uppercase text-gold mb-2.5">
                  {section.heading}
                </h3>
                <div className="flex flex-col gap-3 max-w-[68ch]">
                  {section.paragraphs.map((paragraph) => (
                    <p
                      key={paragraph.slice(0, 40)}
                      className="text-body text-ink-4 leading-relaxed text-pretty"
                    >
                      {paragraph}
                    </p>
                  ))}
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default function AboutPage() {
  return (
    <>
      <section className="bg-ink">
        <div className="mx-auto max-w-7xl px-gutter lg:px-6 pt-12 pb-12 lg:pt-20 lg:pb-16">
          <p className="font-condensed text-label font-bold tracking-[0.24em] uppercase text-gold mb-3">
            The team behind RPM Recruit
          </p>
          <h1 className="font-display text-display-lg lg:text-numeral font-bold text-bone leading-none text-balance max-w-[24ch]">
            A college head coach and a front office quant.
          </h1>
          <p className="text-body-lg text-slate-2 leading-relaxed max-w-[62ch] mt-5 text-pretty">
            The evaluation in this product is one coach&apos;s, built over twenty
            years of putting players into college programs. The system that runs
            it at scale is built by someone who spent seven years doing this
            work inside Major League Baseball front offices. That is the whole
            company: the read, and the machine that carries it.
          </p>
        </div>
        <div className="h-0.5 bg-gold" />
      </section>

      <Profile person={SCANZANO} />

      <div className="mx-auto max-w-7xl px-gutter lg:px-6">
        <div className="h-px bg-bone-3" />
      </div>

      <Profile person={CZAHOR} reversed />

      <section className="bg-ink">
        <div className="mx-auto max-w-7xl px-gutter lg:px-6 py-14 lg:py-20 text-center">
          <Reveal>
            <h2 className="font-display text-display-lg lg:text-numeral font-bold text-bone leading-none text-balance">
              Talk to the coach, not a sales desk.
            </h2>
            <p className="text-body-lg text-slate-2 max-w-[48ch] mx-auto mt-4 text-pretty">
              Tell us about the player and Coach Scanzano&apos;s team calls you
              within 48 hours. Nothing is charged from that form.
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
