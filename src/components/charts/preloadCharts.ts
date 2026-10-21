import type { ComponentType } from 'react';
import type { PlotParams } from 'react-plotly.js';

type ChartModule = { default: ComponentType<PlotParams> };

let pending: Promise<ChartModule> | undefined;
let loaded: ChartModule | undefined;

/**
 * Fetches the chart code (Plotly) once. Safe to call repeatedly. A failed
 * fetch stays failed: browsers never re-request a dynamic import that failed
 * in this page, so only a reload recovers (see ChartPlaceholder).
 */
export function preloadCharts(): Promise<ChartModule> {
  pending ??= import('./PlotlyChart').then((module) => (loaded = module));
  return pending;
}

/** The chart component if its code has already loaded, so it renders without suspending. */
export function getLoadedChart(): ComponentType<PlotParams> | undefined {
  return loaded?.default;
}

/** Fetches the chart code when the browser is idle, e.g. once the map is interactive. */
export function preloadChartsWhenIdle(): void {
  const preload = () => void preloadCharts().catch(() => {});
  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(preload, { timeout: 2000 });
  } else {
    setTimeout(preload, 200);
  }
}
