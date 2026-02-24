export type HabitatId = 'mangroves' | 'saltmarsh' | 'seagrass';

export interface Indicator {
  key: string;
  label: string;
  dimension: string;
  habitat: HabitatId | 'all';
  direction: 1 | -1;
  description?: string;
}

export interface IndicatorDimension {
  name: string;
  indicators: Indicator[];
}

export interface IndicatorDistribution {
  indicator: Indicator;
  values: number[];
  selectedValue?: number;
}

export type DistributionsByDimension = Record<string, IndicatorDistribution[]>;
