/**
 * Footer content (GLO-205), verbatim from the landing-page content review. The
 * dataset version isn't configured here: the footer reads it live from the
 * store manifest.
 */
import type { SiteDestinationId } from '@/constants/comingSoon';

/**
 * A site page (rendered through SiteLink, so "Coming soon" until it's built,
 * see src/constants/comingSoon.ts) or an in-page anchor.
 */
export type FooterLink =
  | { label: string; destination: SiteDestinationId }
  | { label: string; href: string };

export const FOOTER_LINKS: readonly FooterLink[] = [
  { label: 'About', destination: 'about' },
  { label: 'Methods', destination: 'methods' },
  { label: 'FAQ', href: '#faq' },
  { label: 'Licence', destination: 'licence' },
  { label: 'How to cite', destination: 'cite' },
  { label: 'Contact', destination: 'contact' },
  { label: 'Privacy', destination: 'privacy' },
];

export const FOOTER_CREDIT =
  'MBCAM is built by the Global Wetlands Project at Griffith University and the University of the Western Cape, with partners worldwide.';
