import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import posthog from 'posthog-js';

/**
 * Demo flag for the Local panel's preview plots (GLO-221). This module is the
 * only place the flag is read; components call `useDemoPlots()`.
 *
 * Precedence:
 * 1. URL: `?demo=plots` turns it on, `?demo=off` turns it off. Either is kept
 *    in sessionStorage so it survives navigation that drops the query (e.g.
 *    landing page → /map).
 * 2. PostHog flag `local-demo-plots`, once flags have loaded.
 * 3. Off.
 *
 * Fails closed: PostHog uninitialised, blocked, erroring or slower than
 * DEMO_FLAG_TIMEOUT_MS resolves to 'off'.
 */

export type DemoPlotsState = 'loading' | 'on' | 'off';
type Resolved = Exclude<DemoPlotsState, 'loading'>;

export const DEMO_PLOTS_FLAG_KEY = 'local-demo-plots';
export const DEMO_FLAG_TIMEOUT_MS = 2000;
export const DEMO_STORAGE_KEY = 'glowdex_demo_plots';

const URL_PARAM = 'demo';

/** Reads the stored override, or null when absent or storage is unavailable. */
function readStored(): Resolved | null {
  try {
    const value = sessionStorage.getItem(DEMO_STORAGE_KEY);
    return value === 'on' || value === 'off' ? value : null;
  } catch {
    return null;
  }
}

/** Persists the override; ignores storage failures (private browsing etc.). */
function writeStored(value: Resolved): void {
  try {
    sessionStorage.setItem(DEMO_STORAGE_KEY, value);
  } catch {
    // sessionStorage unavailable: the override still applies to this URL.
  }
}

/**
 * Applies a `?demo=` override from the query string and returns the
 * session's override, or null when there is none.
 */
export function resolveUrlOverride(search: string): Resolved | null {
  const param = new URLSearchParams(search).get(URL_PARAM);
  if (param === 'plots') {
    writeStored('on');
    return 'on';
  }
  if (param === 'off') {
    writeStored('off');
    return 'off';
  }
  return readStored();
}

let cachedFlag: Resolved | null = null;
let pendingFlag: Promise<Resolved> | null = null;

/**
 * Resolves the PostHog flag once per page load. The first answer (including
 * a timeout or error) is kept so the view never flips mid-session.
 */
function loadPostHogFlag(): Promise<Resolved> {
  if (cachedFlag) return Promise.resolve(cachedFlag);
  pendingFlag ??= new Promise<Resolved>((resolve) => {
    let settled = false;
    let unsubscribe: (() => void) | undefined;

    /** Settles the promise once and releases the listener and timer. */
    function finish(value: Resolved): void {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      try {
        unsubscribe?.();
      } catch {
        // Listener already gone.
      }
      cachedFlag = value;
      resolve(value);
    }

    const timer = setTimeout(() => finish('off'), DEMO_FLAG_TIMEOUT_MS);

    try {
      if (!posthog || !posthog.__loaded) {
        finish('off');
        return;
      }
      unsubscribe = posthog.onFeatureFlags((_flags, _variants, context) => {
        if (context?.errorsLoading) {
          finish('off');
          return;
        }
        finish(
          posthog.isFeatureEnabled(DEMO_PLOTS_FLAG_KEY) === true ? 'on' : 'off',
        );
      });
      // The callback can fire synchronously when flags are already loaded.
      if (settled) unsubscribe?.();
    } catch {
      finish('off');
    }
  });
  return pendingFlag;
}

/** Test-only: forgets the resolved PostHog flag. */
export function __resetDemoFlagCache(): void {
  cachedFlag = null;
  pendingFlag = null;
}

/**
 * Whether the Local panel shows the demo plots: 'loading' until the flag
 * resolves (render a skeleton), then 'on' or 'off'.
 */
export function useDemoPlots(): DemoPlotsState {
  const { search } = useLocation();
  const override = resolveUrlOverride(search);
  const [flag, setFlag] = useState<Resolved | null>(cachedFlag);

  useEffect(() => {
    if (override || flag) return;
    let active = true;
    void loadPostHogFlag().then((value) => {
      if (active) setFlag(value);
    });
    return () => {
      active = false;
    };
  }, [override, flag]);

  return override ?? flag ?? 'loading';
}
