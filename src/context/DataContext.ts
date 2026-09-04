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
  /** Frontend's loaded dataset version (store manifest), or null in fallback mode. */
  datasetVersion: string | null;
  isLoading: boolean;
  /**
   * Error from the critical loaders — scientific data and indicators. Either
   * failing means the app cannot render a meaningful map, so the error is
   * surfaced for the full-screen DataUnavailable state. useLocalWetlands is
   * non-critical and stays graceful (never surfaced here).
   */
  error: Error | null;
  /**
   * Re-attempts the critical loads after clearing the cached manifest promise.
   * Wired to the DataUnavailable retry button.
   */
  retry: () => void;
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
