import { useRef, useEffect } from 'react';

/**
 * Scrolls a target element into view whenever `signal` changes to a new,
 * strictly-greater truthy value. Initialises lastProcessedRef to the current
 * signal so stale signals don't fire on mount (e.g. after a tab switch resets
 * the passed value to 0 then back to the previous non-zero value).
 *
 * Returns a ref to attach to the element you want to scroll to.
 */
export function useScrollToSignal(signal: number | undefined) {
  const ref = useRef<HTMLDivElement>(null);
  const lastProcessedRef = useRef(0);

  useEffect(() => {
    if (!signal || signal <= lastProcessedRef.current) return;
    lastProcessedRef.current = signal;
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
