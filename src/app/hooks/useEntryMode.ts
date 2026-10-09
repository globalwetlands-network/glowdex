import { useCallback, useLayoutEffect, useRef } from 'react';
import { useLocation, useNavigate, type Location } from 'react-router-dom';

/**
 * Which workflow the map is in (GLO-207).
 *
 * - `global`: grid tiles, cell selection, global analysis/filters.
 * - `local`: monitoring-site pins only, local wetlands analysis.
 *
 * The URL is the only contract with the landing page: `/map?mode=local`,
 * `/map?mode=global`, and `/map?mode=local&site=<id>`. Anything else
 * (including no param) means global, which is the app's behaviour before
 * GLO-207.
 */
export type EntryMode = 'local' | 'global';

/** Reads mode and site from a query string. */
function parseEntry(search: string): {
  entryMode: EntryMode;
  siteParam: string | null;
} {
  const params = new URLSearchParams(search);
  return {
    entryMode: params.get('mode') === 'local' ? 'local' : 'global',
    siteParam: params.get('site') || null,
  };
}

/**
 * Current workflow mode and site from the router's location, plus helpers to
 * cross-link into Local mode, update the selected site in place, and switch
 * mode.
 *
 * Navigation goes through React Router, so the router sees every change and
 * Back/Forward need no extra handling. The helpers edit the current query
 * rather than rebuilding it, so the path (`/map` under the `/glowdex/`
 * basename), unrelated params (e.g. `utm_*`, feature flags) and the `#hash`
 * are all kept. Their identities are stable across URL changes.
 */
export function useEntryMode() {
  const location = useLocation();
  const navigate = useNavigate();

  // The helpers read the latest location through a ref so they keep a
  // stable identity instead of changing on every navigation.
  const locationRef = useRef<Location>(location);
  useLayoutEffect(() => {
    locationRef.current = location;
  }, [location]);

  const updateQuery = useCallback(
    (edit: (params: URLSearchParams) => void, replace: boolean) => {
      const current = locationRef.current;
      const params = new URLSearchParams(current.search);
      edit(params);
      const query = params.toString();
      navigate(
        { search: query ? `?${query}` : '', hash: current.hash },
        // A replace keeps the entry's state, as replaceState did before.
        replace ? { replace: true, state: current.state } : undefined,
      );
    },
    [navigate],
  );

  /**
   * Cross-link into Local mode for one site. Pushes a history entry, so Back
   * returns to where the visitor came from.
   */
  const enterLocalSite = useCallback(
    (siteId: string) =>
      updateQuery((params) => {
        params.set('mode', 'local');
        params.set('site', siteId);
      }, false),
    [updateQuery],
  );

  /**
   * Keeps `?site=` in step with the site picked inside Local mode (dropdown,
   * pin click), so a refresh or shared link reopens the same site. Replaces
   * rather than pushes — picking sites isn't a navigation step for Back.
   * Passing null removes the param.
   */
  const replaceSiteParam = useCallback(
    (siteId: string | null) =>
      updateQuery((params) => {
        if (siteId) params.set('site', siteId);
        else params.delete('site');
      }, true),
    [updateQuery],
  );

  /**
   * Switches workflow (the map's Local/Global switch). Pushes a history
   * entry, so Back undoes it. Global never has a selected site, so switching
   * to it drops `?site=`.
   */
  const setMode = useCallback(
    (mode: EntryMode) =>
      updateQuery((params) => {
        params.set('mode', mode);
        if (mode === 'global') params.delete('site');
      }, false),
    [updateQuery],
  );

  return {
    ...parseEntry(location.search),
    enterLocalSite,
    replaceSiteParam,
    setMode,
  };
}
