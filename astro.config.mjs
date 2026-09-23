// @ts-check
import { defineConfig } from 'astro/config';
import node from '@astrojs/node';
import cloudflare from '@astrojs/cloudflare';

/* One codebase, two hosts. Default is the Node standalone server (Hostinger);
   set ADAPTER=cloudflare to emit a Worker instead. Nothing else in src/ changes:
   the mail layer is HTTP-based so it runs on both.

     npm run build                      -> Node host  (dist/server/entry.mjs)
     ADAPTER=cloudflare npm run build   -> Workers    (dist/server/entry.mjs
                                            + dist/server/wrangler.json)

   `output: 'static'` stays either way: Astro 5+ lets a single route opt OUT of
   prerendering with `export const prerender = false`, which is all /api/inquiry/
   needs. The other 24 pages are prebuilt HTML. */
const USE_CLOUDFLARE = process.env.ADAPTER === 'cloudflare';

// ChinaFactoryHost.com — Astro 7.x static site (SSG)
// NOTE: Astro 7 uses the Rust compiler by default — all tags must be closed.
// NOTE: Markdown/MDX is rendered by Sätteri (native pipeline), not remark/rehype.
// NOTE: `src/fetch.ts` is a reserved filename in Astro 7 (advanced routing) — do not use it.

export default defineConfig({
  site: 'https://chinafactoryhost.com',
  output: 'static',
  adapter: USE_CLOUDFLARE
    ? cloudflare({
        // Cloudflare bindings (secrets) become reachable from `astro dev` too,
        // with local values read from .dev.vars.
        platformProxy: { enabled: true },
        // Deliberate. The adapter default is 'cloudflare-binding', which injects
        // an IMAGES binding and therefore requires Cloudflare Images — a paid
        // add-on — even though this site never calls astro:assets (verified: no
        // `astro:assets` import anywhere in src/). Passthrough drops the binding
        // and serves the real images as ordinary static assets.
        imageService: 'passthrough',
      })
    : node({ mode: 'standalone' }),
  trailingSlash: 'always',
  /* 301 maps from the SEO/GEO content map's proposed URLs to the pages that
     already exist under different paths (see docs/content-gap.md §二). Existing
     URLs stay canonical; the document URLs never 404. */
  redirects: {
    '/services/supplier-verification': '/about/how-we-vet-factories',
    '/services/on-site-factory-support': '/services/on-site-support',
    '/services/factory-filming-coordination': '/services/on-site-support/filming-coordination',
    '/sourcing-support': '/services',
  },
  build: {
    format: 'directory',
    inlineStylesheets: 'auto',
  },
  devToolbar: { enabled: false },
  prefetch: { prefetchAll: true },
  vite: {
    // Vite re-optimises (and therefore bulk-deletes) node_modules/.vite/deps when
    // its dependency hash changes. On this machine that delete is blocked by the
    // sandbox, so the optimiser is switched off and given its own directory.
    // Nothing in this site needs dep pre-bundling: no UI framework, no client router.
    cacheDir: 'node_modules/.vite-cfh',
    optimizeDeps: { noDiscovery: true, include: [] },
  },
});
