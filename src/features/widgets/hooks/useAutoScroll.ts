import { useEffect, useRef } from 'react';

/**
 * Scrolls container to bottom when dependency changes.
 */
export function useAutoScroll(dep: unknown) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;

    ref.current.scrollTop = ref.current.scrollHeight;
  }, [dep]);

  return ref;
}
