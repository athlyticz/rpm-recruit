export const PLANS = {
  showcase: {
    name: "Showcase Package",
    price: 1499,
    interval: null,
    description: "1 year of full access",
    features: [
      "Complete player profile & evaluation",
      "College match engine (D1/D2/D3)",
      "Bio draft builder",
      "Letter builder with unlimited drafts",
      "Cost tracker & comparison tools",
      "Recruiting checklist & interview prep",
      "Pitching log & athletic metrics",
      "PDF export for coaches",
    ],
    stripePriceEnv: "STRIPE_PRICE_SHOWCASE" as const,
  },
  monthly: {
    name: "Monthly",
    price: 49,
    interval: "month" as const,
    description: "Ongoing access after package expires",
    features: [
      "Everything in Showcase Package",
      "Continued profile & match updates",
      "Cancel anytime",
    ],
    stripePriceEnv: "STRIPE_PRICE_MONTHLY" as const,
  },
  scout: {
    name: "Scout / Coach",
    price: 99,
    interval: "month" as const,
    description: "Evaluation & pipeline tools",
    features: [
      "Scout evaluation mode",
      "Player comparison tools",
      "Recruitment pipeline dashboard",
      "Bulk player notes & ratings",
      "Export scouting reports",
    ],
    stripePriceEnv: "STRIPE_PRICE_SCOUT" as const,
  },
  org: {
    name: "Organization",
    price: 299,
    interval: "month" as const,
    description: "For showcases, academies & programs",
    features: [
      "Everything in Scout / Coach",
      "Unlimited evaluator seats",
      "Organization-wide player database",
      "Custom branding on reports",
      "Priority support",
    ],
    stripePriceEnv: "STRIPE_PRICE_ORG" as const,
  },
} as const;

export type PlanKey = keyof typeof PLANS;
