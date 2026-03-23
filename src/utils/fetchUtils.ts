/**
 * Base URL provided by Vite.
 * In dev: "/"
 * In production (GitHub Pages): "/glowdex/"
 * Fallback to '/' if import.meta.env.BASE_URL is undefined (e.g. in tests)
 */
const BASE_URL = import.meta.env?.BASE_URL ?? '/';

/**
 * Build a fully-qualified asset URL relative to the Vite base.
 * @param path The relative path to the asset (e.g. 'data/grid.geojson')
 * @returns The full URL with base path
 */
export function getAssetUrl(path: string): string {
  // Normalize base to always start and end with slash
  const base = BASE_URL.startsWith('/') ? BASE_URL : `/${BASE_URL}`;
  const safeBase = base.endsWith('/') ? base : `${base}/`;

  const dummyOrigin = 'http://internal-check';
  const resolved = new URL(path, `${dummyOrigin}${safeBase}`);

  // Security: ensure resolved path stays within BASE_URL
  if (!resolved.pathname.startsWith(safeBase)) {
    throw new Error(
      `Invalid asset path: Path traversal not allowed in "${path}"`,
    );
  }

  return resolved.pathname;
}

/**
 * Fetch wrapper that automatically prefixes BASE_URL.
 * @param path The relative path to the asset
 * @param init Optional fetch init options
 * @returns Promise<Response>
 */
export async function fetchAsset(
  path: string,
  init?: RequestInit,
): Promise<Response> {
  return fetch(getAssetUrl(path), init);
}
