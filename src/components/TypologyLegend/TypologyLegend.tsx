import type { TypologyMap } from '@/data/types/cluster.types';

const TYPOLOGY_5_LABELS: Record<number, string> = {
  1: 'The Catchall',
  2: 'High Land and Marine Impacts',
  3: 'High Climate Impacts',
  4: 'Low Climate Impact Increase, High Mangrove Species Threat',
  5: 'The High-Functioning Refuge',
};

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
      <p className="text-xs text-gray-400 italic">
        Detailed typology labels coming soon.
      </p>
    );
  }

  const clusters = Object.values(typologies.scale5).sort((a, b) => a.id - b.id);

  return (
    <div className="space-y-2">
      {clusters.map((cluster) => {
        const label = TYPOLOGY_5_LABELS[cluster.id] ?? cluster.name;
        const isActive = cluster.id === activeClusterId;

        return (
          <div
            key={cluster.id}
            className={`flex items-center gap-2 rounded-md px-2 py-1.5 transition-colors ${
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
              {label}
            </span>
          </div>
        );
      })}
      <p className="text-[10px] text-gray-400 pt-1 leading-relaxed border-t border-gray-100">
        Colours show typology classification, not ecological condition.
      </p>
    </div>
  );
}
