import { useEffect, useRef } from 'react';

/**
 * Hook to automatically scroll an element to the bottom when a dependency changes.
 * @param dep - The dependency to watch (usually the length of the messages array).
 * @returns A ref to be attached to the scrollable container.
 */
export function useAutoScroll(dep: unknown) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [dep]);

  return scrollRef;
}