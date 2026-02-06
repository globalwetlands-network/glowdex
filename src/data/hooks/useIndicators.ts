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

    return (indicatorRaw as unknown as Array<Record<string, unknown>>).map(i => ({
      key: i.indicator as string,
      label: i.label as string,
      dimension: i.dimension as string,
      habitat: habitatMap[i.habitat as string] || 'all',
      direction: i.direction as 1 | -1,
      description: i.description as string
    })) as Indicator[];
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
