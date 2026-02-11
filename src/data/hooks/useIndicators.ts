import { useMemo } from 'react';

import indicatorRaw from '@/data/raw/indicator-labels.json';

import type { Indicator, IndicatorDimension } from '@/features/widgets/types/indicator.types';

type HabitatKey = 'mg' | 'sm' | 'sg' | 'all';
type HabitatId = 'mangroves' | 'saltmarsh' | 'seagrass' | 'all';

const HABITAT_MAP: Record<HabitatKey, HabitatId> = {
  mg: 'mangroves',
  sm: 'saltmarsh',
  sg: 'seagrass',
  all: 'all'
};

const HABITAT_PREFIX_MAP: Record<HabitatKey, string> = {
  mg: 'Mangrove',
  sm: 'Saltmarsh',
  sg: 'Seagrass',
  all: ''
};

/**
 * Transforms raw indicator data into typed Indicator objects
 * Adds habitat prefixes to labels (e.g., "Fish density" -> "Mangrove Fish density")
 */
function transformIndicators(raw: Array<Record<string, unknown>>): Indicator[] {
  return raw.map(i => {
    const habitatKey = i.habitat as HabitatKey;
    const habitatLabel = HABITAT_MAP[habitatKey] || 'all';
    const prefix = HABITAT_PREFIX_MAP[habitatKey] || '';
    const rawLabel = i.label as string;
    const label = prefix ? `${prefix} ${rawLabel}` : rawLabel;

    return {
      key: i.indicator as string,
      label,
      dimension: i.dimension as string,
      habitat: habitatLabel,
      direction: i.direction as 1 | -1,
      description: i.description as string
    };
  });
}

/**
 * Groups indicators by dimension
 */
function groupByDimension(indicators: Indicator[]): IndicatorDimension[] {
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
}

/**
 * Hook to load and transform indicator metadata
 * Returns flat list of indicators and grouped by dimension
 */
export function useIndicators() {
  const indicators: Indicator[] = useMemo(() => {
    return transformIndicators(indicatorRaw as unknown as Array<Record<string, unknown>>);
  }, []);

  const dimensions: IndicatorDimension[] = useMemo(() => {
    return groupByDimension(indicators);
  }, [indicators]);

  return { indicators, dimensions };
}
