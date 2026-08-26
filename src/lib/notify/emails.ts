import type { OutgoingEmail } from "@/lib/notify/resend";

/**
 * Email composition, written to be forwarded.
 *
 * The lead email's whole job is to go from the inbox to John's phone in one
 * motion: everything a call needs is above the fold in plain lines, the phone
 * number is a tel: link so tapping it dials, and nothing in the layout breaks
 * when a mail client strips the styling. Coach's voice, no decoration.
 */

export interface LeadPayload {
  id: string;
  player_first_name: string;
  player_last_name: string;
  grad_year: number;
  position: string;
  current_level: string;
  parent_name: string;
  parent_email: string;
  parent_phone: string;
  plan_interest: string | null;
  source: string | null;
  notes: string | null;
  created_at: string;
}

function esc(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function telHref(phone: string): string {
  return "tel:" + phone.replace(/[^\d+]/g, "");
}

const ROW = 'style="padding:4px 0;font:14px/1.5 -apple-system,Segoe UI,Arial,sans-serif;color:#1C1C1C"';
const LABEL = 'style="font:bold 11px/1.5 -apple-system,Segoe UI,Arial,sans-serif;letter-spacing:.08em;text-transform:uppercase;color:#666;padding:10px 0 0"';

export function composeLeadEmail(lead: LeadPayload): OutgoingEmail {
  const player = `${lead.player_first_name} ${lead.player_last_name}`;
  const subject = `New lead: ${player}, ${lead.grad_year} ${lead.position}`;

  const lines = [
    `Player: ${player}`,
    `Grad year: ${lead.grad_year}`,
    `Position: ${lead.position}`,
    `Playing now: ${lead.current_level}`,
    ``,
    `Parent: ${lead.parent_name}`,
    `Phone: ${lead.parent_phone}`,
    `Email: ${lead.parent_email}`,
    ``,
    lead.plan_interest ? `Looking at: ${lead.plan_interest}` : null,
    lead.notes ? `Notes: ${lead.notes}` : null,
    ``,
    `Submitted ${new Date(lead.created_at).toLocaleString("en-US", { timeZone: "America/New_York" })} ET via ${lead.source ?? "the site"}.`,
    `The form promised a call within 48 hours.`,
  ].filter((line): line is string => line !== null);

  const html = `
<div style="max-width:520px">
  <p ${LABEL}>The player</p>
  <p ${ROW}><strong>${esc(player)}</strong> &middot; ${lead.grad_year} &middot; ${esc(lead.position)}<br>
  Playing now: ${esc(lead.current_level)}</p>
  <p ${LABEL}>The call</p>
  <p ${ROW}><strong>${esc(lead.parent_name)}</strong><br>
  <a href="${telHref(lead.parent_phone)}" style="color:#1C1C1C;font-weight:bold;font-size:18px">${esc(lead.parent_phone)}</a><br>
  <a href="mailto:${esc(lead.parent_email)}" style="color:#666">${esc(lead.parent_email)}</a></p>
  ${lead.plan_interest ? `<p ${ROW}>Looking at: <strong>${esc(lead.plan_interest)}</strong></p>` : ""}
  ${lead.notes ? `<p ${LABEL}>From the family</p><p ${ROW}>${esc(lead.notes)}</p>` : ""}
  <p style="font:12px/1.5 -apple-system,Segoe UI,Arial,sans-serif;color:#888;padding-top:12px">
  Submitted ${esc(new Date(lead.created_at).toLocaleString("en-US", { timeZone: "America/New_York" }))} ET via ${esc(lead.source ?? "the site")}. The form promised a call within 48 hours.</p>
</div>`;

  return { subject, html, text: lines.join("\n") };
}

export interface DigestRow {
  email: string;
  source: string | null;
  created_at: string;
}

export function composeWaitlistDigest(
  fresh: DigestRow[],
  total: number
): OutgoingEmail {
  const subject = `Waitlist: ${fresh.length} new, ${total} total`;

  const textRows = fresh.map(
    (row) =>
      `${row.email}  (${row.source ?? "unknown"}, ${new Date(row.created_at).toLocaleString("en-US", { timeZone: "America/New_York" })} ET)`
  );

  const htmlRows = fresh
    .map(
      (row) =>
        `<tr><td ${ROW}>${esc(row.email)}</td><td style="padding:4px 0 4px 16px;font:12px/1.5 -apple-system,Segoe UI,Arial,sans-serif;color:#888">${esc(row.source ?? "unknown")}</td></tr>`
    )
    .join("");

  return {
    subject,
    text: `${fresh.length} new since the last digest, ${total} on the waitlist.\n\n${textRows.join("\n")}`,
    html: `
<div style="max-width:520px">
  <p ${ROW}><strong>${fresh.length} new</strong> since the last digest, <strong>${total}</strong> on the waitlist.</p>
  <table cellpadding="0" cellspacing="0">${htmlRows}</table>
</div>`,
  };
}
