import type { APIRoute } from 'astro';
import { sendMail } from '../../lib/mail';
import { HOST_NAME } from '../../data/site.ts';

/* ============================================================
   POST /api/inquiry/ — the only server-rendered route on the site.
   `prerender = false` opts this single route out of static build
   (Astro 5+ per-route opt-out); every content page stays SSG.

   TRAILING SLASH IS PART OF THE CONTRACT. This site sets
   `trailingSlash: 'always'` in astro.config.mjs, so a request to
   /api/inquiry (no slash) is answered 301 -> /api/inquiry/. A 301
   downgrades POST to GET, which lands on the GET handler below and
   returns 405. Verified 2026-09-17 against the built server:
     POST /api/inquiry   -> 301 -> (GET) 405
     POST /api/inquiry/  -> 503 / 200  (correct)
   Any client, integration or uptime check must use the slashed URL.

   RUNTIME: works on both a Node host (Hostinger) and Cloudflare Workers —
   see `ADAPTER` in astro.config.mjs. Secrets are read by `readSecret()` below,
   which checks Cloudflare bindings first and then import.meta.env /
   process.env, so the same code path serves both hosts. Never inline a key.

   Env (never commit real values):
     RESEND_API_KEY — transactional mail API key (HTTP)
     INQUIRY_TO     — the mailbox that receives inquiries
     INQUIRY_FROM   — the From address, must be a domain verified with Resend
     (On Cloudflare these are Worker secrets; on a Node host they are ordinary
      environment variables.)
   If mail is not configured the route returns 503 and the client shows
   its error state — it must never pretend a message was sent.
   ============================================================ */
export const prerender = false;

const MAX_BYTES = 20_000;
const RATE_WINDOW_MS = 10 * 60 * 1000;
const RATE_MAX = 5;

/* In-memory rate limit. On Workers each isolate has its own Map and isolates
   are recycled freely, so this is best-effort only — it throttles a single
   isolate, not the whole edge. Real protection belongs in a Cloudflare WAF
   rate-limiting rule on /api/inquiry/ (see DEPLOYMENT.md). Kept because it is
   free and still stops the naive loop-a-submit case. */
const hits = new Map<string, number[]>();

function tooManyRequests(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < RATE_WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > RATE_MAX;
}

function clean(v: unknown, max = 2000): string {
  if (typeof v !== 'string') return '';
  return v.replace(/\s+/g, ' ').trim().slice(0, max);
}

/* Read a secret from whichever runtime we are on.

   CLOUDFLARE: bindings come from the `cloudflare:workers` module. Astro 6
   REMOVED the old `locals.runtime.env` accessor — reading it throws
   "Astro.locals.runtime.env has been removed in Astro v6", which is exactly
   what turned every otherwise-valid POST into a 500 (found 2026-09-18 by
   probing a real workerd server). Do not reintroduce it.

   The specifier is assembled at runtime on purpose: a literal
   `import('cloudflare:workers')` makes the bundler try to resolve a module that
   does not exist when the site is built for Node, and the build fails.

   NODE (Hostinger / `astro dev`): the dynamic import throws, we fall through to
   import.meta.env and then process.env, both of which are populated at runtime
   for a `prerender = false` route. */
let cfBindings: Record<string, unknown> | null | undefined;

async function cloudflareBindings(): Promise<Record<string, unknown> | null> {
  if (cfBindings !== undefined) return cfBindings;
  try {
    const specifier = 'cloudflare:' + 'workers';
    const mod = (await import(/* @vite-ignore */ specifier)) as { env?: Record<string, unknown> };
    cfBindings = mod.env ?? null;
  } catch {
    cfBindings = null; // not on Workers — Node host, or plain `astro dev`
  }
  return cfBindings;
}

async function readSecret(key: string): Promise<string> {
  const bound = (await cloudflareBindings())?.[key];
  if (typeof bound === 'string' && bound) return bound;

  const fromMeta = (import.meta.env as Record<string, string | undefined>)[key];
  if (typeof fromMeta === 'string' && fromMeta) return fromMeta;

  if (typeof process !== 'undefined' && process.env) {
    const fromProcess = process.env[key];
    if (typeof fromProcess === 'string' && fromProcess) return fromProcess;
  }
  return '';
}

