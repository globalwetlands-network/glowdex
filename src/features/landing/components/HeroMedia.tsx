import { useRef, useState } from 'react';
import { Pause, Play } from 'lucide-react';
import { HERO_MEDIA, type HeroMediaVariant } from '../config/heroMedia';
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion';
import { useSlowConnection } from '../hooks/useSlowConnection';

interface HeroMediaProps {
  variant: HeroMediaVariant;
}

const MEDIA_CLASS = 'absolute inset-0 h-full w-full object-cover';

/** Below Tailwind's `md`: phones get the lighter mobile video. */
const SMALL_VIEWPORT_QUERY = '(max-width: 767px)';

function isSmallViewport(): boolean {
  return typeof window.matchMedia === 'function'
    ? window.matchMedia(SMALL_VIEWPORT_QUERY).matches
    : false;
}

/**
 * Full-bleed hero background plus the legibility gradient. The video variant
 * falls back to its poster image for reduced motion, slow connections, or a
 * playback error, and has a pause button (WCAG 2.2.2).
 */
export function HeroMedia({ variant }: HeroMediaProps) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const isSlowConnection = useSlowConnection();
  const [videoFailed, setVideoFailed] = useState(false);
  // Chosen once in code, not with a `media` attribute on <source>, so the
  // file is fixed for the visit and never swapped mid-play on resize.
  const [useMobileVideo] = useState(isSmallViewport);
  const videoRef = useRef<HTMLVideoElement>(null);
  // Starts paused and follows the element's own play/pause events. Blocked
  // autoplay (e.g. iOS Low Power Mode) fires no event at all, so assuming
  // "playing" would leave the button saying Pause over a still video.
  const [paused, setPaused] = useState(true);

  const video = HERO_MEDIA.video;
  const showVideo =
    variant === 'video' &&
    !prefersReducedMotion &&
    !isSlowConnection &&
    !videoFailed;

  const togglePlayback = () => {
    const element = videoRef.current;
    if (!element) return;
    if (element.paused) {
      element.play().catch(() => {});
    } else {
      element.pause();
    }
  };

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
      <>
        <video
          ref={videoRef}
          src={useMobileVideo ? video.srcMobile : video.src}
          poster={video.poster}
          width={video.width}
          height={video.height}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          aria-label={video.alt}
          onPlay={() => setPaused(false)}
          onPause={() => setPaused(true)}
          onError={() => setVideoFailed(true)}
          className={MEDIA_CLASS}
        />
        <button
          type="button"
          onClick={togglePlayback}
          aria-label={
            paused ? 'Play background video' : 'Pause background video'
          }
          className="absolute right-4 bottom-8 z-[2] flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-black/40 text-white transition-colors hover:bg-black/60 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black focus-visible:outline-none"
        >
          {paused ? (
            <Play aria-hidden="true" className="h-4 w-4" />
          ) : (
            <Pause aria-hidden="true" className="h-4 w-4" />
          )}
        </button>
      </>
    );
  } else {
    media = (
      <img
        src={video.poster}
        alt={video.alt}
        width={video.width}
        height={video.height}
        className={MEDIA_CLASS}
      />
    );
  }

  return (
    <>
      {media}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(100deg,rgba(8,18,14,.82)_0%,rgba(8,18,14,.62)_40%,rgba(8,18,14,.18)_68%,rgba(8,18,14,0)_100%)]"
      />
      <p className="absolute right-4 bottom-3 z-[1] m-0 text-[10px] text-white/70">
        {HERO_MEDIA[variant].credit}
      </p>
    </>
  );
}
