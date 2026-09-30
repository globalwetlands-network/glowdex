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
  EXAMPLE_HIGHLIGHT,
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
  type ExampleTarget,
} from './content';
import { ExampleMapBackdrop } from './ExampleMapBackdrop';
import { FitToStage } from './FitToStage';
import { LandingQueryProvider } from './LandingQueryProvider';

const noop = () => {};

const MODES: ExampleMode[] = ['local', 'global'];

/**
 * One width for every panel-style step (the app's side-panel width), so the
 * panels don't change size between steps; FitToStage scales them to fit.
 */
const PANEL_CLASS = 'w-[448px]';

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
            // Global mode has no local context, so the local-data chip and
            // local findings drop out, just as in the app.
            key={mode}
            selectedCellId={EXAMPLE_CELL.id}
            localSiteContext={
              mode === 'local' ? EXAMPLE_LOCAL_SITE_CONTEXT : null
            }
            hasMangrove={EXAMPLE_CELL.mangroves}
            staticInsight={EXAMPLE_INSIGHTS[mode]}
            highlights={[EXAMPLE_HIGHLIGHT]}
            showSuggestions
            readOnly
            readOnlyHint={
              <Link
                to="/map"
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
          <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-12">
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
                <p className="m-0 text-sm text-gray-600">
                  {MODE_EXPLAINERS[mode]}
                </p>
              </div>

              {/* Full step list from lg; the compact row below stands in for
                  it on smaller screens. */}
              <ol
                aria-label="Steps"
                className="m-0 hidden list-none flex-col gap-1 p-0 lg:flex"
              >
                {steps.map((s, i) => (
                  <li key={`${mode}-${s.target}`}>
                    <button
                      type="button"
                      aria-current={i === stepIndex ? 'step' : undefined}
                      onClick={() => goTo(i)}
                      className={`flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-left text-base transition-colors ${
                        i === stepIndex
                          ? 'bg-glowdex-green/10 text-gray-900'
                          : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      <span
                        aria-hidden="true"
                        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                          i === stepIndex
                            ? 'bg-glowdex-green text-white'
                            : 'border border-gray-300 text-gray-500'
                        }`}
                      >
                        {i + 1}
                      </span>
                      {/* An invisible bold copy reserves the bold width, so a
                          label wraps the same whether or not it's active and
                          the list doesn't shift when the step changes. */}
                      <span className="grid">
                        <span
                          aria-hidden="true"
                          className="invisible col-start-1 row-start-1 font-semibold"
                        >
                          {s.label}
                        </span>
                        <span
                          className={`col-start-1 row-start-1 ${
                            i === stepIndex ? 'font-semibold' : ''
                          }`}
                        >
                          {s.label}
                        </span>
                      </span>
                    </button>
                  </li>
                ))}
              </ol>

              <div className="flex items-center justify-between gap-4 lg:justify-start">
                <button
                  type="button"
                  aria-label="Previous step"
                  onClick={() => goTo(stepIndex - 1)}
                  className={ARROW_BUTTON_CLASS}
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <p
                  aria-hidden="true"
                  className="m-0 flex-1 text-center text-sm text-gray-900 lg:hidden"
                >
                  <span className="font-semibold">
                    {stepIndex + 1} of {steps.length}
                  </span>{' '}
                  · {step.label}
                </p>
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
