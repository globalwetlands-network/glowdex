import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { ReactNode } from 'react';
import { act, renderHook } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import type { FeatureFlagsCallback } from 'posthog-js';

const mockPosthog = vi.hoisted(() => ({
  __loaded: true,
  onFeatureFlags: vi.fn(),
  isFeatureEnabled: vi.fn(),
}));
vi.mock('posthog-js', () => ({ default: mockPosthog }));

import {
  __resetDemoFlagCache,
  DEMO_FLAG_TIMEOUT_MS,
  DEMO_STORAGE_KEY,
  useDemoPlots,
} from './useDemoPlots';

function renderAt(url: string) {
  const wrapper = ({ children }: { children: ReactNode }) => (
    <MemoryRouter initialEntries={[url]}>{children}</MemoryRouter>
  );
  return renderHook(() => useDemoPlots(), { wrapper });
}

/** Makes PostHog report flags (asynchronously, like the real client). */
function flagsArrive(enabled: boolean, errorsLoading = false) {
  mockPosthog.isFeatureEnabled.mockReturnValue(enabled);
  mockPosthog.onFeatureFlags.mockImplementation((cb: FeatureFlagsCallback) => {
    setTimeout(() => cb([], {}, { errorsLoading }), 100);
    return vi.fn();
  });
}

beforeEach(() => {
  vi.useFakeTimers();
  __resetDemoFlagCache();
  sessionStorage.clear();
  mockPosthog.__loaded = true;
  mockPosthog.onFeatureFlags.mockReset();
  mockPosthog.isFeatureEnabled.mockReset();
});

afterEach(() => {
  vi.useRealTimers();
});

describe('useDemoPlots', () => {
  it('is loading until PostHog flags arrive', () => {
    flagsArrive(true);
    const { result } = renderAt('/map?mode=local');
    expect(result.current).toBe('loading');
  });

  it('is on when the PostHog flag is enabled', async () => {
    flagsArrive(true);
    const { result } = renderAt('/map?mode=local');
    await act(() => vi.advanceTimersByTimeAsync(100));
    expect(result.current).toBe('on');
    expect(mockPosthog.isFeatureEnabled).toHaveBeenCalledWith(
      'local-demo-plots',
    );
  });

  it('is off when the PostHog flag is disabled', async () => {
    flagsArrive(false);
    const { result } = renderAt('/map?mode=local');
    await act(() => vi.advanceTimersByTimeAsync(100));
    expect(result.current).toBe('off');
  });

  it('is off when flags fail to load (blocked request)', async () => {
    flagsArrive(true, true);
    const { result } = renderAt('/map?mode=local');
    await act(() => vi.advanceTimersByTimeAsync(100));
    expect(result.current).toBe('off');
  });

  it('?demo=plots turns it on without waiting for PostHog and persists', () => {
    flagsArrive(false);
    const { result } = renderAt('/map?mode=local&demo=plots');
    expect(result.current).toBe('on');
    expect(sessionStorage.getItem(DEMO_STORAGE_KEY)).toBe('on');

    // A later URL without the param keeps the override.
    const later = renderAt('/map?mode=local');
    expect(later.result.current).toBe('on');
  });

  it('?demo=off clears a stored override and forces off', async () => {
    sessionStorage.setItem(DEMO_STORAGE_KEY, 'on');
    flagsArrive(true);
    const { result } = renderAt('/map?mode=local&demo=off');
    expect(result.current).toBe('off');
    expect(sessionStorage.getItem(DEMO_STORAGE_KEY)).toBe('off');
    await act(() => vi.advanceTimersByTimeAsync(100));
    expect(result.current).toBe('off');
  });

  it('is off when PostHog is not initialised (no key, blocked script)', async () => {
    mockPosthog.__loaded = false;
    const { result } = renderAt('/map?mode=local');
    await act(() => vi.advanceTimersByTimeAsync(0));
    expect(result.current).toBe('off');
    expect(mockPosthog.onFeatureFlags).not.toHaveBeenCalled();
  });

  it('is off when PostHog throws', async () => {
    mockPosthog.onFeatureFlags.mockImplementation(() => {
      throw new Error('blocked');
    });
    const { result } = renderAt('/map?mode=local');
    await act(() => vi.advanceTimersByTimeAsync(0));
    expect(result.current).toBe('off');
  });

  it('times out to off when flags never load', async () => {
    const unsubscribe = vi.fn();
    mockPosthog.onFeatureFlags.mockReturnValue(unsubscribe);
    const { result } = renderAt('/map?mode=local');
    await act(() => vi.advanceTimersByTimeAsync(DEMO_FLAG_TIMEOUT_MS - 1));
    expect(result.current).toBe('loading');
    await act(() => vi.advanceTimersByTimeAsync(1));
    expect(result.current).toBe('off');
    expect(unsubscribe).toHaveBeenCalled();
  });

  it('remembers the resolved flag so later mounts skip the skeleton', async () => {
    flagsArrive(true);
    renderAt('/map?mode=local');
    await act(() => vi.advanceTimersByTimeAsync(100));
    const { result } = renderAt('/map?mode=local');
    expect(result.current).toBe('on');
    expect(mockPosthog.onFeatureFlags).toHaveBeenCalledTimes(1);
  });
});
