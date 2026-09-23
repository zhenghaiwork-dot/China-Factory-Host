import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

/* Case studies content collection.
   Every entry carries `placeholder: true` until we hold a real trip plus the
   client's written permission to be named — see the pre-launch TODO list.
   NOTE: src/fetch.ts is reserved by Astro 7 and must not be created. */

const caseStudies = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/case-studies' }),
  schema: z.object({
    title: z.string(),
    standfirst: z.string(),
    /** drives the badge colour and the creator/buyer wording on the detail page */
    clientType: z.enum(['creator', 'buyer']),
    category: z.string(),
    place: z.string(),
    /** filter key — must match the CaseCard data-destination values */
    destination: z.string(),
    cities: z.array(z.string()).default([]),
    /** null renders as "—"; we do not print figures we cannot source. Unsourced
        figures carry data-placeholder="case" as a machine-readable anchor — the
        visible "[ TBC ]" tag is retired (critique round-2 N1). */
    days: z.number().nullable().default(null),
    factoriesVisited: z.number().nullable().default(null),
    factoriesRejected: z.number().nullable().default(null),
    /** empty string = the field is omitted from the page entirely */
    crew: z.string().default(''),
    /** one-line headline used on the card */
    result: z.string(),
    /** one-line context used on the card */
    info: z.string(),
    /** PhotoSlot code on the card */
    photo: z.string(),
    placeholder: z.boolean().default(true),
    order: z.number().default(99),

    // detail-page content
    brief: z.array(z.string()).default([]),
    itinerary: z
      .array(
        z.object({
          day: z.string(),
          time: z.string(),
          title: z.string(),
          desc: z.string(),
          slot: z.string().optional(),
        })
      )
      .default([]),
    cleared: z.array(z.string()).default([]),
    refused: z.array(z.string()).default([]),
    deliverables: z.array(z.string()).default([]),
    results: z.array(z.object({ k: z.string(), v: z.string() })).default([]),
    /** empty string = the note block is omitted from the page entirely */
    verifiedNote: z.string().default(''),
    gallery: z.array(z.string()).default([]),
    problems: z.array(z.string()).default([]),
    related: z
      .array(z.object({ k: z.string(), t: z.string(), href: z.string() }))
      .default([]),
  }),
});

export const collections = { caseStudies };
