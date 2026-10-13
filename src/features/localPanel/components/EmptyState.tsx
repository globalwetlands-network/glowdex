import type { LocalSite } from '@/data/types/local-wetlands.types';
import { continentOf } from '../config/continents';

interface EmptyStateProps {
  /** Locations with results, derived from the data. */
  available: LocalSite[];
  /** Countries in the data with no results yet. */
  dataToCome: string[];
  onOpen: (siteId: string) => void;
}

/** Nothing selected: what has results, and what is still to come. */
export function EmptyState({ available, dataToCome, onOpen }: EmptyStateProps) {
  return (
    <div className="flex flex-col gap-3.5 rounded-xl border border-dashed border-gray-300 bg-[#fafaf9] p-5">
      <div>
        <p className="text-[14px] font-bold text-gray-900">
          Select a continent and country
        </p>
        <p className="mt-1 text-[12.5px] leading-[1.45] text-gray-600">
          Results from partner monitoring sites: mangrove crabs and fish,
          compared across site types using standardised methods.
        </p>
      </div>

      {available.length > 0 && (
        <div className="flex flex-col gap-2">
          <p className="text-[10px] font-semibold uppercase tracking-[0.06em] text-gray-500">
            Results available
          </p>
          <ul className="flex flex-col gap-2">
            {available.map((site) => (
              <li
                key={site.id}
                className="flex items-center justify-between gap-3 rounded-[10px] border border-gray-200 bg-white px-3.5 py-[11px]"
              >
                <div className="min-w-0">
                  <p className="text-[13px] font-semibold text-gray-900">
                    {site.country}
                  </p>
                  <p className="text-[12px] text-gray-500">
                    {continentOf(site.country)} · {site.name}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onOpen(site.id)}
                  aria-label={`Open ${site.name}, ${site.country}`}
                  className="shrink-0 cursor-pointer text-[12px] font-semibold text-glowdex-interactive hover:text-glowdex-interactive-hover focus:outline-none focus-visible:underline"
                >
                  Open
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {dataToCome.length > 0 && (
        <div className="flex flex-col gap-2">
          <p className="text-[10px] font-semibold uppercase tracking-[0.06em] text-gray-500">
            Data to come
          </p>
          <ul className="flex flex-wrap gap-1.5">
            {dataToCome.map((country) => (
              <li
                key={country}
                className="rounded-full border border-dashed border-gray-300 bg-gray-50 px-2.5 py-1.5 text-[12px] font-medium text-gray-400"
              >
                {country}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
