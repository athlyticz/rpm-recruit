import Stripe from "stripe";

let client: Stripe | null = null;

/**
 * Server-side Stripe instance, constructed on first use.
 *
 * This is deliberately lazy. Constructing at module scope throws during
 * `next build` when collecting page data, because STRIPE_SECRET_KEY is not
 * present in the build environment.
 */
export function getStripe(): Stripe {
  if (!client) {
    const secretKey = process.env.STRIPE_SECRET_KEY;

    if (!secretKey) {
      throw new Error("STRIPE_SECRET_KEY is not set.");
    }

    client = new Stripe(secretKey, {
      apiVersion: "2025-02-24.acacia",
      typescript: true,
    });
  }

  return client;
}
