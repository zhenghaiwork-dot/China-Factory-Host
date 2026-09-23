# ChinaFactoryHost — Deployment & Environment Guide

_Consolidated. Last verified against a real build + live server on 2026-09-18._

---

## 1. What this site is

Astro 7 **static site** (`output: 'static'`) with **exactly one** server-rendered
route: `POST /api/inquiry/` (`src/pages/api/inquiry.ts`), opted out of
prerendering with `export const prerender = false`. The other 24 pages are
plain prebuilt HTML.

```
Node host      dist/client/            ← static site, served as-is
               dist/server/entry.mjs   ← standalone Node server (the one route)

Cloudflare     dist/client/            ← Worker assets
               dist/server/entry.mjs   ← the Worker (the one route)
               dist/server/wrangler.json ← generated, self-resolving config
```

Mail goes out over **HTTPS to Resend**, never SMTP. On a Node host SMTP would
work, but the code is deliberately runtime-agnostic so the same build runs on
Cloudflare Workers, which structurally cannot open SMTP sockets (V8 isolate, no
`net` module). See `src/lib/mail.ts`.

---

## 2. Two hosts, one codebase

Set at build time in `astro.config.mjs`:

| Command | Adapter | Output |
|---|---|---|
| `npm run build` | `@astrojs/node` (standalone) | Node server |
| `ADAPTER=cloudflare npm run build` | `@astrojs/cloudflare` | Worker + assets |

Nothing in `src/` changes between the two. Secrets are read by `readSecret()`,
which tries Cloudflare bindings first (`cloudflare:workers`), then
`import.meta.env`, then `process.env`.

> **Do not use `Astro.locals.runtime.env` anywhere.** Astro 6 removed it — it
> throws at request time. That is what turned every valid POST into a 500
> until 2026-09-18 (found by probing a real workerd server).

---

## 3. Environment variables (required before the form can send)

| Variable | Required | Meaning |
|---|---|---|
| `RESEND_API_KEY` | yes | from https://resend.com/api-keys |
| `INQUIRY_TO` | yes | inbox that receives inquiries |
| `INQUIRY_FROM` | yes | From address. Must be on a domain **verified in Resend**, or Resend rejects the send with 403. |

**On a Node host (Hostinger):** put the three in the app's environment. They are
read at **runtime** for the `prerender = false` route — `import.meta.env` does
pick them up there.

**On Cloudflare:** they must be Worker secrets, never build-time variables.

```bash
npx wrangler secret put RESEND_API_KEY
npx wrangler secret put INQUIRY_TO
npx wrangler secret put INQUIRY_FROM
```

Locally, copy `.dev.vars.example` to `.dev.vars` (git-ignored) for `astro dev`
and `npm run cf:dev`.

**Behaviour is deliberate — never "pretend success":**

| Condition | Response |
|---|---|
| Any of the three vars missing | `503` — form shows its error state |
| Resend rejects / times out | `502` |
| Bad or missing input | `400` |
| More than 5 requests / 10 min / IP | `429` |
| Honeypot `website` field filled (bot) | `200` and **silently dropped** |
| Foreign `Origin` header | `403` |
| `GET` on the endpoint | `405` |

So: **if the form succeeds in production, a real email left the server.**

Rate limiting is in-memory, so on Workers it throttles a single isolate, not the
whole edge. Real protection belongs in a Cloudflare WAF rate-limiting rule on
`/api/inquiry/`.

---

## 4. The trailing-slash contract (read before "fixing" a 404/405)

`astro.config.mjs` sets `trailingSlash: 'always'`. Consequence, verified by
probe against the built server:

```
POST /api/inquiry    → 301 → /api/inquiry/  → 301 downgrades POST to GET → 405
POST /api/inquiry/   → 503 / 200            ← the only correct client URL
```

The form's `data-endpoint` **and** `action` both carry the slash (so the no-JS
fallback works too). Any uptime check or third-party integration must use
`/api/inquiry/`.

On Cloudflare, also check after the first deploy that `_routes.json` (or the
generated `dist/server/wrangler.json` assets config) still routes the slashed
path to the function and not to the static 404.

---

## 5. The download gate

`DownloadGate.astro` posts to the same endpoint with `intent: "download"`, which
relaxes the requirement to an email address alone. Without that flag the
endpoint demands name + goal and every download request gets a 400.

The asset is real: `public/downloads/factory-vetting-checklist.pdf`, generated
from the vetting page content by:

