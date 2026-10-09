import type { InsightMode, LocalSiteContext } from '@/api/types';

/**
 * The line under the assistant's title: the site in local mode, the cell in
 * global mode. Null while the subject isn't known yet (e.g. a local site
 * whose partner data is still loading).
 */
export function assistantSubtitle(
  mode: InsightMode,
  cellId: number | null | undefined,
  localSiteContext: LocalSiteContext | null | undefined,
): string | null {
  if (mode === 'local') {
    return localSiteContext
      ? `${localSiteContext.siteName} · ${localSiteContext.country}`
      : null;
  }
  return cellId != null ? `Cell ID: ${cellId}` : null;
}
