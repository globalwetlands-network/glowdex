import { useRef, useEffect } from 'react';

/**
 * Scrolls a target element into view whenever `signal` changes to a new,
 * strictly-greater truthy value.
 *
 * `lastProcessedRef` starts at 0, so a non-zero signal that is already present
 * when the component mounts DOES fire. This is intentional: the consumer
 * (partner scroll in `BiodiversityPanel`) remounts on mobile when navigating to
 * the panel, and we want the scroll to run on that fresh mount. A fresh mount
 * also gives a fresh `lastProcessedRef`, so there is no stale value to suppress.
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
