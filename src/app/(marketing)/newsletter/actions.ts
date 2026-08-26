"use server";

import { createClient } from "@/lib/supabase/server";

export interface SubscribeState {
  status: "idle" | "error" | "sent";
  message?: string;
}

/**
 * Adds one address to the waitlist.
 *
 * Two deliberate behaviours. A repeat sign-up answers exactly like a first
 * one, because "you are already on the list" tells a stranger who is on the
 * list. And nothing is read back: the table grants insert and nothing else.
 */
export async function subscribe(
  _prev: SubscribeState,
  formData: FormData
): Promise<SubscribeState> {
  const email = String(formData.get("email") ?? "").trim();
  const source = String(formData.get("source") ?? "").slice(0, 120) || null;

  // Honeypot. Same treatment as the lead form: answer as if it worked.
  if (String(formData.get("company") ?? "").trim() !== "") {
    return { status: "sent" };
  }

  if (!email) {
    return { status: "error", message: "Add an email address." };
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) || email.length > 254) {
    return { status: "error", message: "That address does not look right." };
  }

  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    return { status: "error", message: "Could not save your spot. Try later." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("newsletter_subscribers")
    .insert({ email, source });

  // 23505 is the unique index on lower(email): already subscribed, which is
  // a success from the reader's side and not a fact we disclose.
  if (error && error.code !== "23505") {
    console.error("subscribe:", error.message);
    return { status: "error", message: "That did not send. Try once more." };
  }

  return { status: "sent" };
}
