/**
 * "Who it's for" persona blocks (GLO-191), verbatim from the landing-page
 * content review.
 *
 * First draft: not yet checked with the science team or any partner, and the
 * personas are expected to broaden (e.g. students) before sign-off. The section
 * renders whatever is in this list, so adding, removing, reordering or
 * rewording a persona is an edit here only — no component changes.
 */
export interface Persona {
  /** Who the block is for, e.g. "Researchers". */
  audience: string;
  /** The question this audience brings to MBCAM. */
  question: string;
  /** How MBCAM answers it, one sentence per bullet point. */
  points: readonly string[];
}

export const WHO_ITS_FOR_HEADING = "Who it's for";

export const PERSONAS: readonly Persona[] = [
  {
    audience: 'Conservation and coastal managers',
    question: 'Where should we focus effort?',
    points: [
      'Find your area on the map and see which kind of mangrove it is.',
      "Compare it with similar places rather than a global average, so you can see what's unusual about it rather than only what's poor.",
      'Download a summary for a report or a funding proposal.',
    ],
  },
  {
    audience: 'Researchers',
    question: 'How does my site compare with others like it?',
    points: [
      'See how a place sits against others in its typology across every indicator, with the confidence behind the classification and which values are measured rather than estimated.',
      'Download the data and cite the method.',
    ],
  },
  {
    audience: 'Monitoring partners',
    question: 'How does what we record fit into the bigger picture?',
    points: [
      "See your site's wildlife records alongside the global picture for that area, and compare reference, degraded and rehabilitated sites.",
      'Your data becomes part of a global dataset others can use.',
    ],
  },
];
