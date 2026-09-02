import { createContext, useContext } from 'react';
import type { TypologyMap } from '@/data/types/cluster.types';
import type { GridGeoJSON } from '@/data/types/geo.types';
import type { RichGridCell } from '@/data/types/grid.types';
import type { LocalSite } from '@/data/types/local-wetlands.types';
import type {
  Indicator,
  IndicatorDimension,
} from '@/features/widgets/types/indicator.types';

export interface DataContextValue {
  gridCells: RichGridCell[];
  typologies: TypologyMap | null;
  geojson: GridGeoJSON | null;
  indicators: Indicator[];
  dimensions: IndicatorDimension[];
  localSites: LocalSite[];
  /** ISO date local data was last refreshed, or null if unavailable. */
  localDataUpdated: string | null;
  isLoading: boolean;
  /**
   * Error from indicatorData only. useScientificData and
   * useLocalWetlands handle errors internally by logging
   * and returning empty state. If uniform error surfacing
   * is needed post-conference, expose errors from all three
   * hooks here.
   */
  error: Error | null;
}

export const DataContext = createContext<DataContextValue | undefined>(
  undefined,
);

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
