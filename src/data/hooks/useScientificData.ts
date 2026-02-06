import { useState, useEffect } from 'react';
import { loadGridItems } from '../loaders/loadGridItems';
import { loadResiduals } from '../loaders/loadResiduals';
import { loadAllClusters } from '../loaders/loadAllClusters';
import { loadGridGeoJson } from '../loaders/loadGridGeojson';

import { joinGridData } from '../transforms/joinGridWithClusters';
import type { RichGridCell } from '../types/grid.types';
import { deriveTypologies } from '../transforms/deriveTypologies';

import type { GridGeoJSON } from '../types/geo.types';
import type { TypologyMap } from '../types/cluster.types';

interface ScientificData {
  isLoading: boolean;
  gridCells: RichGridCell[];
  typologies: TypologyMap | null;
  geojson: GridGeoJSON | null;
}

export function useScientificData(): ScientificData {
  const [data, setData] = useState<ScientificData>({
    isLoading: true,
    gridCells: [],
    typologies: null,
    geojson: null,
  });

  useEffect(() => {
    async function load() {
      try {
        console.time('DataLoad');

        // NOTE: Loaders are currently synchronous (using Vite's ?raw import).
        // This is intentional for Glow-6 to ensure deterministic build-time data loading.
        const gridItems = loadGridItems();
        const residuals = loadResiduals();
        const rawClusters = loadAllClusters();
        const geojson = loadGridGeoJson();

        // Transforms
        const typologies = deriveTypologies(rawClusters);
        const gridCells = joinGridData(gridItems, residuals, rawClusters);

        console.timeEnd('DataLoad');
        console.log(`Loaded ${gridCells.length} grid cells`);

        setData({
          isLoading: false,
          gridCells,
          typologies,
          geojson,
        });
      } catch (error) {
        console.error('Failed to load scientific data', error);
        // Stop loading state so UI doesn't hang, potentially show empty state
        setData(prev => ({ ...prev, isLoading: false }));
      }
    }

    load();
  }, []);

  return data;
}
