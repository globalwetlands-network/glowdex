import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useDatasetSkew } from './useDatasetSkew';

const useDatasetVersionMock = vi.fn<() => string | null>();
const useBackendVersionMock =
  vi.fn<() => { data?: { dataset_version?: string } }>();

vi.mock('./useDatasetVersion', () => ({
  useDatasetVersion: () => useDatasetVersionMock(),
}));

vi.mock('@/api/hooks/useBackendVersion', () => ({
  useBackendVersion: () => useBackendVersionMock(),
}));

/** Stubs the frontend and backend version hooks for a test case. */
function setVersions(frontend: string | null, backend: string | null) {
  useDatasetVersionMock.mockReturnValue(frontend);
  useBackendVersionMock.mockReturnValue({
    data: backend ? { dataset_version: backend } : undefined,
  });
}

describe('useDatasetSkew', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('detects skew when both versions are present and differ', () => {
    setVersions('2026.09.0', '2026.09.1');
    const { result } = renderHook(() => useDatasetSkew());
    expect(result.current.isSkewed).toBe(true);
  });

  it('reports no skew when versions agree', () => {
    setVersions('2026.09.0', '2026.09.0');
    const { result } = renderHook(() => useDatasetSkew());
    expect(result.current.isSkewed).toBe(false);
  });

  it('reports no skew when either version is missing (nothing to compare)', () => {
    setVersions(null, '2026.09.0');
    expect(renderHook(() => useDatasetSkew()).result.current.isSkewed).toBe(
      false,
    );

    setVersions('2026.09.0', null);
    expect(renderHook(() => useDatasetSkew()).result.current.isSkewed).toBe(
      false,
    );
  });

  it('keeps skewActive false while the feature flag is off', () => {
    // DATASET_SKEW_UI_ENABLED is false by default (pending product sign-off),
    // so the user-facing degradation must never fire even when skew is detected.
    setVersions('2026.09.0', '2026.09.1');
    const { result } = renderHook(() => useDatasetSkew());
    expect(result.current.isSkewed).toBe(true);
    expect(result.current.skewActive).toBe(false);
  });
});
