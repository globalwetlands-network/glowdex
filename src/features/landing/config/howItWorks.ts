/**
 * "How it works" steps (GLO-192), verbatim from the landing-page content
 * review.
 *
 * Wording still needs a scientific-accuracy check before final ship, so expect
 * edits here. The section renders whatever is in this list, in order.
 */
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
      'A statistical model sorts mangrove areas into typologies: groups of places with similar characteristics and pressures.',
  },
  {
    title: 'Compare',
    description:
      'We compare each place with others in its typology: measuring it against places like it, not against a global average.',
  },
  {
    title: 'Monitor',
    description:
      'Partners monitor sites in the field, recording wildlife such as crabs at reference, degraded and rehabilitated sites. Their data joins the global dataset, feeding back into future rounds of comparison.',
  },
];

export const METHODS_LINK_LABEL = 'Read the full methods';

// TODO: point at the methods page once it exists (same as the header's Methods link).
export const METHODS_HREF = '#';
