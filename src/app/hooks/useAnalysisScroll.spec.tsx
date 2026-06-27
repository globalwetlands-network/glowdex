import { render, cleanup } from '@testing-library/react';
import { StrictMode } from 'react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { useAnalysisScroll } from './useAnalysisScroll';

/**
 * A controllable requestAnimationFrame queue. We flush callbacks manually,
 * AFTER React's StrictMode mount replay (setup → cleanup → setup) has fully
 * settled. That ordering is what makes the original "the surviving setup bails,
 * so nothing scrolls" regression observable: the first setup's frame is
 * cancelled by its own teardown, so only a frame queued by the surviving setup
 * can fire.
 */
let rafCallbacks: Map<number, FrameRequestCallback>;
let nextRafId: number;

function flushRAF() {
  const callbacks = Array.from(rafCallbacks.values());
  rafCallbacks.clear();
  callbacks.forEach((cb) => cb(0));
}

beforeEach(() => {
  rafCallbacks = new Map();
  nextRafId = 0;
  vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => {
    const id = ++nextRafId;
    rafCallbacks.set(id, cb);
    return id;
  });
  vi.stubGlobal('cancelAnimationFrame', (id: number) => {
    rafCallbacks.delete(id);
  });
  // jsdom implements neither ResizeObserver nor scrollIntoView.
  vi.stubGlobal(
    'ResizeObserver',
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  );
});

afterEach(() => {
  cleanup();
  // jsdom doesn't implement scrollIntoView; remove our per-test stub so it
  // can't leak into other suites.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  delete (HTMLElement.prototype as any).scrollIntoView;
  vi.unstubAllGlobals();
});

function TestPanel({
  topSignal,
  localSignal,
}: {
  topSignal?: number;
  localSignal?: number;
}) {
  const { containerRef, localDataRef } = useAnalysisScroll(
    topSignal,
    localSignal,
  );
  return (
    <div ref={containerRef} data-testid="container">
      <div>card 1</div>
      <div>card 2</div>
      <div ref={localDataRef} data-testid="local">
        local wetlands
      </div>
    </div>
  );
}

describe('useAnalysisScroll', () => {
  it('scrolls to the local data card on a fresh mount (regression: StrictMode mount replay must not bail)', () => {
    const scrollIntoView = vi.fn();
    HTMLElement.prototype.scrollIntoView = scrollIntoView;

    render(
      <StrictMode>
        <TestPanel localSignal={1_700_000_000_000} topSignal={0} />
      </StrictMode>,
    );
    flushRAF();

    expect(scrollIntoView).toHaveBeenCalled();
    expect(scrollIntoView.mock.calls[0][0]).toMatchObject({ block: 'start' });
  });

  it('does not scroll the local data card into view when the top signal is newest', () => {
    const scrollIntoView = vi.fn();
    HTMLElement.prototype.scrollIntoView = scrollIntoView;

    render(
      <StrictMode>
        <TestPanel
          topSignal={1_700_000_000_001}
          localSignal={1_700_000_000_000}
        />
      </StrictMode>,
    );
    flushRAF();

    // Top intent scrolls the container via scrollTop, never scrollIntoView.
    expect(scrollIntoView).not.toHaveBeenCalled();
  });

  it('uses a smooth scroll when the panel is already mounted (desktop / open panel)', () => {
    const scrollIntoView = vi.fn();
    HTMLElement.prototype.scrollIntoView = scrollIntoView;

    const { rerender } = render(
      <StrictMode>
        <TestPanel localSignal={0} topSignal={0} />
      </StrictMode>,
    );
    flushRAF();
    scrollIntoView.mockClear();

    // An update (not a remount) once the panel is already mounted.
    rerender(
      <StrictMode>
        <TestPanel localSignal={1_700_000_000_000} topSignal={0} />
      </StrictMode>,
    );
    flushRAF();

    expect(scrollIntoView).toHaveBeenCalledWith({
      behavior: 'smooth',
      block: 'start',
    });
  });

  it('does nothing when both signals are zero', () => {
    const scrollIntoView = vi.fn();
    HTMLElement.prototype.scrollIntoView = scrollIntoView;

    render(
      <StrictMode>
        <TestPanel topSignal={0} localSignal={0} />
      </StrictMode>,
    );
    flushRAF();

    expect(scrollIntoView).not.toHaveBeenCalled();
  });
});
