import type { Metadata } from "next";
import { type PlanKey } from "@/config/pricing";
import { PlanCard } from "@/components/marketing/plan-card";
import { Reveal } from "@/components/marketing/reveal";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "RPM Recruit pricing: Showcase Package, Monthly, Scout and Coach, and Organization plans. Every plan starts with a phone call.",
};

const ORDER: PlanKey[] = ["showcase", "monthly", "scout", "org"];

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
