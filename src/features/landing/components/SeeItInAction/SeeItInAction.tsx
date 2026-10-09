import { useState, type ReactNode } from 'react';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { AnalysisAssistantWidget } from '@/app/components/AnalysisAssistantWidget';
// Direct file imports: the LocalData barrel also exports the map layer, which
// would drag mapbox-gl into the landing page's chunk.
import { LocalSiteTooltip } from '@/components/widgets/LocalData/LocalSiteTooltip';
import { LocalWetlandsAnalysisWidget } from '@/components/widgets/LocalData/LocalWetlandsAnalysisWidget';
import MapTooltip from '@/features/map/components/MapTooltip';
import { SelectionPanel } from '@/features/widgets/components/SelectionPanel';
import { GroupedViolinPlot } from '@/features/widgets/components/ViolinPlot';
import {
  EXAMPLE_CELL,
  EXAMPLE_DISTRIBUTIONS,
  EXAMPLE_LOCAL_SITE,
  EXAMPLE_LOCAL_SITES,
  EXAMPLE_LOCAL_SITE_CONTEXT,
  EXAMPLE_LOCAL_UPDATED,
  EXAMPLE_TILE,
  EXAMPLE_TYPOLOGIES,
  EXAMPLE_HIGHLIGHTS,
  EXAMPLE_INSIGHTS,
} from '../../fixtures/workedExample';
import { AskTheAssistantExplainer } from './AskTheAssistantExplainer';
import {
  EXAMPLE_STEPS,
  MODE_EXPLAINERS,
  MODE_LABELS,
  SECTION_HEADING,
  SECTION_SUBHEAD,
  type ExampleMode,
  type ExampleStep,
  type ExampleTarget,
} from './content';
import { ExampleMapBackdrop } from './ExampleMapBackdrop';
import { FitToStage } from './FitToStage';
import { LandingQueryProvider } from './LandingQueryProvider';
import { PRELOAD_ON_INTENT } from '../../preloadOnIntent';

const noop = () => {};

/**
 * Opens the map in the example's own mode — on the example site itself in
 * Local mode, which exists in the live data the fixture was snapshotted from.
 */
function tryItInTheMapHref(mode: ExampleMode): string {
  return mode === 'local'
    ? `/map?mode=local&site=${EXAMPLE_LOCAL_SITE.id}`
    : '/map?mode=global';
}

const MODES: ExampleMode[] = ['local', 'global'];

/**
 * One width for every panel-style step (the app's side-panel width), so the
 * panels don't change size between steps; from `md` FitToStage scales them to
 * fit. Below `md` they shrink to the stage width instead, keeping text at its
 * real size.
 */
const PANEL_CLASS = 'mx-auto w-full max-w-[448px] md:w-[448px]';

/** Steps shown on a map, which fills the stage rather than being scaled. */
const MAP_TARGETS: ReadonlySet<ExampleTarget> = new Set([
  'site-tooltip',
  'tile-tooltip',
]);

/**
 * The real app component for each part of the worked example, fed the same
 * fixture place (tile 21812, Bayhead). Nothing here is recreated markup.
 */
