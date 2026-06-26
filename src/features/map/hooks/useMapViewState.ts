import { useState } from 'react';

const STORAGE_KEY = 'glowdex_map_view';

interface ViewState {
  longitude: number;
  latitude: number;
  zoom: number;
}

/** Reads the last persisted map view state from sessionStorage. */
function readViewState(): ViewState | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as ViewState;
  } catch {
    return null;
  }
}

/** Writes the current map view state to sessionStorage. */
function writeViewState(state: ViewState): void {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // sessionStorage unavailable (private browsing restrictions, etc.)
  }
}

/**
 * Reads the last persisted map view from sessionStorage once on mount
 * and exposes a callback to persist the view on every move end.
 */
export function useMapViewState(defaultViewState: ViewState): {
  initialViewState: ViewState;
  persistViewState: (longitude: number, latitude: number, zoom: number) => void;
} {
  // useState lazy initializer runs exactly once on mount — reads from
  // sessionStorage without re-reading on re-renders.
  const [initialViewState] = useState<ViewState>(
    () => readViewState() ?? defaultViewState,
  );

  /** Persists the current map view to sessionStorage. */
  function persistViewState(
    longitude: number,
    latitude: number,
    zoom: number,
  ): void {
    writeViewState({ longitude, latitude, zoom });
  }

  return { initialViewState, persistViewState };
}
