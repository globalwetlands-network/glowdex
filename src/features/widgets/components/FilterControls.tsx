import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import type { FilterState } from '../types/filter.types';
import type { TypologyMap } from '@/data/types/cluster.types';
import { TypologyLegend } from '@/components/TypologyLegend';
import { TYPOLOGY_5_INFO } from '@/data/constants/typology.constants';

interface FilterControlsProps {
  filterState: FilterState;
  onFilterChange: (newState: FilterState) => void;
  typologies: TypologyMap;
}

export function FilterControls({
  filterState,
  onFilterChange,
  typologies,
}: FilterControlsProps) {
  const [explainerOpen, setExplainerOpen] = useState(false);

  const setScale = (scale: 'scale5' | 'scale18') => {
    onFilterChange({
      ...filterState,
      typologyScale: scale,
    });
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm space-y-6">
      {/* Typology Scale Switch */}
      <div className="space-y-3">
        <label
          className="text-xs font-semibold text-gray-400 uppercase tracking-wider cursor-help"
          title="Switch between 5 broad typologies or 18 detailed classifications"
        >
          Typology Scale
        </label>
        <div className="flex bg-gray-100 p-1 rounded-md">
          <button
            onClick={() => setScale('scale5')}
            title="View 5 broad habitat typologies"
            className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all ${
              filterState.typologyScale === 'scale5'
                ? 'bg-white shadow text-gray-900'
                : 'text-gray-500 hover:text-gray-900 hover:bg-gray-200/50'
            }`}
          >
            5 Typologies
          </button>
          <button
            onClick={() => setScale('scale18')}
            title="View 18 detailed habitat typologies"
            className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all ${
              filterState.typologyScale === 'scale18'
                ? 'bg-white shadow text-gray-900'
                : 'text-gray-500 hover:text-gray-900 hover:bg-gray-200/50'
            }`}
          >
            18 Typologies
          </button>
        </div>

        {/* What are typologies? collapsible */}
        <div className="border border-gray-100 rounded-md overflow-hidden">
          <button
            type="button"
            onClick={() => setExplainerOpen(!explainerOpen)}
            className="flex items-center justify-between w-full px-3 py-2 text-xs font-medium text-[#0f6e56] hover:bg-gray-50 transition-colors"
          >
            What are typologies?
            {explainerOpen ? (
              <ChevronUp size={12} className="shrink-0" />
            ) : (
              <ChevronDown size={12} className="shrink-0" />
            )}
          </button>

          {explainerOpen && (
            <div className="px-3 pb-3 space-y-4 text-xs text-gray-600 leading-relaxed border-t border-gray-100">
              <p className="pt-3">
                Typologies group coastal wetland grid cells by shared ecological
                characteristics — including habitat condition, species profiles,
                and cumulative pressures from land, marine, and climate sources.
                All indicator values in GLOWdex are interpreted relative to
                other cells in the same typology, not as global absolutes.
              </p>

              <div className="space-y-1 border-t border-gray-100 pt-3">
                <p className="font-medium text-gray-700">
                  Two scales are available:
                </p>
                <ul className="space-y-0.5 pl-3">
                  <li>· Scale of 5 — broad global patterns</li>
                  <li>· Scale of 18 — finer regional distinctions</li>
                </ul>
              </div>

              <div className="space-y-2 border-t border-gray-100 pt-3">
                <p className="font-medium text-gray-700">
                  5-Typology descriptions (Sievers et al. 2021):
                </p>
                <ul className="space-y-2">
                  {[1, 2, 3, 4, 5].map((n) => {
                    const info = TYPOLOGY_5_INFO[n];
                    const color = typologies.scale5[n]?.color;
                    return (
                      <li key={n} className="flex items-start gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-sm shrink-0 border border-black/10 mt-0.5"
                          style={{ backgroundColor: color }}
                        />
                        <span>
                          <span className="font-medium">Typology {n}</span>
                          {' — '}
                          {info?.description}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </div>

              <p className="border-t border-gray-100 pt-3">
                For the 18-typology scale, full typology descriptions are
                available in the source paper.
              </p>

              <div className="bg-amber-50 border border-amber-100 rounded-md p-2.5 italic text-gray-600">
                Note: The current typologies were derived from a model
                encompassing mangroves, saltmarsh, and seagrass ecosystems
                globally. GLOWdex currently displays mangrove indicators only. A
                mangrove-specific typology analysis is planned for a future
                release.
              </div>

              <p>
                Source: Sievers et al. (2021) <em>Ecological Indicators</em>{' '}
                131:108141
                <br />
                <a
                  href="https://doi.org/10.1016/j.ecolind.2021.108141"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#0f6e56] hover:text-[#085041] underline break-all"
                >
                  https://doi.org/10.1016/j.ecolind.2021.108141
                </a>
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Typology guide — only shown for scale5; scale18 note is inside TypologyLegend */}
      {filterState.typologyScale === 'scale5' && (
        <div className="space-y-1.5">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Typology Guide
          </p>
          <TypologyLegend
            typologies={typologies}
            currentScale={filterState.typologyScale}
          />
        </div>
      )}
    </div>
  );
}
