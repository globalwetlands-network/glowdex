import { useEffect, useState } from 'react';

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
}

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
async function loadAllData(): Promise<Omit<ScientificData, 'isLoading'>> {
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
 * @remarks On error, loading state is set to false to prevent UI hanging.
 *          Error details are logged to console.
 * 
 * ```
 */
export function useScientificData(): ScientificData {
  const [data, setData] = useState<ScientificData>({
    isLoading: true,
    gridCells: [],
    typologies: null,
    geojson: null,
  });

  useEffect(() => {
    /** Loads all scientific data asynchronously */
    async function load() {
      try {
        console.time('DataLoad');

        const loadedData = await loadAllData();

        console.timeEnd('DataLoad');
        console.log(`Loaded ${loadedData.gridCells.length} grid cells`);

        setData({
          isLoading: false,
          ...loadedData,
        });
      } catch (error) {
        console.error('Failed to load scientific data:', error);

        // Stop loading state to prevent UI from hanging indefinitely
        setData(prev => ({ ...prev, isLoading: false }));
      }
    }

    load();
  }, []); // Empty dependency array: load only once on mount

  return data;
}
