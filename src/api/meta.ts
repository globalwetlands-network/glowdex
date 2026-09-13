import type { DatasetMetaResponse } from './types';
import { apiClient } from './client';

/**
 * Fetch the dataset the backend is currently serving (version + resolution
 * mode). Used for the version-skew check: the backend resolves its manifest
 * once at startup, so between a pointer flip and a backend restart it can
 * report a different version than the frontend's freshly-resolved manifest.
 */
export async function fetchDatasetMeta(): Promise<DatasetMetaResponse> {
  return apiClient<DatasetMetaResponse>('/meta/dataset');
}
