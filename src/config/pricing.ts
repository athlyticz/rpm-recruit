/**
 * Plans, and what each one actually includes today.
 *
 * The feature lists are swept against the built product, not against the
 * pitch. A price card may not describe less or more than the app does: if a
 * line here is not a screen a customer can open, it does not belong in the
 * list, and a plan whose software is not built yet says so on the card.
 *
 * `availability` is the honest flag. "available" means every line below is in
 * the app now. "in_build" means the plan is priced and sold on a call, and the
 * lines describe what it includes at launch.
 */
export const PLANS = {
  showcase: {
    name: "Showcase Package",
    price: 1499,
    interval: null,
    description: "1 year of full access",
    availability: "available" as const,
    features: [
      "Player profile, academics, and measurables",
      "Position evaluations on the 1 to 10 showcase scale",
      "College match engine, D1 through JUCO",
      "Every score explained, component by component",
      "What if levers that show what moves you into range",
      "Letter builder and bio draft builder",
      "Cost tracker, recruiting checklist, and pitching log",
      "Print or save any letter as a PDF",
    ],
    stripePriceEnv: "STRIPE_PRICE_SHOWCASE" as const,
  },
  monthly: {
    name: "Monthly",
    price: 49,
    interval: "month" as const,
    description: "Ongoing access after the package year",
    availability: "available" as const,
    features: [
      "Everything in the Showcase Package",
      "Your profile and program list stay live",
      "Re-scored as your numbers change",
      "Cancel anytime",
    ],
    stripePriceEnv: "STRIPE_PRICE_MONTHLY" as const,
  },
  scout: {
    name: "Scout / Coach",
    price: 99,
    interval: "month" as const,
    description: "Evaluation tools for a coach or scout",
    availability: "in_build" as const,
    features: [
      "Enter evaluations on the same 1 to 10 scale",
      "Compare players side by side",
      "A pipeline view of who you are tracking",
      "Notes and ratings across a roster",
      "Export what you have written",
    ],
    stripePriceEnv: "STRIPE_PRICE_SCOUT" as const,
  },
  org: {
    name: "Organization",
    price: 299,
    interval: "month" as const,
    description: "For showcases, academies, and programs",
    availability: "in_build" as const,
    features: [
      "Everything in Scout / Coach",
      "Evaluator seats for your staff",
      "One player database across the organization",
      "Your branding on what you send out",
      "A direct line to the team",
    ],
    stripePriceEnv: "STRIPE_PRICE_ORG" as const,
  },
} as const;

export type PlanKey = keyof typeof PLANS;