function renderExample(target: ExampleTarget, mode: ExampleMode): ReactNode {
  switch (target) {
    case 'site-tooltip':
      return (
        <ExampleMapBackdrop
          latitude={EXAMPLE_LOCAL_SITE.coordinates[1]}
          longitude={EXAMPLE_LOCAL_SITE.coordinates[0]}
          tile={EXAMPLE_TILE}
        >
          {/* Same positioned wrapper Map.tsx gives the site tooltip. */}
          <div className="absolute z-10 mt-[-6px] -translate-x-1/2 -translate-y-full transform rounded border border-gray-200 bg-white p-2 text-sm whitespace-nowrap shadow-lg">
            <LocalSiteTooltip
              site={EXAMPLE_LOCAL_SITE}
              name={EXAMPLE_LOCAL_SITE.name}
              country={EXAMPLE_LOCAL_SITE.country}
              hoveredCondition={null}
            />
          </div>
        </ExampleMapBackdrop>
      );
    case 'local-chart':
      return (
        <div className={`${PANEL_CLASS} rounded-xl bg-white p-3 shadow-sm`}>
          <LocalWetlandsAnalysisWidget
            localSites={EXAMPLE_LOCAL_SITES}
            localDataUpdated={EXAMPLE_LOCAL_UPDATED}
            selectedCell={EXAMPLE_CELL}
            selectedSiteId={EXAMPLE_LOCAL_SITE.id}
            onSiteSelect={noop}
            localSiteLayerEnabled={false}
            onLocalSiteLayerToggle={noop}
            readOnly
          />
        </div>
      );
    case 'tile-tooltip': {
      const { latitude, longitude } = EXAMPLE_CELL.centerCoords!;
      return (
        <ExampleMapBackdrop
          latitude={latitude}
          longitude={longitude}
          tile={EXAMPLE_TILE}
        >
          <MapTooltip x={0} y={0} cell={EXAMPLE_CELL} typologyScale="scale5" />
        </ExampleMapBackdrop>
      );
    }
    case 'typology-panel':
      return (
        <div className={PANEL_CLASS}>
          <SelectionPanel
            selectedCell={EXAMPLE_CELL}
            typologies={EXAMPLE_TYPOLOGIES}
            currentScale="scale5"
          />
        </div>
      );
    case 'global-chart':
      return (
        <div className={`${PANEL_CLASS} rounded-xl bg-white p-3 shadow-sm`}>
          <GroupedViolinPlot
            distributions={EXAMPLE_DISTRIBUTIONS}
            selectedCellId={EXAMPLE_CELL.id}
          />
        </div>
      );
    case 'assistant':
      return (
        <div className={PANEL_CLASS}>
          <AnalysisAssistantWidget
            // Same split as the map (GLO-207): local reads only the site's
            // field data, global only the tile — never both.
            key={mode}
            mode={mode}
            selectedCellId={mode === 'global' ? EXAMPLE_CELL.id : null}
            selectedSiteId={mode === 'local' ? EXAMPLE_LOCAL_SITE.id : null}
            localSiteContext={
              mode === 'local' ? EXAMPLE_LOCAL_SITE_CONTEXT : null
            }
            hasMangrove={EXAMPLE_CELL.mangroves}
            staticInsight={EXAMPLE_INSIGHTS[mode]}
            highlights={[EXAMPLE_HIGHLIGHTS[mode]]}
            showSuggestions
            readOnly
            readOnlyHint={
              <Link
                to={tryItInTheMapHref(mode)}
                {...PRELOAD_ON_INTENT}
                className="inline-flex items-center gap-1 font-semibold text-glowdex-green hover:underline"
              >
                Try it in the map
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            }
          />
        </div>
      );
  }
}

const ARROW_BUTTON_CLASS =
  'flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-full border border-gray-300 bg-white text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900';

interface StepListProps {
  steps: readonly ExampleStep[];
  activeIndex: number;
  onSelect: (index: number) => void;
}

/** Numbered, clickable steps; the active one is highlighted. */
function StepList({ steps, activeIndex, onSelect }: StepListProps) {
  return (
    <ol aria-label="Steps" className="m-0 flex list-none flex-col gap-1 p-0">
      {steps.map((s, i) => (
        <li key={s.target}>
          <button
            type="button"
            aria-current={i === activeIndex ? 'step' : undefined}
            onClick={() => onSelect(i)}
            className={`flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-left text-base transition-colors ${
              i === activeIndex
                ? 'bg-glowdex-green/10 text-gray-900'
                : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <span
              aria-hidden="true"
              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                i === activeIndex
                  ? 'bg-glowdex-green text-white'
                  : 'border border-gray-300 text-gray-500'
              }`}
            >
              {i + 1}
            </span>
            {/* An invisible bold copy reserves the bold width, so a label
                wraps the same whether or not it's active. Every label is at
                least two lines tall and centred, so all rows share one height
                and the list doesn't shift when the step changes. */}
            <span className="grid min-h-[2lh] items-center">
              <span
                aria-hidden="true"
                className="invisible col-start-1 row-start-1 font-semibold"
              >
                {s.label}
              </span>
              <span
                className={`col-start-1 row-start-1 ${
                  i === activeIndex ? 'font-semibold' : ''
                }`}
              >
                {s.label}
              </span>
            </span>
          </button>
        </li>
      ))}
    </ol>
  );
}

/**
 * Stacked copies of a mode-dependent block share one grid cell (only the
 * active one visible), so the cell is always as tall as the tallest variant
 * and switching modes or steps never shifts the layout.
 */
const STACKED = 'col-start-1 row-start-1';
const hiddenVariant = (isActive: boolean) =>
  isActive ? {} : ({ 'aria-hidden': true, inert: true } as const);

/**
 * "See it in action": a carousel walking through the app in use — the real map
 * tooltips, panels, charts, and assistant — for one place, in either mode.
 */
