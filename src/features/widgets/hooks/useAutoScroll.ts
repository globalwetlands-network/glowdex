import { useEffect, useRef } from 'react';

export function useAutoScroll(dep: unknown) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [dep]);

  return scrollRef;
}