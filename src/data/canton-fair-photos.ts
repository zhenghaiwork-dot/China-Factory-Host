/**
 * Canton Fair photographs — single source of truth.
 *
 * Separate from `onsite-photos.ts` on purpose: `pickPhoto()` derives its stride
 * from `PHOTO_IDS.length`, so appending to the onsite set would re-shuffle every
 * photograph already assigned across the site. Canton Fair frames are a
 * different subject anyway (fair halls, not factory floors), so they get their
 * own namespace, their own folder and their own component.
 *
 * Files live in `public/images/canton-fair/` and are pre-optimised: a <=1400w
 * master plus a 700w variant, in avif / webp / jpg. No build-time image
 * pipeline — `imageService` is `passthrough` in astro.config.mjs.
 *
 * `alt` describes ONLY what is visible in the frame, the same rule as the onsite
 * set: no buyer, no deal, no outcome is asserted.
 *
 * `credit` marks a frame that is NOT ours. Those carry a visible source line
 * wherever they are rendered. They are here on a transitional basis — replace
 * them with photographs we own, or with licensed frames, before launch.
 */

export type CantonFairPhotoId = '01' | '02' | '03' | '04' | '05' | '06' | '09';

export interface PhotoCredit {
  /** Who owns the frame, exactly as it should read on the page. */
  source: string;
  /** Fill in once the originating article is confirmed. Never guess a URL. */
  url?: string;
}

export interface CantonFairPhoto {
  w: number;
  h: number;
  alt: string;
  credit?: PhotoCredit;
}

export const CANTON_FAIR_PHOTOS: Record<CantonFairPhotoId, CantonFairPhoto> = {
  '01': {
    w: 769,
    h: 500,
    alt: 'Aerial view of crowded walkways between exhibition halls during a trade fair.',
    credit: { source: 'Southern Metropolis Daily (南方都市报)' },
  },
  '02': {
    w: 764,
    h: 500,
    alt: 'Visitors walking through a wide exhibition hall under red canopies in a machinery section.',
  },
  '03': {
    w: 499,
    h: 333,
    alt: 'A crowd gathered around a technology booth demonstration on the exhibition floor.',
  },
  '04': {
    w: 1400,
    h: 933,
    alt: 'A quadruped robot performing in front of visitors holding up phones at a robotics booth.',
    credit: { source: 'Southern Metropolis Daily (南方都市报)' },
  },
  '05': {
    w: 1400,
    h: 933,
    alt: 'Visitors trying on VR headsets at a technology booth on the exhibition floor.',
  },
  '06': {
    w: 1400,
    h: 933,
    alt: 'Visitors photographing a robot demonstration at a robotics booth.',
    credit: { source: 'Southern Metropolis Daily (南方都市报)' },
  },
  '09': {
    w: 1400,
    h: 933,
    alt: 'A humanoid robot performing in front of a crowd at a trade show.',
    credit: { source: 'CCTV News (央视新闻)' },
  },
};

/** True when a 700w variant exists next to the master. */
export function hasVariant(id: CantonFairPhotoId): boolean {
  return CANTON_FAIR_PHOTOS[id].w > 700;
}
