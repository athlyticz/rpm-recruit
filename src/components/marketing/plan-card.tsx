import Link from "next/link";
import { Check } from "lucide-react";
import { PLANS, type PlanKey } from "@/config/pricing";
import { Reveal } from "@/components/marketing/reveal";

/** Who each plan is for, in plain words. */
const AUDIENCE: Record<PlanKey, string> = {
  showcase: "For a family getting a player recruited this cycle",
  monthly: "For a player who wants to keep the profile live",
  scout: "For a coach or scout evaluating players",
  org: "For a showcase, academy, or travel organization",
};

/**
 * One plan, built as a scouting card rather than a box.
 *
 * The composition is the one the team cards on /about use: an ink plate
 * carrying the identity and the number, a lighter body carrying the detail,
 * and a hairline between them. Two surfaces, not one flat panel.
 */
export function PlanCard({
  planKey,
  index = 0,
  compact = false,
}: {
  planKey: PlanKey;
  index?: number;
  /** The landing page shows a shorter list; pricing shows all of it. */
  compact?: boolean;
}) {
  const plan = PLANS[planKey];
  const featured = planKey === "showcase";
  const inBuild = plan.availability === "in_build";
  const features = compact ? plan.features.slice(0, 4) : plan.features;

  return (
    <Reveal delay={index * 70} className="block h-full">
      <div
        className={`h-full flex flex-col rounded-lg overflow-hidden bg-white transition-shadow dur-base ${
          featured
            ? "border border-gold shadow-lg"
            : "border border-black/[0.07] shadow-sm hover:shadow-md"
        }`}
      >
        {/* The plate. Ink, like the name plate on a scouting card. */}
        <div className="bg-ink">
          {featured && (
            <p className="font-condensed text-micro font-bold tracking-[0.24em] uppercase text-ink bg-gold px-4 py-1.5 text-center">
              Where most families start
            </p>
          )}

          <div className="px-4 lg:px-5 pt-4 pb-4">
            <div className="flex items-start justify-between gap-3">
              <h3 className="font-display text-title-lg font-bold text-bone leading-tight">
                {plan.name}
              </h3>
              {inBuild && (
                <span className="shrink-0 font-condensed text-micro font-bold tracking-[0.16em] uppercase text-slate-2 border border-dashed border-ink-4 rounded-xs px-1.5 py-0.5">
                  In build
                </span>
              )}
            </div>
            <p className="text-caption text-slate-2 mt-1 text-pretty">
              {AUDIENCE[planKey]}
            </p>

            <p className="mt-4 flex items-baseline gap-1.5">
              <span className="font-display num text-numeral font-bold text-bone leading-none">
                ${plan.price.toLocaleString()}
              </span>
              <span className="font-mono text-meta text-slate">
                {plan.interval ? `/${plan.interval}` : "one time"}
              </span>
            </p>
            <p className="text-caption text-slate mt-1.5">{plan.description}</p>
          </div>
        </div>

        {/* The body. */}
        <div className="px-4 lg:px-5 py-4 flex flex-col flex-1">
          {inBuild && (
            <p className="text-caption text-ink-5 mb-3 pb-3 border-b border-black/[0.06] text-pretty">
              Priced now, in build for launch. At launch it includes:
            </p>
          )}

          <ul className="flex flex-col gap-2.5 flex-1">
            {features.map((feature) => (
              <li
                key={feature}
                className="text-body text-ink-4 flex items-start gap-2.5 text-pretty"
              >
                <Check size={14} aria-hidden className="text-gold shrink-0 mt-0.5" />
                {feature}
              </li>
            ))}
          </ul>

          <Link
            href={`/start?plan=${planKey}`}
            className={`pressable focusable press-redline mt-6 flex items-center justify-center min-h-touch text-center font-condensed text-label font-bold tracking-[0.16em] uppercase rounded-sm transition-colors dur-fast ${
              featured
                ? "bg-gold text-ink hover:bg-gold-2"
                : "bg-ink text-bone hover:bg-gold hover:text-ink"
            }`}
          >
            Start Today
          </Link>
        </div>
      </div>
    </Reveal>
  );
}
