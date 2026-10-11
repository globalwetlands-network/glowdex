/**
 * Destinations that don't exist yet (GLO-210). Every link to one of these
 * renders through `SiteLink`, which shows a "Coming soon" control while the
 * id is in COMING_SOON and a real link once it isn't.
 *
 * When a page ships: add its route, confirm its href below, then delete its
 * id from COMING_SOON. No call site needs editing.
 */

export type SiteDestinationId =
  | 'about'
  | 'methods'
  | 'licence'
  | 'cite'
  | 'contact'
  | 'partners-all'
  | 'privacy';

/** Planned location of each destination (an in-app route or an external URL). */
export const SITE_DESTINATIONS: Record<SiteDestinationId, string> = {
  about: '/about',
  methods: '/methods',
  licence: '/licence',
  cite: '/cite',
  contact: '/contact',
  'partners-all': '/partners',
  privacy: '/privacy',
};

/** Destinations not built yet. Remove an id to restore its real link. */
export const COMING_SOON: ReadonlySet<SiteDestinationId> = new Set([
  'about',
  'methods',
  'licence',
  'cite',
  'contact',
  'partners-all',
  'privacy',
]);

/** True while the destination's page doesn't exist yet. */
export function isComingSoon(id: SiteDestinationId): boolean {
  return COMING_SOON.has(id);
}
