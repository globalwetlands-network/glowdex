import { useEffect, useState } from 'react';

import { datasetClient } from '@/data/store/datasetClient';

/**
 * The dataset version the frontend has loaded, read from the store manifest.
 *
 * Returns the manifest's `dataset_version` in store mode, or `null` in fallback
 * mode (no `VITE_DATA_STORE_URL`) or when the manifest can't be resolved. The
 * manifest is cached by the client, so this adds no extra network request.
 */
export function useDatasetVersion(): string | null {
  const [version, setVersion] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    datasetClient
      .resolveManifest()
      .then((manifest) => {
        if (active) setVersion(manifest.dataset_version);
      })
      .catch(() => {
        // Fallback mode / unreachable store: no version to show.
        if (active) setVersion(null);
      });
    return () => {
      active = false;
    };
  }, []);

  return version;
}
