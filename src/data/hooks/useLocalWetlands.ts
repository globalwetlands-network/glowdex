/**
 * Loads and processes local wetlands monitoring data.
 * Follows the same pattern as useScientificData — loads
 * once on mount, exposes isLoading state.
 *
 * Gracefully handles missing CSV by returning empty array
 * and logging the error — prevents app from breaking when
 * local-wetlands-crab-data.csv is not yet available.
 */

import { useEffect, useState } from 'react';
import { loadLocalWetlands } from '../loaders/loadLocalWetlands';
import { deriveLocalWetlands } from '../transforms/deriveLocalWetlands';
import type { LocalSite } from '../types/local-wetlands.types';

interface LocalWetlandsData {
  isLoading: boolean;
  localSites: LocalSite[];
}

/** Loads and processes local wetlands monitoring data, returning typed sites. */
export function useLocalWetlands(): LocalWetlandsData {
  const [data, setData] = useState<LocalWetlandsData>({
    isLoading: true,
    localSites: [],
  });

  useEffect(() => {
    /** Fetches CSV and derives typed LocalSite objects. */
    async function load() {
      try {
        const raw = await loadLocalWetlands();
        const localSites = deriveLocalWetlands(raw);
        setData({ isLoading: false, localSites });
      } catch (error) {
        console.error('Failed to load local wetlands data:', error);
        setData({ isLoading: false, localSites: [] });
      }
    }
    load();
  }, []);

  return data;
}
