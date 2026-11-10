# Editorial pages

For new long-form sourcing, shopping and travel guides, reuse `src/components/EditorialGuide.astro` and `src/styles/wholesale-guide.css`. The user approved this article layout and refined typography on 2026-11-09. Read `EDITORIAL-LAYOUT.md` before implementing similar content. Preserve the approved visual system; do not restart the design or use a plain Markdown dump.

Keep guide routes under `/guides/`. Preserve the site's existing service boundaries; editorial travel information does not authorize leisure-tour sales. Do not deploy unless the user authorizes deployment.

# Text width and visual balance

User preference confirmed 2026-11-10: avoid large unintended right-side voids caused by stacked max-width limits. For standalone titles and leads, use a responsive width proportional to the container (roughly 960–1100px maximum on wide desktops). Inside framed notes, let paragraphs use the available inner width. Do not globally remove body reading measures, stretch copy edge to edge, or alter intentional text/image split layouts. Center deliberately narrow standalone blocks when appropriate. Review desktop and mobile before claiming visual validation. Apply these principles to future pages and older-page updates. Keep FAQ questions and answers in separate blocks.
