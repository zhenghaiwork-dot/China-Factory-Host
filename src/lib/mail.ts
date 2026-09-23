/* ============================================================
   Mail delivery — HTTP API only (Resend).

   WHY NOT SMTP: this site deploys to Cloudflare Workers. A Worker runs in a
   V8 isolate with no raw TCP sockets and no `net` module, so nodemailer
   cannot open an SMTP connection there at all — this is a structural limit
   of the runtime, not a configuration problem. Transactional mail on Workers
   has to go out over `fetch()` to an HTTP email API.

   WHY RESEND: single POST to https://api.resend.com/emails, no SDK, no
   Node built-ins, so it works identically in `astro dev`, in `wrangler dev`
   and on a deployed Worker. Swapping in Postmark / SendGrid / Mailgun means
   rewriting `sendMail()` below and nothing else.

   The API key is never imported from source. It arrives as a Worker binding
   (see `readSecret()` in src/pages/api/inquiry.ts).
   ============================================================ */

export interface MailMessage {
  to: string;
  from: string;
  replyTo?: string;
  subject: string;
  text: string;
  html: string;
}

export type MailResult =
  | { ok: true }
  | { ok: false; reason: 'not-configured' | 'send-failed'; detail: string };

const RESEND_ENDPOINT = 'https://api.resend.com/emails';
const TIMEOUT_MS = 10_000;

export async function sendMail(message: MailMessage, apiKey: string): Promise<MailResult> {
  if (!apiKey) {
    return { ok: false, reason: 'not-configured', detail: 'RESEND_API_KEY is empty.' };
  }

  const payload: Record<string, unknown> = {
    from: message.from,
    to: [message.to],
    subject: message.subject,
    text: message.text,
    html: message.html,
  };
  if (message.replyTo) payload.reply_to = message.replyTo;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(RESEND_ENDPOINT, {
      method: 'POST',
      headers: {
        authorization: `Bearer ${apiKey}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    // Resend answers 200 for accepted, 202 for queued. Anything else is a
    // genuine failure and must surface to the visitor — never fake a success.
    if (res.status === 200 || res.status === 202) {
      return { ok: true };
    }

    const body = await res.text().catch(() => '');
    return {
      ok: false,
      reason: 'send-failed',
      detail: `Resend responded ${res.status}${body ? `: ${body.slice(0, 300)}` : ''}`,
    };
  } catch (err) {
    const detail =
      err instanceof Error
        ? err.name === 'AbortError'
          ? 'Mail API timed out after 10s.'
          : err.message
        : String(err);
    return { ok: false, reason: 'send-failed', detail };
  } finally {
    clearTimeout(timer);
  }
}
