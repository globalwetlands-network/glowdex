import { render, screen, cleanup } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ComponentProps } from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { ChatInterface } from './ChatInterface';
import type { InsightResponse, LocalSiteContext } from '@/api/types';

vi.mock('posthog-js/react', () => ({
  usePostHog: () => ({ capture: vi.fn() }),
}));

const localSiteContext: LocalSiteContext = {
  siteName: 'Mngazana',
  country: 'South Africa',
  partner: 'University of the Western Cape (UWC)',
  year: 2026,
  conditions: [
    { siteType: 'Reference', totalDensity: 28.3, combinedSE: 2.4, samplesN: 6 },
  ],
};

function makeInsight(
  overrides: Partial<InsightResponse> = {},
): InsightResponse {
  return {
    gridCellId: null,
    text: 'Field monitoring summary.',
    sources: [],
    meta: { latencyMs: 1, totalTokensUsed: 1 },
    ...overrides,
  };
}

function renderChat(props: ComponentProps<typeof ChatInterface>) {
  render(
    <QueryClientProvider client={new QueryClient()}>
      <ChatInterface {...props} />
    </QueryClientProvider>,
  );
}

describe('ChatInterface sources (GLO-207)', () => {
  afterEach(() => cleanup());

  it('global mode falls back to Sievers 2021 when no source is returned', () => {
    renderChat({
      mode: 'global',
      selectedCellId: 18684,
      initialInsight: makeInsight({ gridCellId: 18684 }),
    });

    expect(
      screen.getByText(/Sievers et al\. \(2021\) Ecological Indicators/),
    ).toBeInTheDocument();
  });

  it('local mode shows the partner field-monitoring source, never Sievers', () => {
    renderChat({
      mode: 'local',
      selectedSiteId: 'za-mngazana',
      localSiteContext,
      initialInsight: makeInsight(),
    });

    expect(
      screen.getByText(
        'Source: University of the Western Cape (UWC) field monitoring (2026)',
      ),
    ).toBeInTheDocument();
    expect(screen.queryByText(/Sievers/)).not.toBeInTheDocument();
  });

  it('still renders the "AI-generated, verify with an expert" caption when sources is empty', () => {
    renderChat({
      mode: 'local',
      selectedSiteId: 'za-mngazana',
      localSiteContext,
      initialInsight: makeInsight({ sources: [] }),
    });

    expect(
      screen.getByText(
        /AI-generated interpretation · Always verify with an expert/,
      ),
    ).toBeInTheDocument();
  });

  it('local mode labels the conversation by site, with no cell or tile wording', () => {
    renderChat({
      mode: 'local',
      selectedSiteId: 'za-mngazana',
      localSiteContext,
      initialInsight: makeInsight(),
    });

    expect(screen.getByText('Mngazana · South Africa')).toBeInTheDocument();
    expect(screen.queryByText(/Cell ID/)).not.toBeInTheDocument();
    expect(screen.queryByText(/tile/i)).not.toBeInTheDocument();
  });

  it('local mode empty state asks for a monitoring location, not a grid cell', () => {
    renderChat({ mode: 'local', selectedSiteId: null, localSiteContext: null });

    expect(
      screen.getByText(
        'Select a monitoring location to view contextual analysis.',
      ),
    ).toBeInTheDocument();
    expect(screen.queryByText(/grid cell/i)).not.toBeInTheDocument();
  });
});
