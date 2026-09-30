import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, expect, it, vi } from 'vitest';
import { fetchInsight } from '@/api';
import { fetchDatasetMeta } from '@/api/meta';
import type { InsightResponse } from '@/api/types';
import { AnalysisAssistantWidget } from './AnalysisAssistantWidget';

vi.mock('@/api', () => ({ fetchInsight: vi.fn() }));
vi.mock('@/api/meta', () => ({ fetchDatasetMeta: vi.fn() }));
vi.mock('posthog-js/react', () => ({
  usePostHog: () => ({ capture: vi.fn() }),
}));

const staticInsight: InsightResponse = {
  gridCellId: 21812,
  text: 'A static example insight.',
  meta: { latencyMs: 0, totalTokensUsed: 0 },
};

describe('AnalysisAssistantWidget', () => {
  it('renders a static insight without calling the backend', () => {
    render(
      <QueryClientProvider client={new QueryClient()}>
        <AnalysisAssistantWidget
          selectedCellId={21812}
          staticInsight={staticInsight}
        />
      </QueryClientProvider>,
    );

    expect(screen.getByText('A static example insight.')).toBeInTheDocument();
    expect(fetchInsight).not.toHaveBeenCalled();
    expect(fetchDatasetMeta).not.toHaveBeenCalled();
  });
});
