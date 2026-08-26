/**
 * Writes the lead-notification config into notify_config, which is what the
 * pg_net trigger reads. Run once per environment, and again whenever the app
 * URL or the webhook secret changes:
 *
 *   NEXT_PUBLIC_SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... \
 *   NOTIFY_WEBHOOK_SECRET=... NOTIFY_APP_URL=https://rpm-recruit.vercel.app \
 *   npm run notify:setup
 *
 * The secret must match NOTIFY_WEBHOOK_SECRET in the app's environment: the
 * trigger sends it, the route compares it in constant time. An environment
 * with no config rows sends nothing and blocks nothing, by design.
 */
import { createClient } from "@supabase/supabase-js";
import type { Database } from "../src/types/database";

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is required.`);
  return value;
}

async function main() {
  const url = requireEnv("NEXT_PUBLIC_SUPABASE_URL");
  const serviceKey = requireEnv("SUPABASE_SERVICE_ROLE_KEY");
  const secret = requireEnv("NOTIFY_WEBHOOK_SECRET");
  const appUrl = requireEnv("NOTIFY_APP_URL").replace(/\/$/, "");

  const db = createClient<Database>(url, serviceKey, {
    auth: { persistSession: false },
  });

  const rows = [
    { key: "lead_webhook_url", value: `${appUrl}/api/notify/lead` },
    { key: "webhook_secret", value: secret },
  ];

  for (const row of rows) {
    const { error } = await db
      .from("notify_config")
      .upsert({ ...row, updated_at: new Date().toISOString() });
    if (error) throw new Error(`${row.key}: ${error.message}`);
  }

  console.log(`notify_config set: leads post to ${appUrl}/api/notify/lead`);
}

main().catch((error) => {
  console.error(error.message ?? error);
  process.exit(1);
});
