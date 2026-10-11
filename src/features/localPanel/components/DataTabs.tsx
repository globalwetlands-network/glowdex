import type { ReactNode } from 'react';
import type { LocalSite } from '@/data/types/local-wetlands.types';
import type { CrabMetric, CrabView, PanelTab } from '../demoPlots/manifest';
import { CRAB_METRICS, CRAB_VIEWS, viewLabel } from '../config/panelConfig';
import {
  comparesSiteTypes,
  isUnavailable,
  resolveView,
  type ViewSelection,
} from '../utils/siteAvailability';

interface DataTabsProps {
  site: LocalSite;
  demoOn: boolean;
  selection: ViewSelection;
  /** Last Crabs metric/view, kept while Wildlife is showing. */
  crabState: { metric: CrabMetric; view: CrabView };
  onChange: (selection: ViewSelection) => void;
}

const TABS: { id: PanelTab; label: string; sub: string }[] = [
  { id: 'crabs', label: 'Crabs', sub: 'mangrove crabs' },
  { id: 'wildlife', label: 'Wildlife', sub: 'fish' },
];

const PILL_BASE =
  'rounded-full border font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-glowdex-green/40';
const PILL_SELECTED = 'border-glowdex-green bg-glowdex-green text-white';
const PILL_IDLE =
  'cursor-pointer border-gray-300 bg-white text-gray-700 hover:border-gray-400';
const PILL_UNAVAILABLE =
  'cursor-not-allowed border-dashed border-gray-300 bg-gray-100 text-gray-400';

interface PillRowProps {
  label: string;
  children: ReactNode;
}

function PillRow({ label, children }: PillRowProps) {
  return (
    <div className="flex items-start gap-2">
      <span className="w-[46px] shrink-0 pt-1.5 text-[10px] font-semibold uppercase tracking-[0.06em] text-gray-500">
        {label}
      </span>
      <div role="group" aria-label={label} className="flex flex-wrap gap-2">
        {children}
      </div>
    </div>
  );
}

/**
 * Crabs / Wildlife toggle plus, on Crabs, the Metric and View pill rows.
 * Views with nothing to show are disabled and read "· not yet available".
 */
export function DataTabs({
  site,
  demoOn,
  selection,
  crabState,
  onChange,
}: DataTabsProps) {
  const siteTypes = comparesSiteTypes(site);

  /** Picks the first view with content for a metric, else its first view. */
  function firstView(metric: CrabMetric): CrabView {
    const views = CRAB_VIEWS[metric];
    return (
      views.find(
        (view) =>
          !isUnavailable(
            resolveView(site, { tab: 'crabs', metric, view }, demoOn),
          ),
      ) ?? views[0]
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div
        role="group"
        aria-label="Data"
        className="inline-flex self-start rounded-full border border-gray-200 bg-gray-100 p-[3px]"
      >
        {TABS.map((tab) => {
          const active = selection.tab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              aria-pressed={active}
              onClick={() =>
                onChange(
                  tab.id === 'crabs'
                    ? { tab: 'crabs', ...crabState }
                    : { tab: 'wildlife' },
                )
              }
              className={`rounded-full px-4 py-2 text-[13px] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-glowdex-green/40 ${
                active
                  ? 'bg-white font-bold text-glowdex-green shadow-sm'
                  : 'cursor-pointer font-semibold text-gray-600 hover:text-gray-800'
              }`}
            >
              {tab.label}{' '}
              <span className="text-[11px] font-medium text-gray-400">
                {tab.sub}
              </span>
            </button>
          );
        })}
      </div>

      {selection.tab === 'crabs' && (
        <>
          <PillRow label="Metric">
            {CRAB_METRICS.map((m) => {
              const active = selection.metric === m.id;
              return (
                <button
                  key={m.id}
                  type="button"
                  aria-pressed={active}
                  onClick={() =>
                    onChange({
                      tab: 'crabs',
                      metric: m.id,
                      view: firstView(m.id),
                    })
                  }
                  className={`${PILL_BASE} px-3.5 py-[7px] text-[12.5px] ${
                    active ? PILL_SELECTED : PILL_IDLE
                  }`}
                >
                  {m.label}
                </button>
              );
            })}
          </PillRow>

          <PillRow label="View">
            {CRAB_VIEWS[selection.metric].map((view) => {
              const active = selection.view === view;
              const unavailable = isUnavailable(
                resolveView(
                  site,
                  { tab: 'crabs', metric: selection.metric, view },
                  demoOn,
                ),
              );
              return (
                <button
                  key={view}
                  type="button"
                  aria-pressed={active}
                  disabled={unavailable}
                  onClick={() =>
                    onChange({ tab: 'crabs', metric: selection.metric, view })
                  }
                  className={`${PILL_BASE} px-3 py-1.5 text-[12px] ${
                    unavailable
                      ? PILL_UNAVAILABLE
                      : active
                        ? PILL_SELECTED
                        : PILL_IDLE
                  }`}
                >
                  {viewLabel(view, siteTypes)}
                  {unavailable && (
                    <span className="text-[10px] font-medium">
                      {' '}
                      · not yet available
                    </span>
                  )}
                </button>
              );
            })}
          </PillRow>
        </>
      )}
    </div>
  );
}
