import { useCallback, useRef } from 'react';

/**
 * Returns a ref and imperative scroll helpers for a scrollable container.
 */
export function useAutoScroll() {
  const ref = useRef<HTMLDivElement>(null);

  const scrollToTop = useCallback(() => {
    if (ref.current) ref.current.scrollTop = 0;
  }, []);

  const scrollToBottom = useCallback(() => {
    if (ref.current) ref.current.scrollTop = ref.current.scrollHeight;
  }, []);

  return { ref, scrollToTop, scrollToBottom };
}
