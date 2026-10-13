import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { fetchInsight } from '@/api';
import { fetchDatasetMeta } from '@/api/meta';
import type { InsightResponse, LocalSiteContext } from '@/api/types';
import { AnalysisAssistantWidget } from './AnalysisAssistantWidget';

vi.mock('@/api', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/api')>()),
  fetchInsight: vi.fn(),
}));
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

  describe('local mode', () => {
    afterEach(() => vi.mocked(fetchInsight).mockReset());

    const context: LocalSiteContext = {
      siteName: 'Bayhead',
      country: 'South Africa',
      partner: 'Bayhead',
      year: 2026,
      conditions: [
        {
          siteType: 'Reference',
          totalDensity: 11.3,
          combinedSE: 3,
          samplesN: 5,
        },
      ],
    };

    function renderLocal(props: {
      localSiteContext: LocalSiteContext | null;
      isLocalContextPending?: boolean;
    }) {
      const client = new QueryClient({
        defaultOptions: { queries: { retry: false } },
      });
      const ui = (p: typeof props) => (
        <QueryClientProvider client={client}>
          <AnalysisAssistantWidget
            mode="local"
            selectedSiteId="za-bayhead"
            {...p}
          />
        </QueryClientProvider>
      );
      const result = render(ui(props));
      return {
        ...result,
        rerenderWith: (p: typeof props) => result.rerender(ui(p)),
      };
    }

    it('shows a loading state, not "select a location", while partner data loads', () => {
      renderLocal({ localSiteContext: null, isLocalContextPending: true });

      expect(
        screen.queryByText(/Select a monitoring location/),
      ).not.toBeInTheDocument();
      expect(fetchInsight).not.toHaveBeenCalled();
      // The header and Beta badge are there from the start.
      expect(
        screen.getByRole('heading', { name: 'Mangrove Analysis Assistant' }),
      ).toBeInTheDocument();
      expect(screen.getByText('Beta')).toBeInTheDocument();
    });

    it('shows the header with the site while the answer loads', () => {
      vi.mocked(fetchInsight).mockReturnValue(new Promise(() => {}));
      renderLocal({ localSiteContext: context });

      expect(screen.getByRole('status')).toBeInTheDocument();
      expect(screen.getByText('Beta')).toBeInTheDocument();
      expect(screen.getByText('Bayhead · South Africa')).toBeInTheDocument();
    });

    it('fetches a fresh answer when the site context changes (e.g. the partner name arrives)', async () => {
      vi.mocked(fetchInsight).mockResolvedValue({
        gridCellId: null,
        text: 'Field summary.',
        sources: [],
        meta: { latencyMs: 0, totalTokensUsed: 0 },
      });
      const { rerenderWith } = renderLocal({ localSiteContext: context });
      await waitFor(() => expect(fetchInsight).toHaveBeenCalledTimes(1));

      rerenderWith({
        localSiteContext: {
          ...context,
          partner: 'University of the Western Cape',
        },
      });

      await waitFor(() => expect(fetchInsight).toHaveBeenCalledTimes(2));
      expect(vi.mocked(fetchInsight).mock.calls[1][0]).toMatchObject({
        mode: 'local',
        localSiteContext: { partner: 'University of the Western Cape' },
      });
    });
  });

  it('shows the header, Beta badge and cell while a global answer loads', () => {
    vi.mocked(fetchInsight).mockReturnValue(new Promise(() => {}));
    render(
      <QueryClientProvider client={new QueryClient()}>
        <AnalysisAssistantWidget mode="global" selectedCellId={18684} />
      </QueryClientProvider>,
    );

    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Mangrove Analysis Assistant' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Beta')).toBeInTheDocument();
    expect(screen.getByText('Cell ID: 18684')).toBeInTheDocument();
    vi.mocked(fetchInsight).mockReset();
  });
});
