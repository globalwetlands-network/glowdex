import { useMemo, type ReactNode } from 'react';

// Hooks
import { useIndicators } from '@/data/hooks/useIndicators';
import { useScientificData } from '@/data/hooks/useScientificData';
import { useLocalWetlands } from '@/data/hooks/useLocalWetlands';

// Context
import { DataContext, type DataContextValue } from './DataContext';

export function DataProvider({ children }: { children: ReactNode }) {
  const scienceData = useScientificData();
  const indicatorData = useIndicators();
  const localData = useLocalWetlands();

  const value = useMemo<DataContextValue>(() => {
    const isLoading =
      scienceData.isLoading || indicatorData.isLoading || localData.isLoading;
    // Error reflects indicatorData only — useScientificData
    // and useLocalWetlands swallow errors internally.
    // See DataContext.tsx error field comment for context.
    const error = indicatorData.error;

    return {
      gridCells: scienceData.gridCells,
      typologies: scienceData.typologies,
      geojson: scienceData.geojson,
      indicators: indicatorData.indicators,
      dimensions: indicatorData.dimensions,
      localSites: localData.localSites,
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
    indicatorData.error,
    localData.localSites,
    localData.isLoading,
  ]);

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}
