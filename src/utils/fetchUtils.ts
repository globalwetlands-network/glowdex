
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
  // Remove leading slashes to avoid double slashes with BASE_URL
  const cleanPath = path.replace(/^\/+/, '');
  return `${BASE_URL}${cleanPath}`;
}

/**
 * Fetch wrapper that automatically prefixes BASE_URL.
 * @param path The relative path to the asset
 * @param init Optional fetch init options
 * @returns Promise<Response>
 */
export async function fetchAsset(path: string, init?: RequestInit): Promise<Response> {
  return fetch(getAssetUrl(path), init);
}
