# IndexNow

The verification file in `public/` must be deployed before submitting URLs.
Its name and content are derived from `indexnow.config.json`. This is an
IndexNow ownership key, not a hosting credential.

After a successful production deployment, submit only added or updated pages:

```sh
node scripts/indexnow.mjs /contact/ /guides/yiwu-jewelry-market/
node scripts/indexnow.mjs --dry-run /contact/
```

Alternatively use GitHub Actions → Submit published URLs to IndexNow → Run
workflow, supplying space-separated URLs. No npm install or API secret needed.

This workflow is manual, not triggered on pushes: production deployment is
managed outside GitHub Actions. The script verifies the live ownership file,
HTTP success, canonical URL, and indexing directives. It cannot establish
whether the latest edit has deployed; confirm the hosting deployment first.
It intentionally refuses redirects, tracking parameters and foreign domains.
Deleted URLs are not supported by this helper. Do not repeatedly submit the
whole sitemap. HTTP 200 means received, 202 means key validation pending;
neither means indexed. Keep Sitemap and Google Search Console in use.

Protocol: https://www.indexnow.org/documentation
