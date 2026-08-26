import { Tachometer } from "@/components/ui/tachometer";
import { Reveal } from "@/components/marketing/reveal";

/* ------------------------------------------------------------------ */
/*  Vignettes                                                          */
/* ------------------------------------------------------------------ */

/*
 * Each tile carries an abstract fragment of the component it describes, drawn
 * in the same language the app draws in: the same tick ladder, the same fit
 * bands, the same verification marks.
 *
 * They are deliberately not screenshots and deliberately carry no values. A
 * fragment with numbers on it would be sample data on a surface that has not
 * earned a Sample label, and a screenshot would go stale the first time the
 * app moved. These are the shapes, empty.
 */

const VIGNETTE_SVG = "w-full h-full";

/** The 1 to 10 ladder, drawn without a rating on it. */
function ScaleVignette() {
  return (
    <svg viewBox="0 0 240 60" className={VIGNETTE_SVG} aria-hidden>
      {Array.from({ length: 10 }).map((_, i) => {
        const x = 16 + i * 23;
        const tall = i >= 7;
        return (
          <line
            key={i}
            x1={x}
            x2={x}
            y1={tall ? 16 : 24}
            y2={44}
            stroke={tall ? "var(--color-gold)" : "var(--viz-reference)"}
            strokeWidth={tall ? 2 : 1}
          />
        );
      })}
      <line
        x1={16}
        x2={223}
        y1={48}
        y2={48}
        stroke="var(--viz-reference)"
        strokeWidth={1}
      />
    </svg>
  );
}

/** The fit bands and the in range threshold, with nothing plotted on them. */
function BandsVignette() {
  return (
    <svg viewBox="0 0 240 60" className={VIGNETTE_SVG} aria-hidden>
      <rect x={16} y={22} width={72} height={10} rx={5} fill="var(--viz-fit-longshot)" opacity={0.55} />
      <rect x={92} y={22} width={64} height={10} rx={5} fill="var(--viz-fit-reach)" opacity={0.55} />
      <rect x={160} y={22} width={64} height={10} rx={5} fill="var(--viz-fit-strong)" opacity={0.75} />
      <line
        x1={156}
        x2={156}
        y1={12}
        y2={46}
        stroke="var(--viz-reference-strong)"
        strokeWidth={1}
        strokeDasharray="3 3"
      />
      <line x1={16} x2={224} y1={46} y2={46} stroke="var(--viz-reference)" strokeWidth={1} />
    </svg>
  );
}

/** Self reported, coach verified, event verified: hollow, gold, solid. */
function VerificationVignette() {
  return (
    <svg viewBox="0 0 240 60" className={VIGNETTE_SVG} aria-hidden>
      <line x1={40} x2={200} y1={30} y2={30} stroke="var(--viz-reference)" strokeWidth={1} />
      <circle cx={40} cy={30} r={8} fill="white" stroke="var(--viz-verify-event)" strokeWidth={1.5} />
      <circle cx={120} cy={30} r={8} fill="var(--viz-verify-coach)" stroke="var(--viz-verify-event)" strokeWidth={1.5} />
      <circle cx={200} cy={30} r={8} fill="var(--viz-verify-event)" stroke="var(--viz-verify-event)" strokeWidth={1.5} />
    </svg>
  );
}

/** A letter, reduced to its shape. The only real word is the salutation. */
function LetterVignette() {
  return (
    <svg viewBox="0 0 240 60" className={VIGNETTE_SVG} aria-hidden>
      <text
        x={20}
        y={18}
        className="font-mono"
        fontSize={9}
        fill="var(--color-ink-4)"
      >
        Coach,
      </text>
      {[0, 1, 2].map((i) => (
        <rect
          key={i}
          x={20}
          y={28 + i * 9}
          width={[200, 186, 132][i]}
          height={3}
          rx={1.5}
          fill="var(--viz-reference)"
          opacity={0.55}
        />
      ))}
      <rect x={156} y={46} width={2} height={9} fill="var(--color-gold)" />
    </svg>
  );
}

/** A bio, reduced to its shape, opened by a display quote. */
function BioVignette() {
  return (
    <svg viewBox="0 0 240 60" className={VIGNETTE_SVG} aria-hidden>
      <text
        x={18}
        y={34}
        className="font-display"
        fontSize={34}
        fontWeight={700}
        fill="var(--color-gold)"
        opacity={0.5}
      >
        &ldquo;
      </text>
      {[0, 1, 2].map((i) => (
        <rect
          key={i}
          x={52}
          y={18 + i * 11}
          width={[168, 156, 108][i]}
          height={3}
          rx={1.5}
          fill="var(--viz-reference)"
          opacity={0.55}
        />
      ))}
    </svg>
  );
}

