import { useEffect, useRef } from 'react';

/**
 * Drives auto-scrolling of the Analysis panel.
 *
 * Two intents compete: navigating to the Analysis tab should land at the top,
 * while tapping a local site should land on the Local Wetlands card. Each is
 * signalled by a timestamp (Date.now()) and the most recent one wins. Comparing
 * timestamps — rather than running two independent effects — resolves the intent
 * correctly both when the panel re-renders (desktop: the panel stays mounted)
 * and when it mounts fresh (mobile: switching tabs remounts the panel). On a
 * fresh mount there is no "previous" state to compare against, so acting on the
 * newest signal is the only reliable way to know what the user just did.
 *
 * For the local-data target, the cards above it (AI assistant, violin plots)
 * mount at minimal height and only reach full size once their async content
 * renders, which on mobile can take over a second. Scrolling once lands near the
 * top because the target is still close to it. We therefore re-pin the target to
 * the top of the container whenever a card above it resizes, keeping the
 * observer alive until layout has been quiet briefly (the timer resets on each
 * resize) up to a hard cap.
 *
 * Returns refs to attach to the scroll container and the Local Wetlands card.
 */
export function useAnalysisScroll(
  scrollToTopSignal: number | undefined,
  scrollToLocalDataSignal: number | undefined,
) {
  const containerRef = useRef<HTMLDivElement>(null);
  const localDataRef = useRef<HTMLDivElement>(null);
  const lastProcessedRef = useRef(0);

  useEffect(() => {
    const top = scrollToTopSignal ?? 0;
    const local = scrollToLocalDataSignal ?? 0;
    const latest = Math.max(top, local);
    if (!latest || latest <= lastProcessedRef.current) return;
    lastProcessedRef.current = latest;

    // Scroll to top — trivially correct regardless of later layout growth,
    // since the top of the container never moves.
    if (local < top) {
      const container = containerRef.current;
      if (!container) return;
      const id = requestAnimationFrame(() => {
        container.scrollTop = 0;
      });
      return () => cancelAnimationFrame(id);
    }

    // Scroll to the Local Wetlands card.
    const target = localDataRef.current;
    if (!target) return;

    let rafId = 0;
    const scrollNow = (behavior: ScrollBehavior) => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        target.scrollIntoView({ behavior, block: 'start' });
      });
    };

    // First scroll is smooth for a polished transition when the panel is
    // already laid out (desktop, or an already-mounted panel). Re-pins driven
    // by layout growth are instant so they don't chase a moving target.
    scrollNow('smooth');

    if (typeof ResizeObserver === 'undefined') {
      return () => cancelAnimationFrame(rafId);
    }

    let idleTimer = 0;
    const stopObserving = () => observer.disconnect();
    const resetIdleTimer = () => {
      clearTimeout(idleTimer);
      idleTimer = window.setTimeout(stopObserving, 1000);
    };

    // The first observation reports each sibling's current size on observe();
    // skip it so it doesn't override the smooth scroll with an instant re-pin.
    let primed = false;
    const observer = new ResizeObserver(() => {
      if (!primed) {
        primed = true;
        return;
      }
      scrollNow('auto');
      resetIdleTimer();
    });

    let sibling = target.previousElementSibling;
    while (sibling) {
      observer.observe(sibling);
      sibling = sibling.previousElementSibling;
    }

    const hardCap = setTimeout(stopObserving, 3500);

    return () => {
      cancelAnimationFrame(rafId);
      observer.disconnect();
      clearTimeout(idleTimer);
      clearTimeout(hardCap);
    };
  }, [scrollToTopSignal, scrollToLocalDataSignal]);

  return { containerRef, localDataRef };
}