export function SeeItInAction() {
  const [mode, setMode] = useState<ExampleMode>('local');
  const [stepIndex, setStepIndex] = useState(0);
  const steps = EXAMPLE_STEPS[mode];
  const step = steps[stepIndex];

  const selectMode = (next: ExampleMode) => {
    setMode(next);
    setStepIndex(0);
  };
  const goTo = (index: number) =>
    setStepIndex((index + steps.length) % steps.length);

  return (
    <LandingQueryProvider>
      <section className="bg-white px-6 py-20 md:px-16">
        <div className="mx-auto flex max-w-6xl flex-col gap-16">
          {/* Two columns from lg: title and controls beside the example, so
              both are on screen together. Below lg the controls sit above the
              stage, where a tall example can't push them out of view. */}
          <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-12">
            <div className="flex flex-col gap-6">
              <header>
                <h2 className="m-0 text-3xl font-bold text-gray-900 md:text-5xl">
                  {SECTION_HEADING}
                </h2>
                <p className="m-0 mt-4 text-base text-gray-600 md:text-lg">
                  {SECTION_SUBHEAD}
                </p>
              </header>

              <div className="flex flex-col gap-2">
                <div
                  role="group"
                  aria-label="Example mode"
                  className="flex flex-wrap gap-2"
                >
                  {MODES.map((m) => (
                    <button
                      key={m}
                      type="button"
                      aria-pressed={mode === m}
                      onClick={() => selectMode(m)}
                      className={`cursor-pointer rounded-full px-3 py-1.5 text-[11px] font-bold tracking-wide whitespace-nowrap uppercase md:px-4 md:text-xs ${
                        mode === m
                          ? 'bg-glowdex-green text-white'
                          : 'border border-gray-300 text-gray-600'
                      }`}
                    >
                      {MODE_LABELS[m]}
                    </button>
                  ))}
                </div>
                <div className="grid">
                  {MODES.map((m) => (
                    <p
                      key={m}
                      {...hiddenVariant(m === mode)}
                      className={`m-0 text-sm text-gray-600 ${STACKED} ${
                        m === mode ? '' : 'invisible'
                      }`}
                    >
                      {MODE_EXPLAINERS[m]}
                    </p>
                  ))}
                </div>
              </div>

              {/* Full step list from lg; the compact row below stands in for
                  it on smaller screens. Both modes' lists are stacked so the
                  column keeps the height of the longer one. */}
              <div className="hidden lg:grid">
                {MODES.map((m) => (
                  <div
                    key={m}
                    {...hiddenVariant(m === mode)}
                    className={`${STACKED} ${m === mode ? '' : 'invisible'}`}
                  >
                    <StepList
                      steps={EXAMPLE_STEPS[m]}
                      activeIndex={m === mode ? stepIndex : -1}
                      onSelect={goTo}
                    />
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between gap-4 lg:justify-start">
                <button
                  type="button"
                  aria-label="Previous step"
                  onClick={() => goTo(stepIndex - 1)}
                  className={ARROW_BUTTON_CLASS}
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                {/* Every mode×step caption is stacked so the row keeps the
                    height of the longest one. */}
                <div aria-hidden="true" className="grid flex-1 lg:hidden">
                  {MODES.flatMap((m) =>
                    EXAMPLE_STEPS[m].map((s, i) => (
                      <p
                        key={`${m}-${s.target}`}
                        className={`m-0 self-center text-center text-sm text-gray-900 ${STACKED} ${
                          m === mode && i === stepIndex ? '' : 'invisible'
                        }`}
                      >
                        <span className="font-semibold">
                          {i + 1} of {EXAMPLE_STEPS[m].length}
                        </span>{' '}
                        · {s.label}
                      </p>
                    )),
                  )}
                </div>
                <button
                  type="button"
                  aria-label="Next step"
                  onClick={() => goTo(stepIndex + 1)}
                  className={ARROW_BUTTON_CLASS}
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
              <p aria-live="polite" className="sr-only">
                Step {stepIndex + 1} of {steps.length}: {step.label}
              </p>
            </div>

            <div
              role="region"
              aria-roledescription="carousel"
              aria-label={SECTION_HEADING}
              className="h-[480px] w-full rounded-2xl border border-gray-200 bg-[#f6f6f3] p-4 md:h-[540px] md:p-6"
            >
              <div
                key={`${mode}-${step.target}`}
                role="group"
                aria-roledescription="slide"
                aria-label={`Step ${stepIndex + 1} of ${steps.length}`}
                data-example-target={step.target}
                className="h-full w-full"
              >
                {MAP_TARGETS.has(step.target) ? (
                  renderExample(step.target, mode)
                ) : (
                  <FitToStage>{renderExample(step.target, mode)}</FitToStage>
                )}
              </div>
            </div>
          </div>

          <AskTheAssistantExplainer />
        </div>
      </section>
    </LandingQueryProvider>
  );
}
