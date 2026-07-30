import { useId } from 'react';
import { BarChart2 } from 'lucide-react';
import { usePostHog } from 'posthog-js/react';
import type { EnrichedGridCell } from '@/app/types/app.types';
import type { TypologyMap } from '@/data/types/cluster.types';
import { TYPOLOGY_5_INFO } from '@/data/constants/typology.constants';

interface TileCapsuleProps {
  selectedCell: EnrichedGridCell;
  typologies: TypologyMap;
  currentScale: 'scale5' | 'scale18';
  onNavigateToAnalysis: () => void;
  source: 'partner' | 'species';
  currentTab?: string;
}

export function TileCapsule({
  selectedCell,
  typologies,
  currentScale,
  onNavigateToAnalysis,
  source,
  currentTab = 'biodiversity',
}: TileCapsuleProps) {
  const posthog = usePostHog();
  const tooltipId = useId();

  const clusterId =
    (currentScale === 'scale5'
      ? selectedCell.cluster5
      : selectedCell.cluster18) ?? undefined;

  if (clusterId === undefined) return null;

  const typologyColor = typologies[currentScale]?.[clusterId]?.color;
  const typologyInfo =
    currentScale === 'scale5' ? TYPOLOGY_5_INFO[clusterId] : null;

  return (
    <div className="relative group/tile-tip inline-block">
      <button
        type="button"
        aria-describedby={tooltipId}
        onClick={() => {
          try {
            posthog?.capture(`${source}_tile_capsule_clicked`, {
              cell_id: selectedCell.id ? String(selectedCell.id) : null,
              cluster_id: clusterId ?? null,
              country: selectedCell.country ?? null,
              current_tab: currentTab,
            });
          } catch (error) {
            console.error(
              `Failed to capture ${source}_tile_capsule_clicked event:`,
              error,
            );
          }
          onNavigateToAnalysis();
        }}
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-teal-50 border border-teal-200 text-xs font-semibold text-teal-800 hover:bg-teal-100 hover:border-teal-300 transition-colors cursor-pointer"
      >
        <span>Tile {selectedCell.id}</span>
        {selectedCell.country && (
          <>
            <span className="text-gray-400">·</span>
            <span>{selectedCell.country}</span>
          </>
        )}
        {typologyColor && (
          <>
            <span className="text-gray-400">·</span>
            <span
              className="w-2.5 h-2.5 rounded-sm shrink-0 border border-black/10"
              style={{ backgroundColor: typologyColor }}
            />
          </>
        )}
        <span>{clusterId}</span>
        <BarChart2 size={10} className="shrink-0" />
      </button>
      <div
        id={tooltipId}
        role="tooltip"
        className="absolute left-0 top-full mt-1 z-50 w-64 p-2 bg-gray-900 text-white text-[10px] leading-relaxed rounded shadow-lg opacity-0 group-hover/tile-tip:opacity-100 group-focus-within/tile-tip:opacity-100 pointer-events-none transition-opacity whitespace-normal"
      >
        {typologyInfo ? (
          <>
            <p className="font-semibold">
              Typology {clusterId} — {typologyInfo.name}
            </p>
            <p className="mt-0.5 text-white/80">{typologyInfo.description}</p>
          </>
        ) : (
          <p>
            Typology {clusterId}
            {currentScale === 'scale18' &&
              ' — see Sievers et al. (2021) for full descriptions'}
          </p>
        )}
        <p className="mt-1 text-white/60">Click to view full tile analysis</p>
      </div>
    </div>
  );
}
