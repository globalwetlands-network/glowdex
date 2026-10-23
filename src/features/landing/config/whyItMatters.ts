import type { EntryMode } from '@/app/hooks/useEntryMode';

/**
 * "Why it matters" copy (GLO-204), verbatim from the landing-page content
 * review. The Local/Global pair was added later to bring restoration tracking
 * forward; it uses the same mode names as the hero and the map's switch.
 */
export const WHY_IT_MATTERS_HEADING = 'Why it matters';

export const WHY_IT_MATTERS_PARAGRAPHS: readonly string[] = [
  'Mangroves protect coastlines, provide timber products, improve water quality, store carbon, support fisheries harvests and the livelihoods of coastal communities.',
  "But a mangrove forest in Kenya and one in Australia face very different conditions. Comparing each to similar areas, not to a global average, shows what's unusual about it and helps focus conservation where it's actually needed.",
];

export interface WhyItMattersScale {
  /** The map workflow this scale opens. */
  mode: EntryMode;
  /** Mode name, shown as a capsule. */
  label: string;
  description: string;
  /** Text of the link into that mode of the map. */
  linkLabel: string;
}

/**
 * Local then Global, matching the order used across the landing page. Frames
 * restoration and recovery tracking as a core use case.
 */
export const WHY_IT_MATTERS_SCALES: readonly WhyItMattersScale[] = [
  {
    mode: 'local',
    label: 'Local wildlife data',
    description:
      'After a restoration effort or a disturbance, local wildlife monitoring tracks whether a site is recovering toward a healthy reference condition, comparing reference, degraded and restored areas over time.',
    linkLabel: 'Explore local wildlife data',
  },
  {
    mode: 'global',
    label: 'Global assessment',
    description:
      'The global assessment shows how a place sits against others like it, giving restoration work a benchmark for what recovery should look like.',
    linkLabel: 'Explore the global assessment',
  },
];
