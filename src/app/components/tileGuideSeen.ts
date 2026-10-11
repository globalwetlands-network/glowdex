/**
 * Whether the user has made a real tile selection, which switches the Global
 * empty state guide from the looping demo to static steps. Kept out of
 * GlobalEmptyStateGuide.tsx so that file only exports components (fast
 * refresh).
 */
export const TILE_GUIDE_SEEN_KEY = 'glowdex_tile_guide_seen';

/** Call when the user selects a real tile for the first time. */
export function markTileGuideSeen(): void {
  try {
    localStorage.setItem(TILE_GUIDE_SEEN_KEY, 'true');
  } catch {
    // Storage unavailable: the guide keeps animating, which is acceptable.
  }
}

/** True once a real tile has been selected in this browser. */
export function hasSeenTileGuide(): boolean {
  try {
    return localStorage.getItem(TILE_GUIDE_SEEN_KEY) === 'true';
  } catch {
    return false;
  }
}
