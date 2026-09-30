import { useState } from 'react';
import { HERO_MEDIA, type HeroMediaVariant } from '../config/heroMedia';
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion';
import { useSlowConnection } from '../hooks/useSlowConnection';

interface HeroMediaProps {
  variant: HeroMediaVariant;
}

const MEDIA_CLASS = 'absolute inset-0 h-full w-full object-cover';

/**
 * Full-bleed hero background plus the legibility gradient. The video variant
 * falls back to its poster image for reduced motion, slow connections, or a
 * playback error.
 */
export function HeroMedia({ variant }: HeroMediaProps) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const isSlowConnection = useSlowConnection();
  const [videoFailed, setVideoFailed] = useState(false);

  const video = HERO_MEDIA.video;
  const showVideo =
    variant === 'video' &&
    !prefersReducedMotion &&
    !isSlowConnection &&
    !videoFailed;

  let media;
  if (variant === 'photo') {
    media = (
      <img
        src={HERO_MEDIA.photo.src}
        alt={HERO_MEDIA.photo.alt}
        className={MEDIA_CLASS}
      />
    );
  } else if (showVideo) {
    media = (
      <video
        src={video.src}
        poster={video.poster}
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        aria-label={video.alt}
        onError={() => setVideoFailed(true)}
        className={MEDIA_CLASS}
      />
    );
  } else {
    media = <img src={video.poster} alt={video.alt} className={MEDIA_CLASS} />;
  }

  return (
    <>
      {media}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(100deg,rgba(8,18,14,.82)_0%,rgba(8,18,14,.62)_40%,rgba(8,18,14,.18)_68%,rgba(8,18,14,0)_100%)]"
      />
      {/* Top scrim: the side gradient has faded out by the header's nav and
          "Open the map", which sit over bright sky; this keeps them at AA
          contrast. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-[linear-gradient(180deg,rgba(8,18,14,.7)_0%,rgba(8,18,14,.45)_45%,rgba(8,18,14,0)_100%)]"
      />
      <p className="absolute right-4 bottom-3 z-[1] m-0 text-[10px] text-white/70">
        {HERO_MEDIA[variant].credit}
      </p>
    </>
  );
}
