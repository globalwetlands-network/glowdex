
import { createContext, useContext, useMemo, type ReactNode } from 'react';

// Hooks
import { useIndicators } from '@/data/hooks/useIndicators';
import { useScientificData } from '@/data/hooks/useScientificData';

// Types
import type { TypologyMap } from '@/data/types/cluster.types';
import type { GridGeoJSON } from '@/data/types/geo.types';
import type { RichGridCell } from '@/data/types/grid.types';
import type { Indicator, IndicatorDimension } from '@/features/widgets/types/indicator.types';

interface DataContextValue {
  gridCells: RichGridCell[];
  typologies: TypologyMap | null;
  geojson: GridGeoJSON | null;
  indicators: Indicator[];
  dimensions: IndicatorDimension[];
  isLoading: boolean;
  error: Error | null;
}

const DataContext = createContext<DataContextValue | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const scienceData = useScientificData();
  const indicatorData = useIndicators();

  const value = useMemo<DataContextValue>(() => {
    const isLoading = scienceData.isLoading || indicatorData.isLoading;
    const error = indicatorData.error; // useScientificData handles error internally by logging, but we could expose it if modified

    return {
      gridCells: scienceData.gridCells,
      typologies: scienceData.typologies,
      geojson: scienceData.geojson,
      indicators: indicatorData.indicators,
      dimensions: indicatorData.dimensions,
      isLoading,
      error,
    };
  }, [
    scienceData.gridCells,
    scienceData.typologies,
    scienceData.geojson,
    scienceData.isLoading,
    indicatorData.indicators,
    indicatorData.dimensions,
    indicatorData.isLoading,
    indicatorData.error
  ]);

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
