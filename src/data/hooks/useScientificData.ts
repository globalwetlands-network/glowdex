import { useState, useEffect } from 'react';
import { loadGridItems } from '../loaders/loadGridItems';
import { loadResiduals } from '../loaders/loadResiduals';
import { loadAllClusters } from '../loaders/loadAllClusters';
import { loadGridGeoJson } from '../loaders/loadGridGeojson';

import { joinGridData, type RichGridCell } from '../transforms/joinGridWithClusters';
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
      console.time('DataLoad');

      // Parallel load
      // Note: loadGridGeoJson is synchronous (JSON import), others might be async if we needed fetch,
      // but here they are also synchronous CSV parsers. We keep the structure async-ready.
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
    }

    load();
  }, []);

  return data;
}
