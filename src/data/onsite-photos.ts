/**
 * Onsite photographs — single source of truth.
 *
 * The files live in `public/images/onsite/` and are pre-optimised (mozjpeg q78,
 * a 1400w master plus a 700w variant each), so no build-time image pipeline is
 * involved: plain <img>, fully predictable output.
 *
 * `alt` describes ONLY what is visible in the frame. No city, factory or
 * industry is asserted — a photo may be dropped into a Shenzhen page or a
 * Yiwu case study, and the alt text must stay true to the picture, not to the
 * slot it happens to sit in.
 */

export type PhotoId = '01' | '02' | '03' | '04' | '05' | '06' | '07' | '08' | '09' | '10';

export const ONSITE_PHOTOS: Record<PhotoId, { w: number; h: number; alt: string }> = {
  '01': {
    w: 1400,
    h: 723,
    alt: 'Visitors in hard hats and safety vests walking the floor of a large factory during an escorted plant tour.',
  },
  '02': {
    w: 1400,
    h: 849,
    alt: 'A buyer and a factory representative talking outside the company office building on arrival.',
  },
  '03': {
    w: 1400,
    h: 650,
    alt: 'Visitors inspecting stacked raw material panels inside a factory warehouse.',
  },
  '04': {
    w: 1400,
    h: 787,
    alt: 'Buyers and hosts reviewing CNC machine tools inside a guarded machining workshop.',
  },
  '05': {
    w: 1400,
    h: 630,
    alt: 'A supplier team walking buyers past newly built equipment wrapped for transport.',
  },
  '06': {
    w: 1400,
    h: 630,
    alt: 'Buyers inspecting shrink-wrapped equipment staged for shipment beside a loading area.',
  },
  '07': {
    w: 1400,
    h: 875,
    alt: 'A visitor standing in front of a fiber laser cutting machine on the workshop floor.',
  },
  '08': {
    w: 1004,
    h: 500,
    alt: 'Buyers walking between rows of compact excavators in a machinery factory finished-goods hall.',
  },
  '09': {
    w: 891,
    h: 500,
    alt: 'Two visitors walking out of an assembly hall at the end of a factory visit.',
  },
  '10': {
    w: 1400,
    h: 788,
    alt: 'A group of buyers walking through a factory yard between workshop buildings with the host team.',
  },
};

export const PHOTO_IDS = Object.keys(ONSITE_PHOTOS) as PhotoId[];

/**
 * Deterministic "random" pick: the same slot (seed) always resolves to the same
 * photograph across rebuilds, otherwise every deploy would reshuffle the site.
 *
 * `i` walks the list with a stride coprime to its length (3 vs 10), so a row of
 * slots on one page — a 5-day timeline, a case-study gallery — never repeats a
 * photo until it has used all ten.
 */
export function pickPhoto(seed: string, i = 0): PhotoId {
  let h = 2166136261;
  for (let c = 0; c < seed.length; c++) {
    h ^= seed.charCodeAt(c);
    h = Math.imul(h, 16777619);
  }
  h = h >>> 0;
  return PHOTO_IDS[(h + i * 3) % PHOTO_IDS.length];
}

/**
 * A row of slots on ONE page — a 5-day timeline, an 8-photo gallery — must not
 * repeat a photograph, or two adjacent thumbs show the same frame and it reads
 * as a bug. Deterministic hash picks can collide across different seeds, so
 * walk the stride until an unused photo is found. With 10 photos and stride 3
 * (coprime to 10) every seed can reach every photo, so this always terminates
 * with a unique pick for rows of up to ten.
 *
 * `exclude` lets a page coordinate BETWEEN blocks: the hero photograph and any
 * already-assigned row are passed in, so a timeline and a gallery on the same
 * page never show the same frame either.
 */
export function pickUnique(seeds: string[], exclude: PhotoId[] = []): PhotoId[] {
  const used = new Set<PhotoId>(exclude);
  return seeds.map((s) => {
    for (let i = 0; i < PHOTO_IDS.length; i++) {
      const id = pickPhoto(s, i);
      if (!used.has(id)) {
        used.add(id);
        return id;
      }
    }
    return pickPhoto(s); // >10 items on one page: reuse rather than fail
  });
}
