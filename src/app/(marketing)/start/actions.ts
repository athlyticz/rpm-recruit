"use server";

import { createClient } from "@/lib/supabase/server";
import {
  readLead,
  validateLead,
  EMPTY_LEAD,
  type LeadState,
} from "@/lib/leads/schema";

/**
 * Writes one lead.
 *
 * The insert runs through the ordinary anon-key client, not the service role,
 * so it exercises the same insert-only policy a browser would. The table
 * grants no select to that role, which is why nothing is read back: asking for
 * the inserted row would fail on privileges even though the write succeeded.
 */
export async function submitLead(
  _prev: LeadState,
  formData: FormData
): Promise<LeadState> {
  const values = readLead(formData);

  /*
   * Honeypot. A field no human sees and no human fills. Bots fill it, and the
   * response they get is indistinguishable from success, so the form does not
   * teach them what to change.
   */
  if (String(formData.get("company") ?? "").trim() !== "") {
    return {
      status: "sent",
      errors: {},
      values: EMPTY_LEAD,
      sent: {
        playerName: `${values.playerFirstName} ${values.playerLastName}`.trim(),
        parentName: values.parentName.trim(),
      },
    };
  }

  const errors = validateLead(values);
  if (Object.keys(errors).length > 0) {
    return { status: "error", errors, values };
  }

  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    return {
      status: "error",
      errors: {
        form: "We could not reach our system just now. Call the office and we will take this down by hand.",
      },
      values,
    };
  }

  const supabase = await createClient();

  const { error } = await supabase.from("leads").insert({
    player_first_name: values.playerFirstName.trim(),
    player_last_name: values.playerLastName.trim(),
    grad_year: Number(values.gradYear),
    position: values.position,
    current_level: values.currentLevel,
    parent_name: values.parentName.trim(),
    parent_email: values.parentEmail.trim(),
    parent_phone: values.parentPhone.trim(),
    plan_interest: String(formData.get("planInterest") ?? "") || null,
    source: String(formData.get("source") ?? "") || null,
    notes: values.notes.trim() || null,
  });

  if (error) {
    console.error("submitLead:", error.message);
    return {
      status: "error",
      errors: {
        form: "That did not send. Try once more, and if it still fails, call the office.",
      },
      values,
    };
  }

  return {
    status: "sent",
    errors: {},
    values: EMPTY_LEAD,
    sent: {
      playerName: `${values.playerFirstName.trim()} ${values.playerLastName.trim()}`,
      parentName: values.parentName.trim(),
    },
  };
}
