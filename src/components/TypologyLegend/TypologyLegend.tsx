import type { TypologyMap } from '@/data/types/cluster.types';
import { TYPOLOGY_5_INFO } from '@/data/constants/typology.constants';

interface TypologyLegendProps {
  typologies: TypologyMap;
  currentScale: 'scale5' | 'scale18';
  activeClusterId?: number;
}

export function TypologyLegend({
  typologies,
  currentScale,
  activeClusterId,
}: TypologyLegendProps) {
  if (currentScale === 'scale18') {
    return (
      <p className="text-xs text-gray-400 italic leading-relaxed">
        18-typology descriptions are available in the source paper ·{' '}
        <a
          href="https://doi.org/10.1016/j.ecolind.2021.108141"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#0f6e56] hover:text-[#085041] underline"
        >
          Sievers et al. (2021)
        </a>
      </p>
    );
  }

  const clusters = Object.values(typologies[currentScale]).sort(
    (a, b) => a.id - b.id,
  );

  return (
    <div className="space-y-2">
      {clusters.map((cluster) => {
        const info = TYPOLOGY_5_INFO[cluster.id];
        const isActive = cluster.id === activeClusterId;

        return (
          <div
            key={cluster.id}
            className={`relative group flex items-center gap-2 rounded-md px-2 py-1.5 transition-colors cursor-help ${
              isActive ? 'bg-gray-50 ring-1 ring-gray-200' : 'hover:bg-gray-50'
            }`}
          >
            <div
              className="w-3 h-3 rounded-sm shrink-0 border border-black/10"
              style={{ backgroundColor: cluster.color }}
            />
            <span
              className={`text-xs leading-snug ${
                isActive ? 'font-semibold text-gray-900' : 'text-gray-600'
              }`}
            >
              {cluster.name}
              {info && ` — ${info.name}`}
            </span>
            {info && (
              <div
                role="tooltip"
                className="absolute left-0 top-full mt-1 z-50 w-64 p-2 bg-gray-900 text-white text-[10px] leading-relaxed rounded shadow-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-normal"
              >
                <p className="font-semibold">
                  Typology {cluster.id} — {info.name}
                </p>
                <p className="mt-0.5 text-white/80">{info.description}</p>
              </div>
            )}
          </div>
        );
      })}
      <p className="text-[10px] text-gray-400 pt-1 leading-relaxed border-t border-gray-100">
        Colours show typology classification, not ecological condition.
      </p>
    </div>
  );
}
