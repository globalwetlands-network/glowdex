import { useBackendVersion } from '@/api/hooks/useBackendVersion';
import { DATASET_SKEW_UI_ENABLED } from '@/constants/features.constants';
import { useDatasetVersion } from './useDatasetVersion';

interface DatasetSkew {
  /**
   * True when the frontend's loaded manifest version and the backend's served
   * version are both known and disagree. Always computed, regardless of the
   * feature flag.
   */
  isSkewed: boolean;
  /**
   * `isSkewed` gated by the feature flag. Only when this is true should the UI
   * degrade (suppress insight/statistics, show the catching-up state).
   */
  skewActive: boolean;
}

/**
 * Detects dataset version skew between the frontend and backend.
 *
 * The frontend resolves the store manifest on load; the backend resolves it
 * once at startup. Between a pointer flip and the backend restart they can
 * disagree — the map would then show cells or indicators the assistant's
 * backend context doesn't know about.
 *
 * Skew is only meaningful when BOTH versions are present. In fallback/legacy
 * mode either side may have no version, which means "nothing to compare".
 */
export function useDatasetSkew(): DatasetSkew {
  const frontendVersion = useDatasetVersion();
  const { data: backendMeta } = useBackendVersion();
  const backendVersion = backendMeta?.dataset_version ?? null;

  const isSkewed =
    !!frontendVersion && !!backendVersion && frontendVersion !== backendVersion;

  return {
    isSkewed,
    skewActive: isSkewed && DATASET_SKEW_UI_ENABLED,
  };
}
