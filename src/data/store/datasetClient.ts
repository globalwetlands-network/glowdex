/**
 * Client for the canonical data store (GLO-174/175).
 *
 * When `VITE_DATA_STORE_URL` is set, the app loads its dataset from the remote
 * store: resolve `manifest.json` once (cached), then read the immutable bundle
 * it points at. Local monitoring data lives at a fixed `local/` path, on its own
 * monthly cadence — NOT behind the manifest.
 *
 * When the var is unset/empty, the client falls back to the same-origin repo
 * copies under `public/data/` via `getAssetUrl` (current behaviour). This keeps
 * the store cutover a config change (set the var) rather than a code change, so
 * merging this before the cutover is inert.
 *
 * `getAssetUrl` cannot be reused for the store: it returns a same-origin
 * `pathname` and its traversal guard throws on an absolute `https://` URL. It is
 * only used here for the fallback path.
 */
import { getAssetUrl } from '@/utils/fetchUtils';
import type { Manifest } from './manifest.types';

/** How long to wait on a store request before aborting (cross-origin, can stall). */
const STORE_TIMEOUT_MS = 30000;

/** Thrown when a store request cannot be resolved (unreachable / malformed / timed out). */
export class DataStoreError extends Error {
  constructor(message: string, options?: { cause?: unknown }) {
    super(message, options);
    this.name = 'DataStoreError';
  }
}

/** Read lazily (not a module-level const) so tests can `vi.stubEnv`. */
function storeUrl(): string | undefined {
  const value = import.meta.env.VITE_DATA_STORE_URL as string | undefined;
  const trimmed = value?.trim();
  return trimmed ? trimmed.replace(/\/+$/, '') : undefined;
}

/**
 * `fetch` with an abort timeout, translating network/timeout failures into a
 * `DataStoreError`. Same shape as the API client's timeout handling
 * (`src/api/client.ts`); cross-origin store requests can otherwise hang forever.
 */
async function fetchWithTimeout(url: string): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), STORE_TIMEOUT_MS);
  try {
    return await fetch(url, { signal: controller.signal });
  } catch (cause) {
    if (cause instanceof Error && cause.name === 'AbortError') {
      throw new DataStoreError(
        `Data store request to ${url} timed out after ${STORE_TIMEOUT_MS}ms`,
        { cause },
      );
    }
    throw new DataStoreError(`Could not reach the data store at ${url}`, {
      cause,
    });
  } finally {
    clearTimeout(timer);
  }
}

let manifestPromise: Promise<Manifest> | null = null;

function isValidManifest(value: unknown): value is Manifest {
  const m = value as Partial<Manifest> | null;
  return (
    typeof m === 'object' &&
    m !== null &&
    typeof m.path === 'string' &&
    m.path.length > 0 &&
    typeof m.dataset_version === 'string' &&
    m.dataset_version.length > 0
  );
}

async function fetchManifest(base: string): Promise<Manifest> {
  const url = `${base}/manifest.json`;
  const response = await fetchWithTimeout(url);

  if (!response.ok) {
    throw new DataStoreError(
      `Data store manifest request failed: ${response.status} ${response.statusText}`.trim(),
    );
  }

  let parsed: unknown;
  try {
    parsed = await response.json();
  } catch (cause) {
    throw new DataStoreError(
      `Data store manifest at ${url} was not valid JSON`,
      { cause },
    );
  }

  if (!isValidManifest(parsed)) {
    throw new DataStoreError(
      `Data store manifest at ${url} is missing a valid "path"/"dataset_version"`,
    );
  }
  return parsed;
}

/**
 * Resolve the store manifest, fetching it at most once. On failure the cached
 * promise is cleared so a later retry re-fetches rather than replaying the
 * rejection. Only valid in store mode.
 */
function resolveManifest(): Promise<Manifest> {
  const base = storeUrl();
  if (!base) {
    return Promise.reject(
      new DataStoreError('VITE_DATA_STORE_URL is not configured'),
    );
  }
  if (!manifestPromise) {
    manifestPromise = fetchManifest(base).catch((error) => {
      manifestPromise = null;
      throw error;
    });
  }
  return manifestPromise;
}

/** Clear the cached manifest promise so the next resolve re-fetches (retry). */
function resetManifest(): void {
  manifestPromise = null;
}

/** Absolute base URL of the active bundle, e.g. `${store}/datasets/2026.09.0/`. */
async function bundleBase(): Promise<string> {
  const base = storeUrl() as string; // resolveManifest already guards for undefined
  const manifest = await resolveManifest();
  const path = manifest.path.replace(/^\/+/, '');
  const normalized = path.endsWith('/') ? path : `${path}/`;
  return `${base}/${normalized}`;
}

/** URL for a versioned bundle asset (e.g. `grid-items.csv`). */
async function assetUrl(filename: string): Promise<string> {
  if (!storeUrl()) return getAssetUrl(`data/${filename}`);
  return `${await bundleBase()}${filename}`;
}

/**
 * URL for a local-data asset at the fixed `local/` path (e.g.
 * `local-sites.csv`). Not behind the manifest — local data has its own cadence.
 */
function localUrl(filename: string): string {
  const base = storeUrl();
  if (!base) return getAssetUrl(`data/${filename}`);
  return `${base}/local/${filename}`;
}

/** Fetch a versioned bundle asset (resolves the manifest first) with a timeout. */
async function fetchAsset(filename: string): Promise<Response> {
  return fetchWithTimeout(await assetUrl(filename));
}

/** Fetch a local-data asset from the fixed `local/` path with a timeout. */
async function fetchLocal(filename: string): Promise<Response> {
  return fetchWithTimeout(localUrl(filename));
}

export const datasetClient = {
  resolveManifest,
  resetManifest,
  bundleBase,
  assetUrl,
  localUrl,
  fetchAsset,
  fetchLocal,
};
