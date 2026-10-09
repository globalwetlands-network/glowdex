/**
 * Footer content (GLO-205), verbatim from the landing-page content review. The
 * dataset version isn't configured here: the footer reads it live from the
 * store manifest.
 */
export interface FooterLink {
  label: string;
  href: string;
}

// TODO: point these at real pages once they exist; FAQ is on this page.
export const FOOTER_LINKS: readonly FooterLink[] = [
  { label: 'About', href: '#' },
  { label: 'Methods', href: '#' },
  { label: 'FAQ', href: '#faq' },
  { label: 'Licence', href: '#' },
  { label: 'How to cite', href: '#' },
  { label: 'Contact', href: '#' },
];

export const FOOTER_CREDIT =
  'MBCAM is built by the Global Wetlands Project at Griffith University and the University of the Western Cape, with partners worldwide.';
