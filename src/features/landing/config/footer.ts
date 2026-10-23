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
  'MBCAM is built by the Global Wetlands Project at Griffith University and the University of the Western Cape, working with global partners listed above.';

export interface FooterSource {
  authors: string;
  year: number;
  title: string;
  journal: string;
  /** Volume and page, e.g. "131, p. 108141". */
  details: string;
  url: string;
}

export const FOOTER_SOURCES_HEADING = 'Sources';

/** Text of each source's link, in place of the bare DOI. */
export const FOOTER_SOURCE_LINK_LABEL = 'Read the paper';

/**
 * Method references, in the published citation (Harvard style). The title is
 * as published, so it keeps "typologies".
 */
export const FOOTER_SOURCES: readonly FooterSource[] = [
  {
    authors:
      'Sievers, M., Brown, C.J., Buelow, C.A., Pearson, R.M., Turschwell, M.P., Adame, M.F., Griffiths, L., Holgate, B., Rayner, T.S., Tulloch, V.J.D., Roy Chowdhury, M., zu Ermgassen, P.S.E., Lee, S.Y., Lillebø, A.I., Mackey, B., Maxwell, P.S., Rajkaran, A., Sousa, A.I. and Connolly, R.M.',
    year: 2021,
    title:
      'Global typologies of coastal wetland status to inform conservation and management',
    journal: 'Ecological Indicators',
    details: '131, p. 108141',
    url: 'https://doi.org/10.1016/j.ecolind.2021.108141',
  },
];
