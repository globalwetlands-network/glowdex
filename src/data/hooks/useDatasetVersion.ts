import { useQuery } from '@tanstack/react-query';

import { datasetClient } from '@/data/store/datasetClient';

/** Query key for the frontend's resolved manifest version; invalidated on retry. */
export const DATASET_VERSION_QUERY_KEY = ['dataset', 'manifest', 'version'];

/**
 * The dataset version the frontend has loaded, read from the store manifest.
 *
 * Returns the manifest's `dataset_version` in store mode, or `null` in fallback
 * mode (no `VITE_DATA_STORE_URL`) or when the manifest can't be resolved. The
 * manifest is cached by the client, so this adds no extra network request.
 *
 * Backed by React Query so `DataProvider.retry()` can invalidate it after
 * `datasetClient.resetManifest()` — otherwise a recovered retry would keep
 * showing the stale version (or `local`).
 */
export function useDatasetVersion(): string | null {
  const { data } = useQuery({
    queryKey: DATASET_VERSION_QUERY_KEY,
    queryFn: async () => {
      try {
        const manifest = await datasetClient.resolveManifest();
        return manifest.dataset_version;
      } catch {
        // Fallback mode / unreachable store: no version to show.
        return null;
      }
    },
    // The manifest version is stable for the session unless a retry resets it.
    staleTime: Infinity,
  });

  return data ?? null;
}
