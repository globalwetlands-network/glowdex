import type { LocalSite } from '@/data/types/local-wetlands.types';
import { CRAB_METRICS, viewLabel } from '../config/panelConfig';
import {
  comparesSiteTypes,
  isUnavailable,
  resolveView,
  type ViewSelection,
} from '../utils/siteAvailability';
import { NativeDensityFigure } from './NativeDensityFigure';
import { NotYetAvailable } from './PanelStates';
import { PlotFigure } from './PlotFigure';

interface ViewContentProps {
  site: LocalSite;
  selection: ViewSelection;
  demoOn: boolean;
}

/** Breadcrumb for the lightbox, e.g. "Australia · Crabs · Density · By site". */
function breadcrumbFor(site: LocalSite, selection: ViewSelection): string {
  if (selection.tab === 'wildlife') return `${site.country} · Wildlife`;
  const metric =
    CRAB_METRICS.find((m) => m.id === selection.metric)?.label ?? '';
  return [
    site.country,
    'Crabs',
    metric,
    viewLabel(selection.view, comparesSiteTypes(site)),
  ].join(' · ');
}

/**
 * The selected view: the demo plot (flag on), else the native CSV chart,
 * else "Not yet available". See resolveView for the duplication rule.
 */
export function ViewContent({ site, selection, demoOn }: ViewContentProps) {
  const resolved = resolveView(site, selection, demoOn);
  if (isUnavailable(resolved)) return <NotYetAvailable />;

  return (
    <div className="flex flex-col gap-4">
      {resolved.plot && (
        <PlotFigure
          plot={resolved.plot}
          locationLabel={`${site.name}, ${site.country}`}
          breadcrumb={breadcrumbFor(site, selection)}
          analytics={{
            tab: selection.tab,
            metric: selection.tab === 'crabs' ? selection.metric : null,
            view: selection.tab === 'crabs' ? selection.view : null,
          }}
        />
      )}
      {resolved.native && <NativeDensityFigure site={site} />}
    </div>
  );
}
