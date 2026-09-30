/**
 * Footer content (GLO-205), verbatim from the landing-page content review.
 *
 * `ACKNOWLEDGEMENT` and `DATASET_VERSION` have no owner yet. While `null` they
 * render as visibly flagged placeholders (amber, dashed); setting a string
 * swaps in plain copy, so the placeholder styling can't outlive the gap.
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
  { label: 'Contact', href: '#' },
  { label: 'Licence', href: '#' },
  { label: 'How to cite', href: '#' },
];

export const FOOTER_CREDIT =
  'MBCAM is developed by the Global Wetlands Project at Griffith University and the University of the Western Cape, with partners worldwide.';

/** Acknowledgement of support; wording still to be agreed. */
export const ACKNOWLEDGEMENT: string | null = null;

/** Dataset version, e.g. "v1.2"; not yet supplied. */
export const DATASET_VERSION: string | null = null;
