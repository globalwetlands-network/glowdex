/**
 * Loads and processes local wetlands monitoring data.
 * Follows the same pattern as useScientificData — loads
 * once on mount, exposes isLoading state.
 *
 * Loads three sources in parallel: the sites CSV (coordinates),
 * the observations CSV (density/partner), and the meta JSON
 * (last-refreshed date). Gracefully handles missing/failed data
 * by returning empty sites and a null date so the app never
 * breaks on absent local data.
 */

import { useEffect, useState } from 'react';
import {
  loadLocalSites,
  loadLocalObservations,
  loadLocalMeta,
} from '../loaders/loadLocalWetlands';
import { deriveLocalWetlands } from '../transforms/deriveLocalWetlands';
import type { LocalSite } from '../types/local-wetlands.types';

interface LocalWetlandsData {
  isLoading: boolean;
  localSites: LocalSite[];
  /** ISO date the local data was last refreshed, or null if unavailable. */
  localDataUpdated: string | null;
}

/** Loads and processes local wetlands monitoring data, returning typed sites. */
export function useLocalWetlands(): LocalWetlandsData {
  const [data, setData] = useState<LocalWetlandsData>({
    isLoading: true,
    localSites: [],
    localDataUpdated: null,
  });

  useEffect(() => {
    /** Fetches both CSVs + meta and derives typed LocalSite objects. */
    async function load() {
      try {
        const [siteRows, obsRows, meta] = await Promise.all([
          loadLocalSites(),
          loadLocalObservations(),
          loadLocalMeta(),
        ]);
        const localSites = deriveLocalWetlands(siteRows, obsRows);
        setData({
          isLoading: false,
          localSites,
          localDataUpdated: meta?.updated ?? null,
        });
      } catch (error) {
        console.error('Failed to load local wetlands data:', error);
        setData({ isLoading: false, localSites: [], localDataUpdated: null });
      }
    }
    load();
  }, []);

  return data;
}
