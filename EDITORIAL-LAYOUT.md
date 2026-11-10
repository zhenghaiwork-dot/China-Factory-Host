# Approved reusable editorial layout

Approved by the user on 9 November 2026, using the China wholesale markets article as reference.

## Implementation

Use `src/components/EditorialGuide.astro` with a Markdown module imported as `* as document`. Pass `document`, `current`, optional `category`, `quickLabel`, and `quickLinks` (objects with `slug` and `text`). See `src/pages/guides/china-wholesale-markets/index.astro` for the minimal route wrapper. Retain `index.astro` routes so the existing sitemap generator discovers them.

Markdown contract: frontmatter includes title, description and an ISO updated date. Body begins with one H1, a direct-answer paragraph, then one source/verification-note paragraph. Subsequent H2s are chapters, H3/H4s are subsections. The component extracts the first two paragraphs into the lead and editorial note; do not omit either or put a body paragraph in that position. Quick-link slugs must match rendered heading IDs. Article content is trusted repository Markdown, not runtime user HTML.

## Preserve the approved details

- White page, restrained neutral-grey note and table headers; no large coloured panels.
- Desktop H1 capped at 46px, body 17px, tables 15px; avoid tiny helper text.
- Wide desktop layout with a 210px sticky contents column and 64px gutter.
- Clear chapter spacing without horizontal rules between every section.
- Tables have fine row separators, no outer box or alternating stripe background.
- Mobile has a collapsible contents list, 44px navigation targets, and horizontal scrolling confined to tables.
- Active chapter is identified with colour, weight and aria-current. Table scroll hints appear only when columns overflow. Reduced-motion preferences are respected.

## Verify each new article

Build; check 360/390px mobile and desktop, no page-level horizontal overflow, table keyboard access and horizontal scroll, directory/quick-link anchors, canonical, sitemap and internal links. Confirm notes, figures and source limitations remain visible. Preserve article text when changing presentation. Do not claim device-specific validation beyond the viewports actually checked.

User refinement on 2026-11-09: reject boxed active TOC items, pink backgrounds and red inset vertical rules. Keep the TOC light: text-only active colour/weight, stable number alignment. Do not reintroduce these decorations as polish.
