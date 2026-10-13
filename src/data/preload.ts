/**
 * Shared, memoised dataset loads.
 *
 * The data hooks (`useScientificData`, `useIndicators`, `useLocalWetlands`) read
 * through these caches instead of loading directly, so:
 * - the landing page can start the loads in the background (`preloadMapData`)
 *   and `/map` picks up the in-flight or finished result instead of refetching;
 * - remounting the map (e.g. Home → map again) reuses the loaded data.
 *
 * A failed load clears its entry so the next call retries, mirroring
 * `resolveManifest` in `store/datasetClient.ts`. The hooks' `reload()` clears
 * the entry explicitly so the retry flow always refetches.
 */
import type { Indicator } from '@/features/widgets/types/indicator.types';
import { loadAllClusters } from './loaders/loadAllClusters';
import { loadGridGeoJson } from './loaders/loadGridGeojson';
import { loadGridItems } from './loaders/loadGridItems';
import { loadIndicators } from './loaders/loadIndicators';
import {
  loadLocalMeta,
  loadLocalObservations,
  loadLocalSites,
} from './loaders/loadLocalWetlands';
import { loadResiduals } from './loaders/loadResiduals';
import { deriveLocalWetlands } from './transforms/deriveLocalWetlands';
import { deriveTypologies } from './transforms/deriveTypologies';
import { joinGridData } from './transforms/joinGridWithClusters';
import type { TypologyMap } from './types/cluster.types';
import type { GridGeoJSON } from './types/geo.types';
import type { RichGridCell } from './types/grid.types';
import type { LocalSite } from './types/local-wetlands.types';

/** Processed scientific dataset (grid cells joined with clusters, typologies, geometry). */
export interface ScientificDataset {
  gridCells: RichGridCell[];
  typologies: TypologyMap | null;
  geojson: GridGeoJSON | null;
}

/** Processed local monitoring data. */
export interface LocalWetlandsDataset {
  localSites: LocalSite[];
  /** ISO date the local data was last refreshed, or null if unavailable. */
  localDataUpdated: string | null;
}

export interface CachedLoader<T> {
  /** Resolves the value, starting the load only if none is in flight or cached. */
  get: () => Promise<T>;
  /** The resolved value if the load has already finished, else undefined. */
  peek: () => T | undefined;
  /** Drops the cached value/promise so the next `get` refetches. */
  clear: () => void;
}

/** Wraps a loader so concurrent and repeat callers share a single load. */
export function createCachedLoader<T>(load: () => Promise<T>): CachedLoader<T> {
  let promise: Promise<T> | null = null;
  let value: T | undefined;

  return {
    get() {
      if (!promise) {
        const current = load().then(
          (result) => {
            // Ignore a load that was cleared while in flight.
            if (promise === current) value = result;
            return result;
          },
          (error: unknown) => {
            if (promise === current) promise = null;
            throw error;
          },
        );
        promise = current;
      }
      return promise;
    },
    peek: () => value,
    clear() {
      promise = null;
      value = undefined;
    },
  };
}

/**
 * Fetches all scientific data sources in parallel, then derives typologies and
 * joins grid items with clusters and residuals.
 */
async function loadScientificData(): Promise<ScientificDataset> {
  const [gridItems, residuals, rawClusters, geojson] = await Promise.all([
    loadGridItems(),
    loadResiduals(),
    loadAllClusters(),
    loadGridGeoJson(),
  ]);

  return {
    gridCells: joinGridData(gridItems, residuals, rawClusters),
    typologies: deriveTypologies(rawClusters),
    geojson,
  };
}

/** Fetches the local sites/observations CSVs and meta, deriving typed sites. */
async function loadLocalWetlandsData(): Promise<LocalWetlandsDataset> {
  const [siteRows, obsRows, meta] = await Promise.all([
    loadLocalSites(),
    loadLocalObservations(),
    loadLocalMeta(),
  ]);
  return {
    localSites: deriveLocalWetlands(siteRows, obsRows),
    localDataUpdated: meta?.updated ?? null,
  };
}

export const scientificDataCache = createCachedLoader(loadScientificData);
export const indicatorsCache = createCachedLoader<Indicator[]>(loadIndicators);
export const localWetlandsCache = createCachedLoader(loadLocalWetlandsData);

/**
 * Starts every map dataset load in the background. Errors are swallowed here —
 * the failed entry is cleared, so the hooks retry (and surface the error) when
 * the map mounts.
 */
export function preloadMapData(): void {
  for (const cache of [
    scientificDataCache,
    indicatorsCache,
    localWetlandsCache,
  ]) {
    cache.get().catch(() => {});
  }
}
