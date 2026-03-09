import { Habitat } from '@/types/enums/habitat.enum';

export interface Indicator {
  key: string;
  label: string;
  dimension: string;
  habitat: Habitat | 'all';
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
