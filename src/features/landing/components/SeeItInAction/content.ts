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
   * True while the label is a content-review step caption standing in for
   * the final copy (GLO-190). Swap in the verbatim label and flip this to
   * false.
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
      label: 'See direct measurements recorded there',
      placeholderLabel: false,
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
      label:
        'See its condition profile and confidence from satellite-derived estimates',
      placeholderLabel: false,
    },
    {
      target: 'global-chart',
      label: 'Compare it with similar places around the world',
      placeholderLabel: false,
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
    'The condition profile, its indicators, and any local monitoring available.',
  ],
  [
    'It explains what stands out',
    'In plain language, comparing this place with others in its condition profile.',
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

/**
 * Footnote under the section (GLO-216), split around the DOI so it can be a
 * link. The paper title is quoted as published, so it keeps "typologies".
 */
export const FOOTNOTE_BEFORE_DOI =
  "Sources: Sievers, M., Brown, C.J., Buelow, C.A., Pearson, R.M., Turschwell, M.P., Adame, M.F., Griffiths, L., Holgate, B., Rayner, T.S., Tulloch, V.J.D., Roy Chowdhury, M., zu Ermgassen, P.S.E., Lee, S.Y., Lillebø, A.I., Mackey, B., Maxwell, P.S., Rajkaran, A., Sousa, A.I. and Connolly, R.M. (2021) 'Global typologies of coastal wetland status to inform conservation and management', Ecological Indicators, 131, p. 108141. Available at: ";
export const FOOTNOTE_DOI_URL = 'https://doi.org/10.1016/j.ecolind.2021.108141';
export const FOOTNOTE_AFTER_DOI =
  ' · AI-generated interpretation; always verify with an expert.';
