import { useEffect, type RefObject } from 'react';
import { preloadCharts } from './preloadCharts';

/**
 * Fetches the chart code once the element is actually on screen (no margin),
 * so a page that merely mounts a chart section early doesn't download Plotly
 * until the visitor scrolls to it.
 */
export function usePreloadChartsInView(ref: RefObject<Element | null>): void {
  useEffect(() => {
    const element = ref.current;
    if (!element || typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        observer.disconnect();
        preloadCharts().catch(() => {});
      }
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, [ref]);
}
