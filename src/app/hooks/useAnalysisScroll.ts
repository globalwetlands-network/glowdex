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
 * The effect's dependencies ARE the two signals, so it only runs on mount or
 * when a signal changes — i.e. exactly when a scroll is wanted. It therefore
 * keeps no "last processed" bookkeeping, which also keeps it idempotent and safe
 * under React StrictMode's mount-time double invocation (setup → cleanup →
 * setup): the surviving setup simply scrolls again.
 *
 * Returns refs to attach to the scroll container and the Local Wetlands card.
 */
export function useAnalysisScroll(
  scrollToTopSignal: number | undefined,
  scrollToLocalDataSignal: number | undefined,
) {
  const containerRef = useRef<HTMLDivElement>(null);
  const localDataRef = useRef<HTMLDivElement>(null);
  const hasMountedRef = useRef(false);

  useEffect(() => {
    const top = scrollToTopSignal ?? 0;
    const local = scrollToLocalDataSignal ?? 0;
    const latest = Math.max(top, local);
    if (!latest) return;

    // Scroll to top — always correct; the top of the container never moves.
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

    // Already-mounted panel (desktop, or selecting a site from within an open
    // panel): the cards above the target are at their final size, so a single
    // smooth scroll lands correctly.
    if (hasMountedRef.current) {
      const id = requestAnimationFrame(() => {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
      return () => cancelAnimationFrame(id);
    }

    // Fresh mount (mobile tab switch): the cards above mount small and grow as
    // their async content (cell statistics, violin plots, AI assistant) arrives,
    // pushing the target down well after the initial scroll. Re-pin the target
    // to the top whenever a card above it resizes, until layout has been quiet
    // for a beat (the timer resets on each resize) or the user scrolls, with a
    // hard cap as a final backstop.
    let rafId = 0;
    const pin = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        target.scrollIntoView({ block: 'start' });
      });
    };
    pin();

    if (typeof ResizeObserver === 'undefined') {
      return () => cancelAnimationFrame(rafId);
    }

    const container = containerRef.current;
    let idleTimer = 0;

    const teardown = () => {
      // Cancel any frame still queued by pin() so it can't fire one last scroll
      // after the user has taken over (teardown also runs as the scroll handler).
      cancelAnimationFrame(rafId);
      observer.disconnect();
      clearTimeout(idleTimer);
      clearTimeout(hardCap);
      container?.removeEventListener('wheel', teardown);
      container?.removeEventListener('touchmove', teardown);
    };

    const resetIdleTimer = () => {
      clearTimeout(idleTimer);
      idleTimer = window.setTimeout(teardown, 1200);
    };

    const observer = new ResizeObserver(() => {
      pin();
      resetIdleTimer();
    });

    let sibling = target.previousElementSibling;
    while (sibling) {
      observer.observe(sibling);
      sibling = sibling.previousElementSibling;
    }
    resetIdleTimer();

    const hardCap = setTimeout(teardown, 6000);

    // A genuine user scroll (wheel / touch drag) means they've taken over —
    // stop re-pinning so we don't yank them back. Our own scrollIntoView does
    // not emit wheel/touchmove, so these only fire for real user input.
    container?.addEventListener('wheel', teardown, { passive: true });
    container?.addEventListener('touchmove', teardown, { passive: true });

    return teardown;
  }, [scrollToTopSignal, scrollToLocalDataSignal]);

  // Mark as mounted AFTER the signal effect, so the first run on a fresh mount
  // (mobile, with a pending signal) takes the fresh-mount branch above. The
  // cleanup resets the flag so that under StrictMode's mount-time replay — which
  // runs all cleanups before re-running setups — the surviving signal-effect
  // setup still sees a fresh mount.
  useEffect(() => {
    hasMountedRef.current = true;
    return () => {
      hasMountedRef.current = false;
    };
  }, []);

  return { containerRef, localDataRef };
}
