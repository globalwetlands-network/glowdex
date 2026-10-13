import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import {
  SITE_DESTINATIONS,
  isComingSoon,
  type SiteDestinationId,
} from '@/constants/comingSoon';
import { ComingSoonLink, type ComingSoonLocation } from './ComingSoonLink';
import type { EntryMode } from '@/app/hooks/useEntryMode';

interface SiteLinkProps {
  id: SiteDestinationId;
  location: ComingSoonLocation;
  mode?: EntryMode | null;
  className?: string;
  /** Applied to the coming-soon wrapper, or merged into the real link. */
  wrapperClassName?: string;
  /** Coming-soon tooltip side. */
  placement?: 'top' | 'bottom';
  children: ReactNode;
}

/**
 * A link to a site destination (About, Methods, Contact, ...). Renders a
 * "Coming soon" control while the destination is listed in COMING_SOON
 * (src/constants/comingSoon.ts), otherwise a real link: an in-app route via
 * the router, or a plain anchor for an external URL.
 */
export function SiteLink({
  id,
  location,
  mode = null,
  className = '',
  wrapperClassName = '',
  placement,
  children,
}: SiteLinkProps) {
  if (isComingSoon(id)) {
    return (
      <ComingSoonLink
        targetId={id}
        location={location}
        mode={mode}
        className={className}
        wrapperClassName={wrapperClassName}
        placement={placement}
      >
        {children}
      </ComingSoonLink>
    );
  }

  const href = SITE_DESTINATIONS[id];
  const classes = `${className} ${wrapperClassName}`.trim();
  return href.startsWith('/') ? (
    <Link to={href} className={classes}>
      {children}
    </Link>
  ) : (
    <a href={href} className={classes}>
      {children}
    </a>
  );
}
