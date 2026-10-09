/**
 * "Who it's for" persona blocks (GLO-191), verbatim from the landing-page
 * content review: four audiences, two of them without a question line.
 *
 * Rewording or reordering a persona is an edit here only. The grid in
 * `WhoItsFor.tsx` is laid out for exactly four cards (one column, then 2×2,
 * then one row), so adding or removing a persona also means revisiting its
 * column classes.
 */
export interface Persona {
  /** Who the block is for, e.g. "Researchers and Students". */
  audience: string;
  /** The question this audience brings to MBCAM. Omit for no question line. */
  question?: string;
  /** How MBCAM answers it, one sentence per bullet point. */
  points: readonly string[];
}

export const WHO_ITS_FOR_HEADING = "Who it's for";

export const PERSONAS: readonly Persona[] = [
  {
    audience: 'Conservation Managers',
    points: [
      'Find your area on the map and see which kind of mangrove it is.',
      'Compare it with similar places rather than a global average.',
      'Download a summary for a report or a funding proposal.',
    ],
  },
  {
    audience: 'Researchers and Students',
    question: 'How does my site compare with others like it?',
    points: [
      'See how a site sits against others in its typology across every indicator, with the confidence behind the classification and which values are measured rather than estimated.',
      'Download the data and cite the method.',
    ],
  },
  {
    audience: 'Monitoring Partners',
    question: 'How does what we record fit into the bigger picture?',
    points: [
      "See your site's wildlife records alongside the global picture for that area, and compare reference, degraded and rehabilitated sites.",
      'Your data becomes part of a global dataset others can use.',
    ],
  },
  {
    audience: 'Curious Explorers',
    points: [
      'Free and open to everyone.',
      "Learn about the world's mangroves and local wildlife.",
    ],
  },
];