/** A checklist, two done and one waiting. */
function ChecklistVignette() {
  return (
    <svg viewBox="0 0 240 60" className={VIGNETTE_SVG} aria-hidden>
      {[0, 1, 2].map((i) => {
        const y = 14 + i * 17;
        const done = i < 2;
        return (
          <g key={i}>
            <rect
              x={24}
              y={y - 6}
              width={12}
              height={12}
              rx={2}
              fill={done ? "var(--color-gold)" : "white"}
              stroke={done ? "var(--color-gold)" : "var(--viz-reference)"}
              strokeWidth={1.5}
            />
            {done && (
              <path
                d={`M27 ${y} l3 3 l6 -7`}
                fill="none"
                stroke="var(--color-ink)"
                strokeWidth={1.6}
                strokeLinecap="round"
              />
            )}
            <rect
              x={48}
              y={y - 2}
              width={[150, 128, 168][i]}
              height={3}
              rx={1.5}
              fill="var(--viz-reference)"
              opacity={done ? 0.35 : 0.6}
            />
          </g>
        );
      })}
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  The section                                                        */
/* ------------------------------------------------------------------ */

const TILES = [
  {
    title: "Position evaluations",
    body: "Rated skill by skill on the 1 to 10 showcase scale, the same ladder coaches already use.",
    vignette: <ScaleVignette />,
  },
  {
    title: "College match engine",
    body: "Every program in the database scored on five components, sorted honestly, with the arithmetic shown.",
    vignette: <BandsVignette />,
  },
  {
    title: "Athletic profile",
    body: "Measurables tracked over time, each one carrying the level of proof it arrived with.",
    vignette: <VerificationVignette />,
  },
  {
    title: "Letter builder",
    body: "Coach outreach drafted from your real evaluation data, not from a blank page.",
    vignette: <LetterVignette />,
  },
  {
    title: "Bio draft builder",
    body: "A third person scouting narrative you can put in front of a coaching staff.",
    vignette: <BioVignette />,
  },
  {
    title: "Recruiting toolkit",
    body: "Cost tracker, eligibility checklist, interview prep, and a pitching log.",
    vignette: <ChecklistVignette />,
  },
];

export function Inside() {
  return (
    <section className="mx-auto max-w-7xl px-gutter lg:px-6 py-8 lg:py-24">
      <Reveal className="max-w-[46ch] mb-8">
        <p className="font-condensed text-label font-bold tracking-[0.24em] uppercase text-gold mb-2">
          Inside
        </p>
        <h2 className="font-display text-display-lg lg:text-numeral font-bold text-ink leading-none text-balance">
          The whole recruiting job, in one place.
        </h2>
      </Reveal>

      {/* The gauge anchors the section: one instance, at rest, unrated. It is
          the brand object and it is also the thing every tile below points
          at. No number, because there is no player here to have one. */}
      <Reveal className="block mb-4">
        <div className="bg-ink border border-ink-3 rounded-lg overflow-hidden">
          <div className="flex flex-col sm:flex-row items-center gap-5 lg:gap-8 p-5 lg:p-6">
            <Tachometer
              score={null}
              size="card"
              emptyText="--"
              label="Not rated yet"
              animated={false}
              className="shrink-0"
            />
            <div className="min-w-0 text-center sm:text-left">
              <p className="font-condensed text-micro font-bold tracking-[0.24em] uppercase text-gold mb-2">
                Everything points at one number
              </p>
              <p className="font-display text-title-lg lg:text-display-sm font-bold text-bone leading-tight text-balance">
                Every tool below feeds the same evaluation, and the evaluation
                is what a coach actually asks about.
              </p>
              <p className="text-body text-slate-2 leading-relaxed mt-2.5 max-w-[52ch] text-pretty">
                Build the profile once. The rating, the program list, and the
                letters all read from it, which is why none of them can
                disagree with each other.
              </p>
            </div>
          </div>
        </div>
      </Reveal>

      {/* Six tiles: divides evenly into both grids, so no cell is ever empty. */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {TILES.map((tile, i) => (
          <Reveal key={tile.title} delay={i * 60} className="block h-full">
            <div className="h-full flex flex-col bg-white border border-black/[0.07] rounded-md shadow-sm overflow-hidden">
              <div className="h-[84px] bg-bone/70 border-b border-black/[0.06] px-4 py-3">
                {tile.vignette}
              </div>
              <div className="p-4">
                <h3 className="font-display text-title-sm font-bold text-ink">
                  {tile.title}
                </h3>
                <p className="text-body text-ink-5 leading-relaxed mt-1 text-pretty">
                  {tile.body}
                </p>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
