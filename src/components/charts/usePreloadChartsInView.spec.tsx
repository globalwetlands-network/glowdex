import { render } from '@testing-library/react';
import { useRef } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { preloadCharts } from './preloadCharts';
import { usePreloadChartsInView } from './usePreloadChartsInView';

vi.mock('./preloadCharts', () => ({
  preloadCharts: vi.fn(() => Promise.resolve()),
}));

/** Captures the observer callback so a test can report the element on screen. */
let reportVisible: (() => void) | undefined;
beforeEach(() => {
  reportVisible = undefined;
  vi.stubGlobal(
    'IntersectionObserver',
    vi.fn().mockImplementation(function (
      callback: (entries: Array<{ isIntersecting: boolean }>) => void,
    ) {
      reportVisible = () => callback([{ isIntersecting: true }]);
      return { observe: vi.fn(), disconnect: vi.fn() };
    }),
  );
});
afterEach(() => {
  vi.unstubAllGlobals();
  vi.mocked(preloadCharts).mockClear();
});

function Section({ enabled }: { enabled?: boolean }) {
  const ref = useRef<HTMLElement>(null);
  usePreloadChartsInView(ref, enabled);
  return <section ref={ref} />;
}

describe('usePreloadChartsInView', () => {
  it('fetches the chart code once the section is on screen', () => {
    render(<Section />);
    expect(preloadCharts).not.toHaveBeenCalled();

    reportVisible?.();
    expect(preloadCharts).toHaveBeenCalledTimes(1);
  });

  it('does not watch the section when disabled (slow connection)', () => {
    render(<Section enabled={false} />);

    expect(IntersectionObserver).not.toHaveBeenCalled();
    expect(reportVisible).toBeUndefined();
    expect(preloadCharts).not.toHaveBeenCalled();
  });
});
