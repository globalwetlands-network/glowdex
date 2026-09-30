import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { MONITORING_SITES_COUNT } from '../config/factSheet';
import { resolveHeroMediaVariant } from '../config/heroMedia';
import { useSlowConnection } from '../hooks/useSlowConnection';
import { preloadMapApp } from '../preloadMapApp';
import { HeroMedia } from './HeroMedia';
import { MapCtaLink } from './MapCtaLink';

/**
 * Public landing page: full-bleed hero; `LandingPage` overlays the shared
 * `SiteHeader` on it in its transparent treatment. Both choices route to the map app at /map. Both bylines are always
 * visible, with no hover or disclosure needed (a hard design requirement).
 * The page-level `<main>` belongs to `LandingPage`, which wraps this hero and
 * the sections below it.
 */
export function Hero() {
  const { search } = useLocation();
  const variant = resolveHeroMediaVariant(search);
  const isSlowConnection = useSlowConnection();

  // Preload the map app and its data once the hero has painted and the browser
  // is idle, so /map opens without a loading screen. Skipped on Data Saver /
  // slow connections, where only link intent (hover/focus/touch) triggers it.
  useEffect(() => {
    if (isSlowConnection) return;
    if (typeof window.requestIdleCallback === 'function') {
      const id = window.requestIdleCallback(preloadMapApp, { timeout: 5000 });
      return () => window.cancelIdleCallback(id);
    }
    const id = window.setTimeout(preloadMapApp, 1500);
    return () => window.clearTimeout(id);
  }, [isSlowConnection]);

  return (
    <div className="relative h-screen min-h-[560px] w-full overflow-hidden bg-[#08120e]">
      <HeroMedia variant={variant} />

      <div className="relative z-[1] flex h-full max-w-[620px] flex-col justify-center gap-3 px-6 md:px-16">
        <h1 className="m-0 text-4xl leading-[1.05] font-bold text-white md:text-[54px]">
          Explore the world&apos;s mangroves
        </h1>
        <p className="m-0 max-w-[480px] text-base leading-[1.4] text-[#f2f1ec]">
          MBCAM brings together a global comparison of mangrove areas and
          wildlife monitoring from partners on the ground.
        </p>

        <div className="mt-2.5 flex flex-col gap-2">
          <h2 className="m-0 text-sm font-bold text-white">
            What would you like to see?
          </h2>
          <div className="flex flex-col items-start gap-4 sm:flex-row sm:gap-5">
            <div className="flex w-full flex-col items-start gap-1.5 sm:max-w-[240px] sm:flex-1">
              <MapCtaLink className="w-full">Local animal data</MapCtaLink>
              <p className="m-0 text-[11px] leading-[1.35] text-white">
                Wildlife recorded by partners at monitoring sites.{' '}
                {/* TODO: link to the covered-locations list once it exists */}
                <a href="#" className="underline">
                  See covered locations
                </a>
                .
              </p>
              <p className="m-0 text-[10px] text-[#d8e3da]">
                {MONITORING_SITES_COUNT} sites, and growing
              </p>
            </div>
            <div className="flex w-full flex-col items-start gap-1.5 sm:max-w-[240px] sm:flex-1">
              <MapCtaLink className="w-full">Global assessment</MapCtaLink>
              <p className="m-0 text-[11px] leading-[1.35] text-white">
                Overall ecosystem condition for any mangrove area.
              </p>
            </div>
          </div>
          <p className="mt-2.5 text-[10px] leading-[1.35] text-[#c7d3ca]">
            Free and open to everyone. New to MBCAM?{' '}
            <a href="#faq" className="underline">
              Read the FAQ
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
