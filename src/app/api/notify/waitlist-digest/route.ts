import { NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import { composeWaitlistDigest } from "@/lib/notify/emails";
import { sendEmail } from "@/lib/notify/resend";
import type { Database } from "@/types/database";

export const runtime = "nodejs";

/**
 * The daily waitlist digest, fired by Vercel cron.
 *
 * One email a day, not one per signup: "3 new, 47 total." New is computed
 * from the last digest actually sent (notify_log), not from an assumed
 * 24-hour window, so a late cron or a redeploy never drops a signup into the
 * gap between two windows. Zero new means no email and no log row; the next
 * digest simply reaches further back.
 */
function authorized(request: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const header = request.headers.get("authorization") ?? "";
  const provided = header.replace(/^Bearer\s+/i, "");
  const a = Buffer.from(provided);
  const b = Buffer.from(secret);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function GET(request: Request) {
  if (!authorized(request)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ error: "database not configured" }, { status: 500 });
  }

  const db = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { persistSession: false } }
  );

  const { data: lastLog } = await db
    .from("notify_log")
    .select("sent_at")
    .eq("kind", "waitlist_digest")
    .order("sent_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  let freshQuery = db
    .from("newsletter_subscribers")
    .select("email,source,created_at")
    .order("created_at", { ascending: true });
  if (lastLog) freshQuery = freshQuery.gt("created_at", lastLog.sent_at);

  const [{ data: fresh, error: freshError }, { count: total, error: countError }] =
    await Promise.all([
      freshQuery,
      db
        .from("newsletter_subscribers")
        .select("id", { count: "exact", head: true })
        .eq("status", "active"),
    ]);

  if (freshError || countError || total === null) {
    return NextResponse.json(
      { error: freshError?.message ?? countError?.message ?? "count failed" },
      { status: 500 }
    );
  }

  if (!fresh || fresh.length === 0) {
    return NextResponse.json({ sent: false, fresh: 0, total });
  }

  const result = await sendEmail(composeWaitlistDigest(fresh, total));

  // Log only a send that happened (or a dry run, which is this environment's
  // version of one), so a Resend outage rolls the rows into the next digest.
  if (result.sent || result.dryRun) {
    await db.from("notify_log").insert({
      kind: "waitlist_digest",
      detail: { fresh: fresh.length, total, dryRun: result.dryRun },
    });
  }

  return NextResponse.json({ ...result, fresh: fresh.length, total });
}
