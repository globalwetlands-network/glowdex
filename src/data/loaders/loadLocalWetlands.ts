/**
 * Loaders for local wetlands monitoring data.
 *
 * The dataset is split across two CSVs plus a meta file, served
 * from the canonical store's fixed `local/` path (via
 * datasetClient.localUrl) on its own monthly cadence — NOT behind
 * the versioned manifest. Filenames are stable so a refresh is a
 * data drop, not a code change.
 *
 *   local-sites.csv         AUTHORITATIVE for coordinates + the
 *                           site list. One row per coordinate
 *                           point (per condition); no density.
 *   local-observations.csv  AUTHORITATIVE for density / species /
 *                           SE / samples / partner id (feeds the
 *                           crab-density chart).
 *   local-meta.json         { "updated": ISO date } — when the
 *                           local data was last refreshed.
 *
 * deriveLocalWetlands joins the two CSVs (points from sites,
 * observations from observations) into LocalSite objects.
 *
 * Post-conference: replace with GET /api/local/sites (mirrors the
 * canonical-data-store local/manifest.json convention, so the
 * move is a path change rather than a rework).
 */

import { datasetClient } from '@/data/store/datasetClient';
import { parseCsv } from './csvParser';
import type {
  LocalSiteRaw,
  LocalObservationRaw,
} from '../types/local-wetlands.types';

/** Shape of local-meta.json. */
export interface LocalMeta {
  /** ISO date (YYYY-MM-DD) the local data was last refreshed. */
  updated: string;
}

/**
 * Loads site coordinates + site list from local-sites.csv.
 * Authoritative for where markers appear on the map.
 */
export async function loadLocalSites(): Promise<LocalSiteRaw[]> {
  const response = await datasetClient.fetchLocal('local-sites.csv');
  if (!response.ok) {
    throw new Error(
      `Failed to load local sites data: ` +
        `${response.status} ${response.statusText}`.trim(),
    );
  }
  const text = await response.text();
  return parseCsv<LocalSiteRaw>(text);
}

/**
 * Loads density/species/partner observations from
 * local-observations.csv. Authoritative for the crab-density
 * chart; joined onto sites by deriveLocalWetlands.
 */
export async function loadLocalObservations(): Promise<LocalObservationRaw[]> {
  const response = await datasetClient.fetchLocal('local-observations.csv');
  if (!response.ok) {
    throw new Error(
      `Failed to load local observations data: ` +
        `${response.status} ${response.statusText}`.trim(),
    );
  }
  const text = await response.text();
  return parseCsv<LocalObservationRaw>(text);
}

/**
 * Loads local-meta.json (last-refreshed date).
 * Degrades to null when the file is missing or unparseable — the
 * "last updated" caption is optional and must never fail the load.
 */
export async function loadLocalMeta(): Promise<LocalMeta | null> {
  try {
    const response = await datasetClient.fetchLocal('local-meta.json');
    if (!response.ok) return null;
    const data = (await response.json()) as Partial<LocalMeta>;
    return typeof data?.updated === 'string' ? { updated: data.updated } : null;
  } catch (error) {
    console.warn('Failed to load local meta:', error);
    return null;
  }
}
