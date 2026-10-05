import { renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useAIAnalytics } from './useAIAnalytics';
import type { LocalSiteContext } from '@/api/types';

const capture = vi.fn();
vi.mock('posthog-js/react', () => ({ usePostHog: () => ({ capture }) }));

const localSiteContext: LocalSiteContext = {
  siteName: 'Bayhead',
  country: 'South Africa',
  partner: 'University of the Western Cape',
  year: 2026,
  conditions: [],
};

describe('useAIAnalytics (GLO-207)', () => {
  afterEach(() => capture.mockClear());

  it('local mode: tags mode + site_id, null cell_id and null has_mangrove', () => {
    const { result } = renderHook(() =>
      useAIAnalytics({
        mode: 'local',
        selectedCellId: null,
        selectedSiteId: 'za-bayhead',
        localSiteContext,
      }),
    );

    result.current.captureInsightLoaded('text');

    expect(capture).toHaveBeenCalledWith(
      'ai_insight_loaded',
      expect.objectContaining({
        mode: 'local',
        cell_id: null,
        site_id: 'za-bayhead',
        has_mangrove: null,
      }),
    );
  });

  it('global mode: tags mode + cell_id and keeps the boolean has_mangrove', () => {
    const { result } = renderHook(() =>
      useAIAnalytics({
        mode: 'global',
        selectedCellId: 18684,
        cellHasMangrove: true,
      }),
    );

    result.current.captureInsightLoaded('text');

    expect(capture).toHaveBeenCalledWith(
      'ai_insight_loaded',
      expect.objectContaining({
        mode: 'global',
        cell_id: '18684',
        site_id: null,
        has_mangrove: true,
      }),
    );
  });

  it('skips events when the current mode has no subject', () => {
    const { result } = renderHook(() =>
      useAIAnalytics({ mode: 'local', selectedCellId: 18684 }),
    );

    result.current.captureInsightLoaded('text');

    expect(capture).not.toHaveBeenCalled();
  });
});