/* CORS/CSRF origin check. Measured 2026-09-17 against the built server: the
   handler did NOT apply Astro's `checkOrigin` CSRF middleware to this route —
   a POST carrying `Origin: https://evil.example` sailed straight through.
   So the form would accept submissions from any website. This reinstates the
   check by hand.

   The rule is permissive by design so it can never lock out a real visitor:
     · no Origin header at all  -> allow (never, curl, some corporate proxies)
     · Origin host === our host -> allow (the real same-origin case)
     · private/local host       -> allow (localhost preview during development)
     · anything else            -> 403 */
const SITE_HOST = 'chinafactoryhost.com';
const PRIVATE_HOST = /^(localhost|127\.0\.0\.1|\[::1\]|192\.168\.|10\.)/i;

function badOrigin(origin: string | null): boolean {
  // No Origin header cannot be forged by a browser cross-site POST — those
  // always carry one. Allowing it keeps non-browser callers working.
  if (!origin) return false;
  let host: string;
  try {
    host = new URL(origin).host.toLowerCase().replace(/:\d+$/, '');
  } catch {
    return true; // unparseable Origin is not something we should trust
  }
  return !(host === SITE_HOST || host === `www.${SITE_HOST}` || PRIVATE_HOST.test(host));
}

function esc(s: string): string {
  return s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c] as string);
}

