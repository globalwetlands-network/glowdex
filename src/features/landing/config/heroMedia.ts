/**
 * Hero media configuration.
 *
 * Two media options are supported while the image-vs-video decision is pending
 * (GLO-188). `photo` stays the default until the crab video is licensed and the
 * vote is resolved; switch it via the `VITE_PUBLIC_HERO_MEDIA` repo variable, or
 * preview either option with the `?hero=photo|video` query param.
 */
import crabPoster from '@/assets/hero/crab-poster.jpg';
import crabVideo from '@/assets/hero/crab.mp4';
import heroPhoto from '@/assets/hero/split-shot-photo.jpg';

export type HeroMediaVariant = 'photo' | 'video';

export const DEFAULT_HERO_MEDIA: HeroMediaVariant = 'photo';

const HERO_MEDIA_ENV = import.meta.env.VITE_PUBLIC_HERO_MEDIA as
  | string
  | undefined;

function isHeroMediaVariant(value: unknown): value is HeroMediaVariant {
  return value === 'photo' || value === 'video';
}

/**
 * Resolves which hero media to show: `?hero=` query param, then the env flag,
 * then the default. Unrecognised values are ignored.
 */
export function resolveHeroMediaVariant(
  search: string,
  envValue: string | undefined = HERO_MEDIA_ENV,
): HeroMediaVariant {
  const fromQuery = new URLSearchParams(search).get('hero');
  if (isHeroMediaVariant(fromQuery)) return fromQuery;
  if (isHeroMediaVariant(envValue)) return envValue;
  return DEFAULT_HERO_MEDIA;
}

// TODO: replace with licensed, compressed/optimised exports before ship — these
// are watermarked iStock comps (see src/assets/hero/CREDITS.md).
export const HERO_MEDIA = {
  photo: {
    src: heroPhoto,
    alt: 'Mangrove trees above the waterline with their roots visible underwater',
    credit: 'Photo: jonathanfilskov-photography / iStock',
  },
  video: {
    src: crabVideo,
    poster: crabPoster,
    alt: 'A crab walking among mangrove roots',
    credit: 'Video: iStock',
  },
} as const;
