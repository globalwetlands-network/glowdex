
import { useMemo, type ReactNode } from 'react';

// Hooks
import { useIndicators } from '@/data/hooks/useIndicators';
import { useScientificData } from '@/data/hooks/useScientificData';

// Context
import { DataContext, type DataContextValue } from './DataContext';

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
