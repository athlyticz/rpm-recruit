import Link from "next/link";
import type { Metadata } from "next";
import { PLANS, type PlanKey } from "@/config/pricing";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "RPM Recruit pricing: Showcase Package, Monthly, Scout/Coach, and Organization plans.",
};

export default function PricingPage() {
  return (
    <>
      <section className="bg-ink">
        <div className="mx-auto max-w-7xl px-6 py-16">
          <div className="font-condensed text-label font-bold tracking-[0.22em] uppercase text-gold mb-2">
            Pricing
          </div>
          <h1 className="font-display text-4xl font-bold text-bone">
            Choose Your Plan
          </h1>
          <p className="text-slate-2 mt-3 max-w-xl">
            Whether you are a player building your recruiting profile, a scout
            evaluating talent, or an organization running showcases.
          </p>
        </div>
        <div className="h-px bg-gold/20" />
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {(Object.keys(PLANS) as PlanKey[]).map((key) => {
            const plan = PLANS[key];
            const featured = key === "showcase";
            return (
              <div
                key={key}
                className={`bg-white border p-7 flex flex-col ${
                  featured
                    ? "border-gold shadow-md relative"
                    : "border-black/[0.06] shadow-sm"
                }`}
              >
                {featured && (
                  <div className="absolute -top-px left-0 right-0 h-[3px] bg-gold" />
                )}
                <h2 className="font-display text-xl font-semibold text-ink">
                  {plan.name}
                </h2>
                <div className="mt-4 mb-1">
                  <span className="font-display text-5xl font-bold text-ink leading-none">
                    ${plan.price.toLocaleString()}
                  </span>
                  {plan.interval ? (
                    <span className="text-sm text-slate ml-1">
                      /{plan.interval}
                    </span>
                  ) : (
                    <span className="text-sm text-slate ml-1">one-time</span>
                  )}
                </div>
                <p className="text-sm text-slate mb-6">{plan.description}</p>
                <ul className="space-y-3 mb-8 flex-1">
                  {plan.features.map((f) => (
                    <li
                      key={f}
                      className="text-sm text-ink-4 flex items-start gap-2.5"
                    >
                      <span className="text-gold text-xs mt-0.5">&#10003;</span>
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/signup"
                  className={`flex items-center justify-center min-h-touch text-center font-condensed text-xs font-bold tracking-[0.13em] uppercase py-3 transition-colors dur-fast ${
                    featured
                      ? "bg-ink text-bone hover:bg-gold hover:text-ink"
                      : "bg-bone text-ink-4 hover:bg-ink hover:text-bone"
                  }`}
                >
                  Get Started
                </Link>
              </div>
            );
          })}
        </div>
      </section>
    </>
  );
}
