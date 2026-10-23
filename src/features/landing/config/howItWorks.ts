/**
 * "How it works" steps (GLO-192), verbatim from the landing-page content
 * review.
 *
 * Wording still needs a scientific-accuracy check before final ship, so expect
 * edits here. The section renders whatever is in this list, in order.
 */

import type { SiteDestinationId } from '@/constants/comingSoon';

export interface HowItWorksStep {
  /** One-word step name, e.g. "Gather". */
  title: string;
  description: string;
}

export const HOW_IT_WORKS_HEADING = 'How it works';

export const HOW_IT_WORKS_STEPS: readonly HowItWorksStep[] = [
  {
    title: 'Gather',
    description:
      'We bring together global data on every mangrove area: its extent, its structure, the wildlife it supports and the pressures it faces.',
  },
  {
    title: 'Group',
    description:
      'A statistical model sorts mangrove areas into condition profiles: groups of areas with similar characteristics and pressures.',
  },
  {
    title: 'Compare',
    description:
      'We compare each area with others in its profile: measuring it against areas like it, not against a global average.',
  },
  {
    title: 'Monitor',
    description:
      'Partners monitor sites in the field, recording wildlife such as crabs at reference, degraded and restored sites. Their data joins the global dataset, feeding back into future rounds of comparison.',
  },
];

export const METHODS_LINK_LABEL = 'Read the full methods';

/** Rendered through SiteLink: "Coming soon" until the methods page exists. */
export const METHODS_DESTINATION = 'methods' satisfies SiteDestinationId;
