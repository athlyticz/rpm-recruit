import Link from "next/link";
import type { Metadata } from "next";
import { Check } from "lucide-react";
import { PLANS, type PlanKey } from "@/config/pricing";
import { Reveal } from "@/components/marketing/reveal";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "RPM Recruit pricing: Showcase Package, Monthly, Scout and Coach, and Organization plans. Every plan starts with a phone call.",
};

/** Who each plan is actually for, in plain words. */
const AUDIENCE: Record<PlanKey, string> = {
  showcase: "For a family getting a player recruited this cycle",
  monthly: "For a player who wants to keep the profile live",
  scout: "For a coach or scout evaluating players",
  org: "For a showcase, academy, or travel organization",
};

const ORDER: PlanKey[] = ["showcase", "monthly", "scout", "org"];

function PlanCard({ planKey, index }: { planKey: PlanKey; index: number }) {
  const plan = PLANS[planKey];
  const featured = planKey === "showcase";

  return (
    <Reveal delay={index * 70} className="block h-full">
      <div
        className={`h-full flex flex-col rounded-lg overflow-hidden transition-shadow dur-base ${
          featured
            ? "bg-ink border border-gold shadow-lg"
            : "bg-white border border-black/[0.07] shadow-sm hover:shadow-md"
        }`}
      >
        {featured && (
          <p className="font-condensed text-micro font-bold tracking-[0.24em] uppercase text-ink bg-gold px-4 py-1.5 text-center">
            Where most families start
          </p>
        )}

        <div className="p-5 lg:p-6 flex flex-col flex-1">
          <h2
            className={`font-display text-title-lg font-bold ${
              featured ? "text-bone" : "text-ink"
            }`}
          >
            {plan.name}
          </h2>
          <p
            className={`text-caption mt-1 text-pretty ${
              featured ? "text-slate-2" : "text-slate"
            }`}
          >
            {AUDIENCE[planKey]}
          </p>

          <p className="mt-5 flex items-baseline gap-1.5">
            <span
              className={`font-display num text-numeral font-bold leading-none ${
                featured ? "text-bone" : "text-ink"
              }`}
            >
              ${plan.price.toLocaleString()}
            </span>
            <span
              className={`font-mono text-meta ${featured ? "text-slate" : "text-slate"}`}
            >
              {plan.interval ? `/${plan.interval}` : "one time"}
            </span>
          </p>
          <p
            className={`text-caption mt-1.5 ${featured ? "text-slate-2" : "text-ink-5"}`}
          >
            {plan.description}
          </p>

          <ul className="flex flex-col gap-2.5 mt-6 flex-1">
            {plan.features.map((feature) => (
              <li
                key={feature}
                className={`text-body flex items-start gap-2.5 text-pretty ${
                  featured ? "text-slate-2" : "text-ink-4"
                }`}
              >
                <Check
                  size={14}
                  aria-hidden
                  className="text-gold shrink-0 mt-0.5"
                />
                {feature}
              </li>
            ))}
          </ul>

          <Link
            href={`/start?plan=${planKey}`}
            className={`pressable focusable press-redline mt-7 flex items-center justify-center min-h-touch text-center font-condensed text-label font-bold tracking-[0.16em] uppercase rounded-sm transition-colors dur-fast ${
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

export default function PricingPage() {
  return (
    <>
      <section className="bg-ink">
        <div className="mx-auto max-w-7xl px-gutter lg:px-6 pt-12 pb-10 lg:pt-16 lg:pb-14">
          <p className="font-condensed text-label font-bold tracking-[0.24em] uppercase text-gold mb-3">
            Pricing
          </p>
          <h1 className="font-display text-display-lg lg:text-numeral font-bold text-bone leading-none text-balance max-w-[22ch]">
            Every plan starts with a phone call.
          </h1>
          <p className="text-body-lg text-slate-2 leading-relaxed max-w-[58ch] mt-4 text-pretty">
            Nothing here is bought from a page. Tell us about the player,
            Coach Scanzano&apos;s team calls within 48 hours, and if it is a fit
            on both sides we walk through the plan that matches what the family
            actually needs.
          </p>
        </div>
        <div className="h-0.5 bg-gold" />
      </section>

      <section className="mx-auto max-w-7xl px-gutter lg:px-6 py-10 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-stretch">
          {ORDER.map((planKey, i) => (
            <PlanCard key={planKey} planKey={planKey} index={i} />
          ))}
        </div>

        <Reveal className="block mt-10">
          <div className="bg-white border border-black/[0.07] rounded-md p-5 lg:p-6 max-w-[70ch]">
            <h2 className="font-display text-title font-bold text-ink">
              What you are paying for
            </h2>
            <p className="text-body text-ink-5 leading-relaxed mt-2 text-pretty">
              An honest evaluation from a college head coach, a program list
              scored against your real profile across all five levels, the
              outreach materials to put in front of coaches, and a plan that
              matches the recruiting calendar. If the honest read is that a
              player is not ready for what we sell, the call will say so.
            </p>
          </div>
        </Reveal>
      </section>
    </>
  );
}
