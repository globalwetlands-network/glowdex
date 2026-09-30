import { useEffect } from 'react';
import { ArrowRight } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import logo from '@/assets/globalwetlands.png';
import { MONITORING_SITES_COUNT } from '../config/factSheet';
import { resolveHeroMediaVariant } from '../config/heroMedia';
import { useSlowConnection } from '../hooks/useSlowConnection';
import { preloadMapApp } from '../preloadMapApp';
import { HeroMedia } from './HeroMedia';

/** Start loading the map as soon as the visitor shows intent to open it. */
const PRELOAD_ON_INTENT = {
  onPointerEnter: preloadMapApp,
  onFocus: preloadMapApp,
  onTouchStart: preloadMapApp,
};

/**
 * Public landing page: full-bleed hero with a transparent header overlaid on
 * the media. Both choices route to the map app at /map. Both bylines are always
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

      {/* Transparent header, overlaid on the media (hero-only; TopBar is unaffected) */}
      <header className="absolute top-0 right-0 left-0 z-10 flex h-[72px] items-center justify-between px-6 md:px-12">
        <div className="flex items-center gap-2.5">
          <img src={logo} alt="MBCAM logo" className="h-7 w-7" />
          <span className="text-xl leading-none font-bold text-white">
            MBCAM
          </span>
        </div>
        <nav className="hidden gap-8 text-sm text-white md:flex">
          {/* TODO: point About / Methods / FAQ at real pages once they exist */}
          <a href="#" className="hover:underline">
            About
          </a>
          <a href="#" className="hover:underline">
            Methods
          </a>
          <a href="#" className="hover:underline">
            FAQ
          </a>
        </nav>
        <Link
          to="/map"
          {...PRELOAD_ON_INTENT}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-white hover:underline"
        >
          Open the map
          <ArrowRight className="h-3.5 w-3.5" strokeWidth={2.4} />
        </Link>
      </header>

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
              <Link
                to="/map"
                {...PRELOAD_ON_INTENT}
                className="w-full rounded-md bg-white px-3.5 py-2 text-center text-[13px] font-bold text-glowdex-green hover:bg-[#f2f1ec]"
              >
                Local animal data
              </Link>
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
              <Link
                to="/map"
                {...PRELOAD_ON_INTENT}
                className="w-full rounded-md bg-white px-3.5 py-2 text-center text-[13px] font-bold text-glowdex-green hover:bg-[#f2f1ec]"
              >
                Global assessment
              </Link>
              <p className="m-0 text-[11px] leading-[1.35] text-white">
                Overall ecosystem condition for any mangrove area.
              </p>
            </div>
          </div>
          <p className="mt-2.5 text-[10px] leading-[1.35] text-[#c7d3ca]">
            Free and open to everyone. New to MBCAM?{' '}
            {/* TODO: link to the FAQ page once it exists */}
            <a href="#" className="underline">
              Read the FAQ
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
