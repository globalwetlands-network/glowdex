
import { fetchAsset } from '@/utils/fetchUtils';
import type { Indicator, HabitatId } from '@/features/widgets/types/indicator.types';

// Types for raw JSON structure
interface IndicatorRaw {
  indicator: string;
  label: string;
  dimension: string;
  habitat: string;
  direction: number;
  description: string;
}

const HABITAT_MAP: Record<string, HabitatId | 'all'> = {
  mg: 'mangroves',
  sm: 'saltmarsh',
  sg: 'seagrass',
  all: 'all'
};

const HABITAT_PREFIX_MAP: Record<string, string> = {
  mg: 'Mangrove',
  sm: 'Saltmarsh',
  sg: 'Seagrass',
  all: ''
};

/**
 * Transforms raw indicator data into typed Indicator objects
 * Adds habitat prefixes to labels (e.g., "Fish density" -> "Mangrove Fish density")
 */
function transformIndicators(raw: IndicatorRaw[]): Indicator[] {
  return raw.map(i => {
    const habitatKey = i.habitat;
    const habitatLabel = HABITAT_MAP[habitatKey] || 'all';
    const prefix = HABITAT_PREFIX_MAP[habitatKey] || '';
    const rawLabel = i.label;
    const label = prefix ? `${prefix} ${rawLabel}` : rawLabel;

    return {
      key: i.indicator,
      label,
      dimension: i.dimension,
      habitat: habitatLabel,
      direction: i.direction as 1 | -1,
      description: i.description
    };
  });
}

/**
 * Loads indicator definitions and metadata
 * 
 * Fetches from /data/indicator-labels.json
 * Applies transformation to normalize habitat labels and prefixes.
 * 
 * @returns Promise resolving to array of Indicator objects
 */
export async function loadIndicators(): Promise<Indicator[]> {
  const response = await fetchAsset('data/indicator-labels.json');
  if (!response.ok) {
    throw new Error(`Failed to load indicators: ${response.statusText}`);
  }
  const raw = await response.json() as IndicatorRaw[];
  return transformIndicators(raw);
}
