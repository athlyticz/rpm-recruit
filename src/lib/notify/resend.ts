/**
 * The single place email leaves this app from.
 *
 * Resend over raw fetch, no SDK: the API is one POST and a dependency would
 * be more surface than the call. With no RESEND_API_KEY in the environment
 * the send becomes an explicit dry run that logs the fully composed message
 * and reports itself as not sent, so the whole chain (trigger, route,
 * composition) is verifiable on a machine that has no mail credentials, and
 * nothing pretends a message went out when it did not.
 */

export interface OutgoingEmail {
  subject: string;
  html: string;
  text: string;
}

export interface SendResult {
  sent: boolean;
  dryRun: boolean;
  error?: string;
}

export async function sendEmail(email: OutgoingEmail): Promise<SendResult> {
  const key = process.env.RESEND_API_KEY;
  const to = process.env.NOTIFY_EMAIL;
  const from = process.env.RESEND_FROM;

  if (!key || !to || !from) {
    console.log(
      `[notify dry-run] missing ${[
        !key && "RESEND_API_KEY",
        !to && "NOTIFY_EMAIL",
        !from && "RESEND_FROM",
      ]
        .filter(Boolean)
        .join(", ")}\n` +
        `[notify dry-run] subject: ${email.subject}\n` +
        `[notify dry-run] text:\n${email.text}`
    );
    return { sent: false, dryRun: true };
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to,
      subject: email.subject,
      html: email.html,
      text: email.text,
    }),
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    console.error(`sendEmail: Resend ${response.status} ${detail.slice(0, 300)}`);
    return { sent: false, dryRun: false, error: `Resend ${response.status}` };
  }

  return { sent: true, dryRun: false };
}
