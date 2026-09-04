import { useCallback, useEffect, useState } from 'react';

import type { GridGeoJSON } from '../types/geo.types';
import type { RichGridCell } from '../types/grid.types';
import type { TypologyMap } from '../types/cluster.types';
import { loadAllClusters } from '../loaders/loadAllClusters';
import { loadGridGeoJson } from '../loaders/loadGridGeojson';
import { loadGridItems } from '../loaders/loadGridItems';
import { loadResiduals } from '../loaders/loadResiduals';
import { deriveTypologies } from '../transforms/deriveTypologies';
import { joinGridData } from '../transforms/joinGridWithClusters';

/**
 * Complete scientific dataset for the application
 */
interface ScientificData {
  isLoading: boolean;
  gridCells: RichGridCell[];
  typologies: TypologyMap | null;
  geojson: GridGeoJSON | null;
  /**
   * Load failure, or null when loading/loaded. Scientific data is critical:
   * unlike local data we surface this so the app can show an error state with
   * retry rather than a blank map.
   */
  error: Error | null;
  /** Re-attempts the load (used by the retry flow after resetting the manifest). */
  reload: () => void;
}

/** Internal state shape — the returned `reload` is merged in by the hook. */
type ScientificDataState = Omit<ScientificData, 'reload'>;

/**
 * Loads and processes all scientific data for the application
 *
 * Orchestrates the complete data loading pipeline:
 * 1. Fetches raw data from static assets (CSV/GeoJSON)
 * 2. Derives typology cluster definitions
 * 3. Joins grid items with clusters and residuals
 *
 * @returns Promise resolving to complete scientific dataset
 *
 * @remarks Fetches data in parallel to minimize load time.
 *
 * @throws Error if any data loading or transformation fails
 *
 */
async function loadAllData(): Promise<
  Omit<ScientificData, 'isLoading' | 'error' | 'reload'>
> {
  // Load all raw data sources in parallel
  const [gridItems, residuals, rawClusters, geojson] = await Promise.all([
    loadGridItems(),
    loadResiduals(),
    loadAllClusters(),
    loadGridGeoJson(),
  ]);

  // Transform and join data into usable structures
  const typologies = deriveTypologies(rawClusters);
  const gridCells = joinGridData(gridItems, residuals, rawClusters);

  return {
    gridCells,
    typologies,
    geojson,
  };
}

/**
 * React hook to load and manage all scientific data for the application
 *
 * Loads the complete dataset on component mount:
 * - Grid cell metadata (country, ISO codes)
 * - Indicator residual values
 * - Typology cluster assignments (5-scale and 18-scale)
 * - GeoJSON geometries for map visualization
 * - Habitat presence flags (mangroves, saltmarsh, seagrass)
 *
 * @returns Scientific data object with loading state
 *
 * @remarks Data loading is logged to console with timing information.
 *          Check browser console for load time and cell count.
 *
 * @remarks On error the error is surfaced (not swallowed) so the app can render
 *          a full-screen error state with retry. Call `reload()` to re-attempt.
 *
 * ```
 */
export function useScientificData(): ScientificData {
  const [reloadIndex, setReloadIndex] = useState(0);
  const [data, setData] = useState<ScientificDataState>({
    isLoading: true,
    gridCells: [],
    typologies: null,
    geojson: null,
    error: null,
  });

  const reload = useCallback(() => {
    setData((prev) => ({ ...prev, isLoading: true, error: null }));
    setReloadIndex((index) => index + 1);
  }, []);

  useEffect(() => {
    /** Loads all scientific data asynchronously */
    async function load() {
      try {
        const timerLabel = `DataLoad-${Date.now()}`;
        console.time(timerLabel);

        const loadedData = await loadAllData();

        console.timeEnd(timerLabel);
        console.log(`Loaded ${loadedData.gridCells.length} grid cells`);

        setData((prev) => ({
          ...prev,
          isLoading: false,
          error: null,
          ...loadedData,
        }));
      } catch (error) {
        console.error('Failed to load scientific data:', error);

        // Surface the error so the app can show a retryable error state.
        setData((prev) => ({
          ...prev,
          isLoading: false,
          error: error instanceof Error ? error : new Error('Unknown error'),
        }));
      }
    }

    load();
  }, [reloadIndex]); // Reload when reload() bumps the index

  return { ...data, reload };
}
