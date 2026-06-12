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
  isLoading: boolean;
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