function json(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

export const POST: APIRoute = async ({ request, clientAddress }) => {
  if (badOrigin(request.headers.get('origin'))) {
    return json({ ok: false, error: 'Cross-origin submissions are not accepted.' }, 403);
  }

  if (!request.headers.get('content-type')?.includes('application/json')) {
    return json({ ok: false, error: 'Expected JSON.' }, 415);
  }

  if ((Number(request.headers.get('content-length')) || 0) > MAX_BYTES) {
    return json({ ok: false, error: 'Payload too large.' }, 413);
  }

  const ip = clientAddress || request.headers.get('x-forwarded-for') || 'unknown';
  if (tooManyRequests(ip)) {
    return json({ ok: false, error: 'Too many attempts. Please try again shortly.' }, 429);
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return json({ ok: false, error: 'Malformed request.' }, 400);
  }

  // Honeypot: real users never see or fill this field.
  if (clean(body.website)) {
    return json({ ok: true }, 200);
  }

  const intent = clean(body.intent, 40);
  const role = clean(body.role, 40);
  const name = clean(body.name, 120);
  const email = clean(body.email, 200);
  const whatsapp = clean(body.whatsapp, 60);
  const destination = clean(body.destination, 80);
  const goal = clean(body.goal, 4000);
  const source = clean(body.source, 200) || 'unknown page';

  /* Two intents share this endpoint.
     `download` is the lead-magnet gate (DownloadGate.astro) — it asks for an
     email address and nothing else, so demanding name/goal here returned 400
     on every submission. `inquiry` is the full contact form and keeps the
     stricter requirement. */
  const isDownload = intent === 'download';

  if (isDownload) {
    if (!email) {
      return json({ ok: false, error: 'Please enter your email address.' }, 400);
    }
  } else if (!name || !email || !goal) {
    return json({ ok: false, error: 'Name, email and what you are trying to do are required.' }, 400);
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
    return json({ ok: false, error: 'That email address does not look right.' }, 400);
  }

  const apiKey = await readSecret('RESEND_API_KEY');
  const to = await readSecret('INQUIRY_TO');
  const from = await readSecret('INQUIRY_FROM');

  if (!apiKey || !to || !from) {
    return json({ ok: false, error: 'Mail delivery is not configured on this server yet.' }, 503);
  }

  const when = new Date().toUTCString();
  const subject = isDownload
    ? `[Checklist download] ${email}`
    : `[Inquiry] ${name}${destination ? ` · ${destination}` : ''}`;

  const displayName = name || '(no name given — checklist download)';
  const displayGoal = goal || (isDownload ? 'Requested the factory vetting checklist.' : '—');

  const text = [
    isDownload ? 'Checklist download — chinafactoryhost.com' : 'New inquiry from chinafactoryhost.com',
    '',
    `Received:  ${when}`,
    `Source:    ${source}`,
    `Intent:    ${isDownload ? 'download' : 'inquiry'}`,
    `Type:      ${role || 'not stated'}`,
    `Name:      ${displayName}`,
    `Email:     ${email}`,
    `WhatsApp:  ${whatsapp || '—'}`,
    `Area:      ${destination || '—'}`,
    '',
    isDownload ? 'Requested asset:' : 'What they are trying to do:',
    displayGoal,
    '',
    `IP: ${ip}`,
  ].join('\n');

  const html = `<div style="font:14px/1.6 system-ui,sans-serif;color:#1A1917">
  <h2 style="margin:0 0 12px;font-size:18px">${
    isDownload ? 'Checklist download' : 'New inquiry'
  } — chinafactoryhost.com</h2>
  <table style="border-collapse:collapse">
    <tr><td style="padding:4px 12px 4px 0;color:#616670">Received</td><td>${esc(when)}</td></tr>
    <tr><td style="padding:4px 12px 4px 0;color:#616670">Source page</td><td>${esc(source)}</td></tr>
    <tr><td style="padding:4px 12px 4px 0;color:#616670">Intent</td><td>${isDownload ? 'download' : 'inquiry'}</td></tr>
    <tr><td style="padding:4px 12px 4px 0;color:#616670">Type</td><td>${esc(role || 'not stated')}</td></tr>
    <tr><td style="padding:4px 12px 4px 0;color:#616670">Name</td><td><strong>${esc(displayName)}</strong></td></tr>
    <tr><td style="padding:4px 12px 4px 0;color:#616670">Email</td><td><a href="mailto:${esc(email)}">${esc(email)}</a></td></tr>
    <tr><td style="padding:4px 12px 4px 0;color:#616670">WhatsApp</td><td>${esc(whatsapp || '—')}</td></tr>
    <tr><td style="padding:4px 12px 4px 0;color:#616670">Area</td><td>${esc(destination || '—')}</td></tr>
  </table>
  <p style="margin:16px 0 4px;color:#616670">${
    isDownload ? 'Requested asset' : 'What they are trying to do'
  }</p>
  <div style="padding:12px;background:#F4F6FA;border-radius:8px">${esc(displayGoal).replace(/\n/g, '<br>')}</div>
  <p style="margin:16px 0 0;color:#868D96;font-size:12px">IP ${esc(ip)}</p>
</div>`;

  /* Wrap the verified sender address in the public host display name so the
     inbox shows "Chenghai (ChinaFactoryHost)" rather than a bare address. The
     envelope sender (the verified domain) is unchanged; only the display name
     is added. replyTo stays the visitor, so replies reach them. */
  const result = await sendMail(
    { to, from: `${HOST_NAME} (ChinaFactoryHost) <${from}>`, replyTo: email, subject, text, html },
    apiKey,
  );

  if (!result.ok) {
    console.error('[inquiry] mail failed:', result.reason, result.detail);
    // Not-configured is an operator problem worth a distinct status; a genuine
    // send failure is 502. Both must leave the visitor in the error state.
    return json(
      {
        ok: false,
        error:
          result.reason === 'not-configured'
            ? 'Mail delivery is not configured on this server yet.'
            : 'We could not send that. Please try again, or message us on WhatsApp.',
      },
      result.reason === 'not-configured' ? 503 : 502,
    );
  }

  return json({ ok: true }, 200);
};

export const GET: APIRoute = () =>
  new Response(JSON.stringify({ ok: false, error: 'POST only.' }), {
    status: 405,
    headers: { 'content-type': 'application/json', allow: 'POST' },
  });
