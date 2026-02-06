import { useMemo } from 'react';
import indicatorRaw from '@/data/raw/indicator-labels.json';
import type { Indicator, IndicatorDimension } from '@/features/widgets/types/indicator.types';

export function useIndicators() {
  const indicators: Indicator[] = useMemo(() => {
    const habitatMap: Record<string, 'mangroves' | 'saltmarsh' | 'seagrass'> = {
      mg: 'mangroves',
      sm: 'saltmarsh',
      sg: 'seagrass'
    };

    return (indicatorRaw as unknown as Array<Record<string, unknown>>).map(i => {
      const habitatKey = i.habitat as string;
      const habitatLabel = habitatMap[habitatKey] || 'all';

      // Prefix label with habitat if not 'all'
      // Example: "Fish density" -> "Mangroves Fish density"? 
      // User requested: "Mangrove fish density".
      // habitatMap values are 'mangroves', 'saltmarsh', 'seagrass'.
      // We should capitalize first letter: "Mangroves" vs "Mangrove"?
      // Legacy example: "Mangrove fish density". 
      // So singular "Mangrove" might be better? 
      // check habitatMap: 'mangroves', 'saltmarsh', 'seagrass'.
      // Let's use a display dictionary for prefixes to be safe and match legacy exactly.

      const prefixMap: Record<string, string> = {
        mg: 'Mangrove',
        sm: 'Saltmarsh',
        sg: 'Seagrass',
        all: ''
      };

      const prefix = prefixMap[habitatKey] || '';
      const rawLabel = i.label as string;
      // If prefix exists, prepend it.
      const label = prefix ? `${prefix} ${rawLabel}` : rawLabel;

      return {
        key: i.indicator as string,
        label,
        dimension: i.dimension as string,
        habitat: habitatLabel,
        direction: i.direction as 1 | -1,
        description: i.description as string
      };
    }) as Indicator[];
  }, []);

  const dimensions: IndicatorDimension[] = useMemo(() => {
    const groups: Record<string, Indicator[]> = {};

    indicators.forEach(ind => {
      if (!groups[ind.dimension]) {
        groups[ind.dimension] = [];
      }
      groups[ind.dimension].push(ind);
    });

    return Object.entries(groups).map(([name, inds]) => ({
      name,
      indicators: inds
    }));
  }, [indicators]);

  return { indicators, dimensions };
}
