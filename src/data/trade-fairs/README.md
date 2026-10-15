# Trade fair directory — implementation and maintenance

Page: `/china-trade-fairs/`. Source: the owner's `fairs_final.json`, preserved unchanged. `directory.mjs` projects public fields; raw research must never be imported by client scripts or served from `public/`.

## Delivered

38 fair cards, six distinct cluster routes, upcoming confirmed-date strip, month/90-day/TBC/province/city/industry filters, hash bookmarks, first 12/show more, and recently held grouping. Dates use China time at build and browser load. With JavaScript disabled all listings remain accessible. Dates belong to each record's primary next edition; secondary editions and NovaBiz's Yuyao venue remain edition notes, not independent filter records.

Canonical, BreadcrumbList, ItemList, WebPage dateModified and matching FAQPage data are included. No Event schema or rich-result promise. Incoming links added to the guides hub and existing trade-show service overview; existing service route remains distinct. Factory visit CTA uses the existing `/factory-visits/` URL, replacing the brief's unresolved placeholder.

## Source questions and editorial corrections

- **24 missing official URLs:** keqiao, nb_hardware, yw_cysf, yw_factory, cixi_appliance, fz_crossborder, guzhen_lighting, huadong, xm_stone, canton, foshan_ceramic, jinjiang_shoes, nantong_textile, sz_gift, tanzhou, yw_hardware, nb_lighting, huali, haining_leather, wz_campi, dehua, shantou_toy, yangjiang_knife, zhili. These cards have no invented link. Obtain organizer/government evidence URLs for the next verification round.
- No `url_needs_check=true` records were found. This does not mean the supplied links have been independently checked live.
- `zhuji_socks.official_url` contains Chinese commentary after the URL. Only its supplied HTTPS URL is used. Its organizer field contains conflicting source descriptions, which still need clarification.
- `wz_leather` and `wz_campi` have specific day ranges in TBC text. Public labels remove those day ranges. Historical dates in Zhili and Yangjiang TBC notes are also omitted.
- Remove internal “B-level” from Tanzhou's date text and stale “already running” autumn-2026 text from Shenzhen gifts. The JSON itself is retained for provenance.
- `hz_gcbe.official_en_name` explicitly says the full English name needs confirmation. Cards use the supplied descriptive title without claiming an official English name.
- Route descriptions omit organizer statistics, internal “A-file” wording and editor directions. No claim is made that every exhibitor is a manufacturer or offers low MOQs; no Alibaba fee claim is added.
- Individual destination pages for Anji, Puyuan, Maqiao, Jieyang, Nantong Diejiaoqiao and Kunshan do not currently exist. Link instead to the existing manufacturing hub finder; no placeholder links. Existing Zhejiang, Yiwu, Keqiao and Foshan–Shunde guides are linked. Glossary and visit service links exist.
- The visible verification date reproduces the supplied dataset date. This implementation is not a fresh independent verification of every fair.

## Validation

Astro production build and existing npm tests pass. `node scripts/test-trade-fairs.mjs` checks data projection, certainty rules and built HTML. Local Chrome checks passed at widths 320, 375, 390, 430, 768 and 1440: no horizontal overflow, filters/hash restore/reset, show-more, anchor reveal, no-JS, future-date grouping, schema and internal-note exclusion. Page-specific JS source is under 10 KB before bundling.

Lighthouse is not installed in this environment; its performance/accessibility target scores have not been measured or claimed. Local browser QA screenshots are in ignored `docs/trade-fairs-*.png`.

## Next verification cycle

Check TBC records monthly and confirmed fairs 60 days before their start. Record source links and the edition verified, then update `meta.data_verified_on` and the corresponding fair's `verified_on`. The page date and schema derive from meta. Keep watchlist entries private. Run production build and the trade-fair test after edits. Do not promote dates to confirmed without source evidence. Primary date fields drive sorting and archiving; update the record to the next edition after the previous one ends.
