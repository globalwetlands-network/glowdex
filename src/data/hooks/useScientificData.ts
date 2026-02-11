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

interface ScientificData {
  isLoading: boolean;
  gridCells: RichGridCell[];
  typologies: TypologyMap | null;
  geojson: GridGeoJSON | null;
}

/**
 * Loads all scientific data (grid cells, residuals, clusters, GeoJSON)
 * Performs data transformations and joins
 */
async function loadAllData(): Promise<Omit<ScientificData, 'isLoading'>> {
  // Loaders are synchronous (using Vite's ?raw import)
  // This ensures deterministic build-time data loading
  const gridItems = loadGridItems();
  const residuals = loadResiduals();
  const rawClusters = loadAllClusters();
  const geojson = loadGridGeoJson();

  // Transform and join data
  const typologies = deriveTypologies(rawClusters);
  const gridCells = joinGridData(gridItems, residuals, rawClusters);

  return {
    gridCells,
    typologies,
    geojson,
  };
}

/**
 * Hook to load and manage all scientific data for the application
 * Loads grid cells, residuals, typologies, and GeoJSON on mount
 */
export function useScientificData(): ScientificData {
  const [data, setData] = useState<ScientificData>({
    isLoading: true,
    gridCells: [],
    typologies: null,
    geojson: null,
  });

  useEffect(() => {
    // eslint-disable-next-line jsdoc/require-jsdoc
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
        console.error('Failed to load scientific data', error);
        // Stop loading state so UI doesn't hang
        setData(prev => ({ ...prev, isLoading: false }));
      }
    }

    load();
  }, []);

  return data;
}
