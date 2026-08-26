"use client";

export interface RadarAxis {
  label: string;
  /** 1-10, or null when that skill has no rating from this evaluator. */
  self: number | null;
  coach: number | null;
}

// The box is wider than the plot so axis labels have room to sit outside the
// outer ring without being clipped at the viewBox edge.
const SIZE = 288;
const CX = SIZE / 2;
const CY = SIZE / 2;
const R = 74;
const RINGS = [2, 4, 6, 8, 10];

function point(index: number, count: number, value: number) {
  // Start at twelve o'clock and go clockwise.
  const angle = (index / count) * Math.PI * 2 - Math.PI / 2;
  const radius = (value / 10) * R;
  return { x: CX + radius * Math.cos(angle), y: CY + radius * Math.sin(angle) };
}

function polygon(axes: RadarAxis[], pick: (a: RadarAxis) => number | null) {
  const values = axes.map(pick);
  if (values.some((v) => v === null)) return null;
  return values
    .map((v, i) => {
      const p = point(i, axes.length, v as number);
      return `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`;
    })
    .join(" ") + " Z";
}

export function SkillRadar({
  axes: allAxes,
  position,
}: {
  axes: RadarAxis[];
  position: string;
}) {
  /*
   * Only skills with at least one rating become axes. Carrying unrated skills
   * would force every polygon to bail (a shape is all-or-nothing, since a
   * missing point is not a zero), which previously left the grid drawn, the
   * legend claiming two series, and nothing plotted. That reads as broken
   * rather than as honest.
   */
  const axes = allAxes.filter((a) => a.self !== null || a.coach !== null);
  const unrated = allAxes.length - axes.length;

  const hasSelf = axes.some((a) => a.self !== null);
  const hasCoach = axes.some((a) => a.coach !== null);

  // A polygon needs three points, and every one of them has to be real.
  const plottable = axes.length >= 3;
  const selfPath = plottable ? polygon(axes, (a) => a.self) : null;
  const coachPath = plottable ? polygon(axes, (a) => a.coach) : null;

  const selfPartial = hasSelf && !selfPath;
  const coachPartial = hasCoach && !coachPath;

  return (
    <section className="bg-white border border-black/[0.07] rounded-md shadow-sm overflow-hidden">
      <div className="px-4 pt-3.5 pb-2 border-b border-black/[0.06]">
        <h2 className="font-condensed text-micro font-bold tracking-[0.24em] uppercase text-slate">
          Skill shape
        </h2>
        <p className="text-caption text-ink-5 mt-0.5 text-pretty">
          Your {position} ratings on the 1-10 scale
          {hasCoach ? ", with a coach's evaluation over your own." : "."}
        </p>
      </div>

      {!hasSelf && !hasCoach || !plottable ? (
        /* Dormant state: the grid with no shape on it. Drawing a sample
           polygon here would be indistinguishable from a real evaluation. */
        <div className="px-4 py-6 text-center">
          <svg viewBox={`0 0 ${SIZE} ${SIZE}`} width="100%" className="max-w-[240px] mx-auto opacity-40" aria-hidden>
            {RINGS.map((ring) => (
              <circle
                key={ring}
                cx={CX}
                cy={CY}
                r={(ring / 10) * R}
                fill="none"
                stroke="var(--viz-reference)"
                strokeWidth={0.75}
              />
            ))}
          </svg>
          <p className="font-display text-title-sm font-bold text-ink text-balance mt-2">
            {hasSelf || hasCoach ? "Not enough ratings yet" : "No ratings yet"}
          </p>
          <p className="text-caption text-ink-5 max-w-[42ch] mx-auto mt-1 text-pretty">
            {hasSelf || hasCoach
              ? `A shape needs at least three rated skills. You have ${axes.length}. Rate the rest on the Position Scores page.`
              : "Rate your skills on the Position Scores page and your shape appears here. A coach's evaluation overlays yours once one exists."}
          </p>
        </div>
      ) : (
        <>
          <div className="px-4 py-3">
            <svg
              viewBox={`0 0 ${SIZE} ${SIZE}`}
              width="100%"
              className="max-w-[280px] mx-auto"
              role="img"
              aria-label={`Skill shape across ${axes.length} skills${hasCoach ? ", self and coach ratings" : ""}`}
            >
              {RINGS.map((ring) => (
                <circle
                  key={ring}
                  cx={CX}
                  cy={CY}
                  r={(ring / 10) * R}
                  fill="none"
                  stroke="var(--viz-reference)"
                  strokeWidth={ring === 10 ? 1 : 0.6}
                />
              ))}

              {axes.map((axis, i) => {
                const outer = point(i, axes.length, 10);
                const labelAt = point(i, axes.length, 11.9);
                return (
                  <g key={axis.label}>
                    <line
                      x1={CX}
                      y1={CY}
                      x2={outer.x}
                      y2={outer.y}
                      stroke="var(--viz-reference)"
                      strokeWidth={0.6}
                    />
                    <text
                      x={labelAt.x}
                      y={labelAt.y}
                      textAnchor={
                        Math.abs(labelAt.x - CX) < 6
                          ? "middle"
                          : labelAt.x > CX
                            ? "start"
                            : "end"
                      }
                      dominantBaseline="middle"
                      fontSize={8}
                      fontFamily="var(--font-condensed)"
                      letterSpacing={0.6}
                      fill="var(--viz-label)"
                    >
                      {axis.label}
                    </text>
                  </g>
                );
              })}

              {/* Self first, so a coach's shape reads on top of it. */}
              {selfPath && (
                <path
                  d={selfPath}
                  fill="var(--viz-verify-self)"
                  fillOpacity={0.16}
                  stroke="var(--viz-verify-self)"
                  strokeWidth={1.5}
                  strokeDasharray="4 3"
                  className="motion-safe:transition-all motion-safe:dur-slow"
                  style={{ transitionTimingFunction: "var(--ease-needle)" }}
                />
              )}
              {coachPath && (
                <path
                  d={coachPath}
                  fill="var(--viz-verify-coach)"
                  fillOpacity={0.2}
                  stroke="var(--viz-verify-coach)"
                  strokeWidth={2}
                  className="motion-safe:transition-all motion-safe:dur-slow"
                  style={{ transitionTimingFunction: "var(--ease-needle)" }}
                />
              )}
            </svg>
          </div>

          <div className="px-4 py-2.5 border-t border-black/[0.06] bg-bone/40">
            <div className="flex flex-wrap gap-x-4 gap-y-1">
              {selfPath && (
                <span className="inline-flex items-center gap-1.5 text-micro text-ink-5">
                  <svg width="16" height="8" aria-hidden>
                    <line x1="0" y1="4" x2="16" y2="4" stroke="var(--viz-verify-self)" strokeWidth="1.5" strokeDasharray="4 3" />
                  </svg>
                  Your rating
                </span>
              )}
              {coachPath && (
                <span className="inline-flex items-center gap-1.5 text-micro text-ink-5">
                  <svg width="16" height="8" aria-hidden>
                    <line x1="0" y1="4" x2="16" y2="4" stroke="var(--viz-verify-coach)" strokeWidth="2" />
                  </svg>
                  Coach evaluation
                </span>
              )}
            </div>

            {(selfPartial || coachPartial || unrated > 0) && (
              <p className="text-caption text-ink-5 mt-2 text-pretty">
                {unrated > 0 &&
                  `${unrated} skill${unrated === 1 ? "" : "s"} for this position ${unrated === 1 ? "has" : "have"} no rating and ${unrated === 1 ? "is" : "are"} left off the shape. `}
                {selfPartial && "Your own ratings do not cover every plotted skill, so your shape is not drawn. "}
                {coachPartial && "The coach evaluation does not cover every plotted skill, so it is not drawn."}
              </p>
            )}

            {selfPath && !hasCoach && (
              /* The argument for verification, stated where it lands hardest. */
              <p className="text-caption text-ink-5 mt-2 text-pretty">
                Only your own rating is on file. A coach evaluation would overlay this shape,
                and coaches weigh their own far more heavily than a self report.
              </p>
            )}
          </div>
        </>
      )}
    </section>
  );
}
