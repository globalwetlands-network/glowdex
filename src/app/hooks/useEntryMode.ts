import { useCallback, useEffect, useState } from 'react';

/**
 * Which workflow the map is in (GLO-207).
 *
 * - `global`: grid tiles, cell selection, global analysis/filters.
 * - `local`: monitoring-site pins only, local wetlands analysis.
 *
 * The URL is the only contract with the landing page: `?mode=local`,
 * `?mode=global`, and `?mode=local&site=<id>`. Anything else (including no
 * param) means global, which is the app's behaviour before GLO-207.
 */
export type EntryMode = 'local' | 'global';

interface EntryState {
  entryMode: EntryMode;
  siteParam: string | null;
}

/** Reads mode and site from the current URL query string. */
function readEntryState(): EntryState {
  const params = new URLSearchParams(window.location.search);
  return {
    entryMode: params.get('mode') === 'local' ? 'local' : 'global',
    siteParam: params.get('site') || null,
  };
}

/**
 * Current workflow mode and site from the URL, kept in sync with
 * back/forward, plus helpers to cross-link into Local mode and to update
 * the selected site in place.
 */
export function useEntryMode() {
  const [state, setState] = useState<EntryState>(readEntryState);

  // Keep mode in sync with browser back/forward after a cross-link push.
  useEffect(() => {
    const onPopState = () => setState(readEntryState());
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  /**
   * Cross-link into Local mode for one site. Pushes a query-only URL so the
   * current path is kept (works under the `/glowdex/` base path and under a
   * future `/map` route).
   *
   * NOTE: `develop` has no router. Once one lands (feature/landing-page), a
   * raw pushState won't be observed by it — re-verify this cross-link then,
   * or switch to the router's navigate.
   */
  const enterLocalSite = useCallback((siteId: string) => {
    const params = new URLSearchParams({ mode: 'local', site: siteId });
    window.history.pushState(null, '', `?${params.toString()}`);
    setState({ entryMode: 'local', siteParam: siteId });
  }, []);

  /**
   * Keeps `?site=` in step with the site picked inside Local mode (dropdown,
   * pin click), so a refresh or shared link reopens the same site. Replaces
   * rather than pushes — picking sites isn't a navigation step for Back.
   * Passing null removes the param.
   */
  const replaceSiteParam = useCallback((siteId: string | null) => {
    const params = new URLSearchParams(window.location.search);
    if (siteId) params.set('site', siteId);
    else params.delete('site');
    const query = params.toString();
    window.history.replaceState(
      window.history.state,
      '',
      query ? `?${query}` : window.location.pathname,
    );
    setState((prev) => ({ ...prev, siteParam: siteId }));
  }, []);

  return { ...state, enterLocalSite, replaceSiteParam };
}
