/**
 * Loads and processes local wetlands monitoring data.
 * Follows the same pattern as useScientificData — loads
 * once on mount, exposes isLoading state.
 *
 * Loads three sources in parallel: the sites CSV (coordinates),
 * the observations CSV (density/partner), and the meta JSON
 * (last-refreshed date).
 *
 * NON-CRITICAL / BEST-EFFORT: local monitoring data is deliberately
 * treated as optional. If any source fails (store outage, missing
 * file, network error) we log the error and degrade gracefully to an
 * empty site list + null date — the app never breaks on absent local
 * data, and this failure does NOT surface as the whole-app
 * DataUnavailable state (that is reserved for the critical scientific
 * bundle; see DataProvider). The trade-off is intentional: a local
 * outage looks like "no monitoring locations" to the user, but the
 * logged error preserves the outage signal for operators.
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
        // Best-effort/non-critical: log the outage signal for operators, then
        // degrade to an empty site list rather than failing the app. See the
        // hook docblock — local-data failure must not trigger DataUnavailable.
        console.error('Failed to load local wetlands data:', error);
        setData({ isLoading: false, localSites: [], localDataUpdated: null });
      }
    }
    load();
  }, []);

  return data;
}
