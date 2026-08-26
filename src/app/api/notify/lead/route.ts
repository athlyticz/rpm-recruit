import { NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";
import { composeLeadEmail, type LeadPayload } from "@/lib/notify/emails";
import { sendEmail } from "@/lib/notify/resend";

export const runtime = "nodejs";

/**
 * Receives the pg_net post that a new leads row fires, and emails it.
 *
 * Auth is the shared bearer secret written into notify_config by the setup
 * script. Compared in constant time; a missing server-side secret fails
 * closed. The route never touches the database: everything the email needs
 * arrived in the payload, so a database hiccup cannot stop the one
 * notification that matters most.
 */
function authorized(request: Request): boolean {
  const secret = process.env.NOTIFY_WEBHOOK_SECRET;
  if (!secret) return false;
  const header = request.headers.get("authorization") ?? "";
  const provided = header.replace(/^Bearer\s+/i, "");
  const a = Buffer.from(provided);
  const b = Buffer.from(secret);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function POST(request: Request) {
  if (!authorized(request)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let payload: LeadPayload & { kind?: string };
  try {
    payload = (await request.json()) as LeadPayload & { kind?: string };
  } catch {
    return NextResponse.json({ error: "bad payload" }, { status: 400 });
  }

  if (payload.kind !== "lead" || !payload.parent_phone || !payload.player_first_name) {
    return NextResponse.json({ error: "bad payload" }, { status: 400 });
  }

  const result = await sendEmail(composeLeadEmail(payload));

  // 200 either way once authorized and well-formed: pg_net does not retry,
  // so a non-2xx here buys nothing, and the send layer already logged the
  // failure with more detail than a status code carries.
  return NextResponse.json(result, { status: result.dryRun ? 202 : 200 });
}
