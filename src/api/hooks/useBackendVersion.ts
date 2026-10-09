import { useQuery } from '@tanstack/react-query';
import { fetchDatasetMeta } from '@/api/meta';
import type { DatasetMetaResponse } from '@/api/types';

/**
 * Fetches the dataset version the backend is currently serving from
 * `GET /api/meta/dataset`. Powers the version-skew check against the
 * frontend's resolved manifest (see useDatasetSkew).
 *
 * Short staleTime so a backend restart after a pointer flip is picked up
 * reasonably quickly during a cutover.
 *
 * Pass `enabled: false` to skip the request (e.g. a static, non-live render).
 */
export function useBackendVersion({
  enabled = true,
}: { enabled?: boolean } = {}) {
  return useQuery<DatasetMetaResponse>({
    queryKey: ['meta', 'dataset'],
    queryFn: fetchDatasetMeta,
    enabled,
    staleTime: 1000 * 60, // 1 min
    retry: 1,
  });
}