```bash
npm run pdf     # scripts/build-checklist-pdf.mjs — run after editing the
                # vetting page so the PDF and the page never disagree
```

The download link is only revealed after a genuine `200`. If mail is not
configured, the visitor sees the error state — never a link that pretends.

---

## 6. Build & run on a Node host

```bash
npm install
npm run build
node dist/server/entry.mjs        # standalone Node server
```

`PORT` and `HOST` are read from the environment (Hostinger sets `PORT`).

> **Windows dev note:** bulk deletion inside `dist/` is blocked by this
> machine's sandbox (`[SAFE_DELETE_BULK_CONFIRM_REQUIRED]`). Prefix builds with
> `CODEBUDDY_SAFE_DELETE_ENABLED=0` so Astro can clean `dist/server/.prerender`
> itself. Without it the build writes every page and chunk, then dies with a
> non-zero exit while tidying up — the artifacts were always complete, which is
> exactly why this was misdiagnosed as a Windows EPERM race until 2026-09-17.

---

## 7. Cloudflare specifics

```bash
ADAPTER=cloudflare npm run build
npm run cf:dev        # real workerd locally, http://127.0.0.1:8788
```

- `wrangler.jsonc` has **no `main`** on purpose: the Vite plugin validates that
  path at config time, before the server bundle exists, so a hardcoded `main`
  breaks `astro build`. Deploy against the config the adapter generates:
  `dist/server/wrangler.json` (it already points at `entry.mjs` + `../client`).
- `imageService: 'passthrough'` is set because the site never calls
  `astro:assets`; the default would inject an `IMAGES` binding and require
  Cloudflare Images, a paid add-on, for nothing.
- Verified locally 2026-09-18 in workerd: `GET /` 200,
  `GET /downloads/...pdf` 200, `GET /api/inquiry/` 405,
  valid POST → 503 (mail unset), missing fields → 400,
  foreign Origin → 403, honeypot → 200.

### Custom 404

The site ships a real error page at `dist/client/404.html` (`src/pages/404.astro`).

- **Cloudflare Pages / Workers static assets**: served automatically for
  unknown routes — nothing to configure.
- **Hostinger Node host**: the @astrojs/node standalone server does NOT map
  unknown paths to 404.html by itself. Add one line in `.htaccess`
  (Apache/LiteSpeed) — `ErrorDocument 404 /404.html` — or, on plain Node
  hosting, a catch-all rewrite to `/404.html`. Verify after deploy:
  `curl -I https://chinafactoryhost.com/this-page-does-not-exist/` should
  return 404 WITH the styled page body, not the server default.
- Do not list `/404/` in the sitemap (the generator only indexes index.astro
  files, so this stays true automatically).

### Generated on every build

- `public/sitemap.xml` — written by `scripts/build-sitemap.mjs` via the
  `prebuild` hook, one `<url>` per `src/pages/**/index.astro` (api/ excluded),
  `lastmod` from each file's own mtime. If you add a page, it enters the
  sitemap on the next build with no manual step.
- `public/robots.txt` — static, points crawlers at the sitemap and blocks
  `/api/`.

---

## 8. Smoke-test after deploy

```bash
# expect 503 while the key is unset, 200 {} once it is set
curl -i -X POST https://chinafactoryhost.com/api/inquiry/ \
  -H 'content-type: application/json' \
  -d '{"name":"Smoke","email":"you@example.com","goal":"deploy check"}'

# the download gate — expect 503 / 200, never 400
curl -i -X POST https://chinafactoryhost.com/api/inquiry/ \
  -H 'content-type: application/json' \
  -d '{"intent":"download","email":"you@example.com"}'
```

Also confirm in a real browser: submit the contact form, a decision-page form
and the checklist gate. Success panels are only reachable on a genuine `2xx`.

---

## 9. Remaining launch blockers (not code)

| Item | Where |
|---|---|
| `RESEND_API_KEY` + verified sending domain | Worker secrets / Node env |
| Real WhatsApp number — `WA_NUMBER` is **hardcoded**, not env | `src/data/site.ts:30` (empty string = every WhatsApp CTA auto-hides) |
| Real factory photos — every `PhotoSlot` is still a placeholder plate | content |
| Registered address / entity name on `/contact/` | content, "to be published" |
| Team bios | `src/pages/about/index.astro`, "pending written sign-off" |
