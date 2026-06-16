import { useRef, useEffect } from 'react';

/**
 * Scrolls a target element into view whenever `signal` increments.
 * Uses a RAF-debounced scroll with a ResizeObserver on preceding
 * siblings to re-scroll if content above the target expands after
 * async data loads (e.g. while cards are rendering).
 *
 * Returns a ref to attach to the element you want to scroll to.
 */
export function useScrollToSignal(signal: number | undefined) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!signal) return;
    const target = ref.current;
    if (!target) return;

    let rafId: number;
    const doScroll = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    };

    doScroll();

    const observer =
      typeof ResizeObserver !== 'undefined'
        ? new ResizeObserver(doScroll)
        : null;

    if (observer) {
      let sibling = target.previousElementSibling;
      while (sibling) {
        observer.observe(sibling);
        sibling = sibling.previousElementSibling;
      }
    }

    const timeout = setTimeout(() => observer?.disconnect(), 1500);

    return () => {
      cancelAnimationFrame(rafId);
      observer?.disconnect();
      clearTimeout(timeout);
    };
  }, [signal]);

  return ref;
}
