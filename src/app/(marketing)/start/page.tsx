import type { Metadata } from "next";
import Link from "next/link";
import { LeadForm } from "@/components/marketing/lead-form";
import { PLANS, type PlanKey } from "@/config/pricing";

export const metadata: Metadata = {
  title: "Start Today",
  description:
    "Tell us about the player. Coach Scanzano's team calls you within 48 hours.",
};

const REASSURANCE = [
  {
    title: "You talk to a college coach",
    body: "John Scanzano is the head coach at Camden County College and has put more than 150 players into college programs. The call is with his team, not a sales desk.",
  },
  {
    title: "An honest read, even when it is not what you hoped",
    body: "If the level is D3 or JUCO, we say D3 or JUCO, and we say what would move it. Nobody is served by a number that flatters.",
  },
  {
    title: "Nothing is charged from this form",
    body: "No card, no account, no automatic anything. If you decide to go ahead after the call, that is a separate conversation.",
  },
];

export default async function StartPage({
  searchParams,
}: {
  searchParams: Promise<{ plan?: string }>;
}) {
  const { plan } = await searchParams;
  const planKey = plan && plan in PLANS ? (plan as PlanKey) : undefined;
  const planName = planKey ? PLANS[planKey].name : undefined;

  return (
    <>
      <section className="bg-ink">
        <div className="mx-auto max-w-7xl px-gutter lg:px-6 pt-12 pb-10 lg:pt-16 lg:pb-14">
          <p className="font-condensed text-label font-bold tracking-[0.24em] uppercase text-gold mb-3">
            Start today
          </p>
          <h1 className="font-display text-display-lg lg:text-numeral font-bold text-bone leading-none text-balance max-w-[20ch]">
            The first step is a phone call.
          </h1>
          <p className="text-body-lg text-slate-2 leading-relaxed max-w-[58ch] mt-4 text-pretty">
            Tell us who the player is and how to reach you. Coach Scanzano&apos;s
            team calls within 48 hours to talk through where he stands, what the
            realistic list looks like, and whether we are the right fit for the
            family.
            {planName && (
              <>
                {" "}
                We have noted that you were looking at the{" "}
                <span className="text-bone">{planName}</span>.
              </>
            )}
          </p>
        </div>
        <div className="h-0.5 bg-gold" />
      </section>

      <section className="mx-auto max-w-7xl px-gutter lg:px-6 py-10 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_320px] gap-8 lg:gap-14 items-start">
          <LeadForm planInterest={planKey} source="marketing:start" />

          <aside className="flex flex-col gap-6">
            {REASSURANCE.map((item) => (
              <div key={item.title}>
                <h2 className="font-display text-title-sm font-bold text-ink">
                  {item.title}
                </h2>
                <p className="text-body text-ink-5 leading-relaxed mt-1 text-pretty">
                  {item.body}
                </p>
              </div>
            ))}

            <p className="text-caption text-slate pt-5 border-t border-black/[0.06] text-pretty">
              Already working with us?{" "}
              <Link
                href="/login"
                className="focusable text-ink-4 underline underline-offset-2 hover:text-gold transition-colors dur-fast"
              >
                Sign in
              </Link>
              . Prefer to ask a question first?{" "}
              <Link
                href="/contact"
                className="focusable text-ink-4 underline underline-offset-2 hover:text-gold transition-colors dur-fast"
              >
                Contact the office
              </Link>
              .
            </p>
          </aside>
        </div>
      </section>
    </>
  );
}
