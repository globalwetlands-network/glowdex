import { type ReactNode } from 'react';
import {
  EXAMPLE_CELL,
  EXAMPLE_INDICATOR_PERCENTILES,
  EXAMPLE_QUOTE,
  EXAMPLE_LOCAL_SITE,
  EXAMPLE_TILE,
} from '../../fixtures/workedExample';
import {
  ASSISTANT_EXPLAINER_STEPS,
  ASSISTANT_SUBHEAD,
  EXAMPLE_FOLLOW_UP,
  INDICATOR_DISPLAY_NAMES,
} from './content';

/** 1 → "1st", 22 → "22nd", 13 → "13th". */
function ordinal(n: number): string {
  const teen = n % 100 >= 11 && n % 100 <= 13;
  const suffixes: Record<number, string> = { 1: 'st', 2: 'nd', 3: 'rd' };
  return `${n}${teen ? 'th' : (suffixes[n % 10] ?? 'th')}`;
}

/** Bar colour for a percentile: low, middle, or high within the typology. */
function percentileBarClass(percentile: number): string {
  if (percentile < 25) return 'bg-red-500';
  if (percentile < 75) return 'bg-amber-500';
  return 'bg-glowdex-teal';
}

function Card({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5">
      <p className="m-0 mb-2 text-[11px] font-bold tracking-widest text-gray-500 uppercase">
        {label}
      </p>
      {children}
    </div>
  );
}

/** The illustrating card for each explainer step, in step order. */
const STEP_CARDS = [
  // 1. You select a place
  <Card key="tile" label="Selected tile">
    <p className="m-0 text-lg font-bold text-gray-900">
      {EXAMPLE_LOCAL_SITE.name}, {EXAMPLE_CELL.country}
    </p>
    <div className="mt-2 flex flex-wrap gap-2 text-sm">
      <span className="rounded-md bg-gray-100 px-2 py-0.5 font-mono text-gray-700">
        Tile {EXAMPLE_CELL.id}
      </span>
      <span className="inline-flex items-center gap-1.5 rounded-md bg-gray-100 px-2 py-0.5 text-gray-700">
        <span
          aria-hidden="true"
          className="h-2 w-2 rounded-full"
          // Runtime typology colour — not expressible as a static class.
          style={{ backgroundColor: EXAMPLE_TILE.color }}
        />
        Typology {EXAMPLE_CELL.cluster5}
      </span>
    </div>
  </Card>,

  // 2. It reads the data for that place
  <Card key="indicators" label="Ecological indicators">
    <ul className="m-0 list-none space-y-3 p-0">
      {EXAMPLE_INDICATOR_PERCENTILES.map(({ key, percentile }) => (
        <li key={key}>
          <div className="flex items-baseline justify-between text-sm">
            <span className="font-semibold text-gray-900">
              {INDICATOR_DISPLAY_NAMES[key] ?? key}
            </span>
            <span className="text-gray-500">
              {ordinal(percentile)}
              <span className="sr-only"> percentile in its typology</span>
            </span>
          </div>
          <div className="mt-1 h-1 rounded-full bg-gray-100">
            <div
              className={`h-1 rounded-full ${percentileBarClass(percentile)}`}
              // Runtime percentile width — not expressible as a static class.
              style={{ width: `${Math.max(percentile, 2)}%` }}
            />
          </div>
        </li>
      ))}
    </ul>
  </Card>,

  // 3. It explains what stands out
  <Card key="explanation" label="Explanation">
    <blockquote className="m-0 text-base leading-relaxed text-gray-700">
      &ldquo;
      <mark className="rounded bg-orange-200/70 px-0.5 text-gray-900">
        {EXAMPLE_QUOTE.highlight}
      </mark>
      {EXAMPLE_QUOTE.rest}&rdquo;
    </blockquote>
  </Card>,

  // 4. You can ask follow-up questions
  <Card key="follow-up" label="Follow-up">
    <p className="m-0 rounded-2xl border border-teal-200 bg-teal-50 px-4 py-2 text-sm text-teal-800">
      {EXAMPLE_FOLLOW_UP}
    </p>
    <p className="m-0 mt-3 rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-400">
      Ask a follow-up question...
    </p>
  </Card>,
];

/**
 * "Ask the assistant" explainer (Beta): how the assistant works, in four
 * steps, beside a breakdown of what it reads for the worked example's place.
 */
export function AskTheAssistantExplainer() {
  return (
    <div className="flex flex-col gap-10">
      <header className="flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <h2 className="m-0 text-3xl font-bold text-gray-900 md:text-4xl">
            Ask the assistant
          </h2>
          <span className="rounded-full border border-glowdex-teal/40 bg-glowdex-teal/10 px-2.5 py-0.5 text-xs font-bold tracking-wide text-glowdex-green uppercase">
            Beta
          </span>
        </div>
        <p className="m-0 text-base text-gray-600 md:text-lg">
          {ASSISTANT_SUBHEAD}
        </p>
        {/* The "Works like the AI assistants you already use" strip with
            competitor AI logos is excluded pending explicit sign-off (GLO-190). */}
      </header>

      {/* Each step is paired with the card that illustrates it, so on mobile
          the cards sit under their step instead of piling up at the end. */}
      <ol className="m-0 list-none p-0">
        {ASSISTANT_EXPLAINER_STEPS.map(([title, body], i) => (
          <li
            key={title}
            className="grid gap-4 pb-10 md:grid-cols-[1fr_minmax(0,22rem)] md:gap-12 md:pb-0"
          >
            <div className="md:pb-10">
              <p className="m-0 text-lg font-bold text-gray-900">
                {i + 1}. {title}
              </p>
              <p className="m-0 mt-2 text-base text-gray-600">{body}</p>
            </div>
            <div className="md:border-l md:border-gray-200 md:pb-10 md:pl-6">
              {STEP_CARDS[i]}
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
