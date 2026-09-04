import { useCallback, useMemo, type ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';

// Hooks
import { useIndicators } from '@/data/hooks/useIndicators';
import { useScientificData } from '@/data/hooks/useScientificData';
import { useLocalWetlands } from '@/data/hooks/useLocalWetlands';
import {
  useDatasetVersion,
  DATASET_VERSION_QUERY_KEY,
} from '@/data/hooks/useDatasetVersion';

// Store
import { datasetClient } from '@/data/store/datasetClient';

// Context
import { DataContext, type DataContextValue } from './DataContext';

export function DataProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const scienceData = useScientificData();
  const indicatorData = useIndicators();
  const localData = useLocalWetlands();
  const datasetVersion = useDatasetVersion();

  const { reload: reloadScience } = scienceData;
  const { reload: reloadIndicators } = indicatorData;

  // Clear the cached manifest promise so a retry re-resolves from the store,
  // re-run the critical loaders, and invalidate the version queries so the
  // badge and skew check pick up the freshly-resolved manifest and backend
  // version instead of the stale ones. Local data is non-critical, left as-is.
  const retry = useCallback(() => {
    datasetClient.resetManifest();
    queryClient.invalidateQueries({ queryKey: DATASET_VERSION_QUERY_KEY });
    queryClient.invalidateQueries({ queryKey: ['meta', 'dataset'] });
    reloadScience();
    reloadIndicators();
  }, [queryClient, reloadScience, reloadIndicators]);

  const value = useMemo<DataContextValue>(() => {
    const isLoading =
      scienceData.isLoading || indicatorData.isLoading || localData.isLoading;
    // Critical loaders only — local data stays graceful and never errors the app.
    const error = scienceData.error ?? indicatorData.error;

    return {
      gridCells: scienceData.gridCells,
      typologies: scienceData.typologies,
      geojson: scienceData.geojson,
      indicators: indicatorData.indicators,
      dimensions: indicatorData.dimensions,
      localSites: localData.localSites,
      localDataUpdated: localData.localDataUpdated,
      datasetVersion,
      isLoading,
      error,
      retry,
    };
  }, [
    scienceData.gridCells,
    scienceData.typologies,
    scienceData.geojson,
    scienceData.isLoading,
    scienceData.error,
    indicatorData.indicators,
    indicatorData.dimensions,
    indicatorData.isLoading,
    indicatorData.error,
    localData.localSites,
    localData.localDataUpdated,
    localData.isLoading,
    datasetVersion,
    retry,
  ]);

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}
