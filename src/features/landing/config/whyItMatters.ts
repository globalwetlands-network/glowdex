/**
 * "Why it matters" copy (GLO-204), verbatim from the landing-page content
 * review. The two paragraphs are locked; the Local/Global pair was added
 * later to bring restoration tracking forward.
 */
export const WHY_IT_MATTERS_HEADING = 'Why it matters';

export const WHY_IT_MATTERS_PARAGRAPHS: readonly string[] = [
  'Mangroves protect coastlines, store carbon, shelter young fish and support the livelihoods of coastal communities.',
  "But a mangrove in Kenya and one in Australia face very different conditions. Comparing each place with similar ones shows what's typical and what stands out, which helps focus conservation where it's needed.",
];

export interface WhyItMattersScale {
  label: string;
  description: string;
}

/**
 * Local then Global, matching the order used across the landing page. Frames
 * restoration and recovery tracking as a core use case.
 */
export const WHY_IT_MATTERS_SCALES: readonly WhyItMattersScale[] = [
  {
    label: 'Local',
    description:
      'After a restoration effort or a disturbance, local monitoring tracks whether a site is recovering toward a healthy reference condition, comparing reference, degraded and rehabilitated areas over time.',
  },
  {
    label: 'Global',
    description:
      'The global comparison shows how a place sits against others like it, giving restoration work a benchmark for what recovery should look like.',
  },
];
