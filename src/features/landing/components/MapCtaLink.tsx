import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import type { EntryMode } from '@/app/hooks/useEntryMode';
import { PRELOAD_ON_INTENT } from '../preloadOnIntent';

interface MapCtaLinkProps {
  /** Which map workflow the button opens (`/map?mode=…`). */
  mode: EntryMode;
  children: ReactNode;
  /** Layout only (width etc.); the button look is fixed here. */
  className?: string;
}

/**
 * The white, brand-green "open the map" button. Shared by the hero and the
 * closing CTA so their styling and destinations can't drift apart.
 */
export function MapCtaLink({
  mode,
  children,
  className = '',
}: MapCtaLinkProps) {
  return (
    <Link
      to={`/map?mode=${mode}`}
      {...PRELOAD_ON_INTENT}
      className={`rounded-md bg-white px-3.5 py-2 text-center text-[13px] font-bold text-glowdex-green hover:bg-[#f2f1ec] ${className}`}
    >
      {children}
    </Link>
  );
}
