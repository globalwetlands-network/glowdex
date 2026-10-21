/**
 * Hero media configuration.
 *
 * Two media options are supported (GLO-188). `video` is the default; switch it
 * via the `VITE_PUBLIC_HERO_MEDIA` repo variable, or preview either option with
 * the `?hero=photo|video` query param. The video's poster doubles as its
 * fallback for reduced motion, slow connections and playback errors. Small
 * viewports get a lighter video (`srcMobile`); see src/assets/hero/CREDITS.md.
 */
import heroPoster from '@/assets/hero/hero-video-moses-perch-poster.webp';
import heroVideo from '@/assets/hero/hero-video-moses-perch.mp4';
import heroVideoMobile from '@/assets/hero/hero-video-moses-perch-mobile.mp4';
import heroPhoto from '@/assets/hero/split-shot-photo.jpg';

export type HeroMediaVariant = 'photo' | 'video';

export const DEFAULT_HERO_MEDIA: HeroMediaVariant = 'video';

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

// The video is the licensed, web-optimised export. TODO: the photo is still a
// watermarked stock comp — replace before ship (see src/assets/hero/CREDITS.md).
export const HERO_MEDIA = {
  photo: {
    src: heroPhoto,
    alt: 'Mangrove trees above the waterline with their roots visible underwater',
    credit: 'Photo: jonathanfilskov-photography / iStock',
  },
  video: {
    src: heroVideo,
    srcMobile: heroVideoMobile,
    poster: heroPoster,
    // Intrinsic size of the poster and the desktop video.
    width: 1280,
    height: 720,
    alt: 'A school of Moses perch swimming among mangrove roots below the waterline',
    credit: 'Video: Baramee Temboonkiat',
  },
} as const;
