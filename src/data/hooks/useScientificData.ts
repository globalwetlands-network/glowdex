import { useCallback, useEffect, useState } from 'react';

import type { GridGeoJSON } from '../types/geo.types';
import type { RichGridCell } from '../types/grid.types';
import type { TypologyMap } from '../types/cluster.types';
import { scientificDataCache } from '../preload';

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
  // Start from the shared cache when the landing page (or an earlier mount)
  // already loaded the dataset, so the map skips LoadingState entirely.
  const [data, setData] = useState<ScientificDataState>(() => {
    const cached = scientificDataCache.peek();
    return cached
      ? { isLoading: false, error: null, ...cached }
      : {
          isLoading: true,
          gridCells: [],
          typologies: null,
          geojson: null,
          error: null,
        };
  });

  const reload = useCallback(() => {
    scientificDataCache.clear();
    setData((prev) => ({ ...prev, isLoading: true, error: null }));
    setReloadIndex((index) => index + 1);
  }, []);

  useEffect(() => {
    // Guard against overlapping loads: if reload() re-runs this effect (or the
    // hook unmounts) while a load is in flight, ignore the stale result so an
    // older request can't win the race and overwrite newer state.
    let cancelled = false;

    /** Loads all scientific data asynchronously */
    async function load() {
      try {
        const timerLabel = `DataLoad-${Date.now()}`;
        console.time(timerLabel);

        const loadedData = await scientificDataCache.get();

        console.timeEnd(timerLabel);
        console.log(`Loaded ${loadedData.gridCells.length} grid cells`);

        if (cancelled) return;
        setData((prev) => ({
          ...prev,
          isLoading: false,
          error: null,
          ...loadedData,
        }));
      } catch (error) {
        console.error('Failed to load scientific data:', error);

        if (cancelled) return;
        // Surface the error so the app can show a retryable error state.
        setData((prev) => ({
          ...prev,
          isLoading: false,
          error: error instanceof Error ? error : new Error('Unknown error'),
        }));
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [reloadIndex]); // Reload when reload() bumps the index

  return { ...data, reload };
}
