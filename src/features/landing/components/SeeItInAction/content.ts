import type { InsightMode } from '@/api/types';

/**
 * Copy for the "See it in action" section, verbatim from the landing-page
 * content review.
 */

/** The worked example's two modes — the map's own (GLO-207). */
export type ExampleMode = InsightMode;

/** The parts of the worked example a step (and its label) points at. */
export type ExampleTarget =
  | 'site-tooltip'
  | 'local-chart'
  | 'tile-tooltip'
  | 'typology-panel'
  | 'global-chart'
  | 'assistant';

export interface ExampleStep {
  target: ExampleTarget;
  /** Explanatory label for this part of the example. */
  label: string;
  /**
   * TODO(GLO-190): the six explanatory labels haven't been supplied yet —
   * these are the content-review step captions standing in. Swap in the
   * verbatim labels and flip this to false.
   */
  placeholderLabel: boolean;
}

export const SECTION_HEADING = 'See it in action';
export const SECTION_SUBHEAD =
  'Select a mangrove area to learn more about its characteristics, how it compares with similar areas and the wildlife recorded there.';

export const MODE_LABELS: Record<ExampleMode, string> = {
  local: 'Local wildlife data',
  global: 'Global assessment',
};

export const MODE_EXPLAINERS: Record<ExampleMode, string> = {
  local: 'Wildlife recorded by partners at monitoring sites.',
  global: 'Overall ecosystem condition for any mangrove area.',
};

export const EXAMPLE_STEPS: Record<ExampleMode, ExampleStep[]> = {
  local: [
    {
      target: 'site-tooltip',
      label: 'Click on a local monitoring site',
      placeholderLabel: true,
    },
    {
      target: 'local-chart',
      label: 'See real measurements recorded there',
      placeholderLabel: true,
    },
    {
      target: 'assistant',
      label: 'Ask the assistant a question in plain language',
      placeholderLabel: true,
    },
  ],
  global: [
    {
      target: 'tile-tooltip',
      label: 'Click a tile anywhere on the map',
      placeholderLabel: true,
    },
    {
      target: 'typology-panel',
      label: 'See its typology, from satellite-derived estimates',
      placeholderLabel: true,
    },
    {
      target: 'global-chart',
      label: 'Compare it with similar places globally',
      placeholderLabel: true,
    },
    {
      target: 'assistant',
      label: 'Ask the assistant a question in plain language',
      placeholderLabel: true,
    },
  ],
};

export const ASSISTANT_EXPLAINER_STEPS: [title: string, body: string][] = [
  [
    'You select a place',
    'Every explanation is grounded in the specific mangrove area you’ve chosen, not a general query.',
  ],
  [
    'It reads the data for that place',
    'The typology, its indicators, and any local monitoring available.',
  ],
  [
    'It explains what stands out',
    'In plain language, comparing this place with others in its typology.',
  ],
  [
    'You can ask follow-up questions',
    'Dig into specific indicators, comparisons, or local data without leaving the panel.',
  ],
];

export const ASSISTANT_SUBHEAD =
  'Every response is grounded in the one place you’ve selected, and shows its sources.';

/** Display names for the example's indicators in the explainer card. */
export const INDICATOR_DISPLAY_NAMES: Record<string, string> = {
  mang_fish_dens: 'Fish density',
  mang_invert_dens: 'Invertebrate density',
  mang_spec_score: 'Species threat score',
};

/** Example follow-up — the assistant's own local-data suggestion chip. */
export const EXAMPLE_FOLLOW_UP = 'What does the local field data show?';
