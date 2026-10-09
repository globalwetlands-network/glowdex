import { render, screen, cleanup } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ComponentProps } from 'react';
import { describe, expect, it, vi, afterEach } from 'vitest';
import type { InsightResponse, LocalSiteContext } from '@/api/types';
import { ChatInterface } from './ChatInterface';

vi.mock('posthog-js/react', () => ({
  usePostHog: () => ({ capture: vi.fn() }),
}));

const insight: InsightResponse = {
  gridCellId: 21812,
  text: 'An example insight.',
  meta: { latencyMs: 0, totalTokensUsed: 0 },
};

function renderChat(props: Partial<Parameters<typeof ChatInterface>[0]> = {}) {
  return render(
    <QueryClientProvider client={new QueryClient()}>
      <ChatInterface
        selectedCellId={21812}
        initialInsight={insight}
        {...props}
      />
    </QueryClientProvider>,
  );
}

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

/** Renders with exactly the given props (no defaults) — GLO-207 cases. */
function renderChatWith(props: ComponentProps<typeof ChatInterface>) {
  render(
    <QueryClientProvider client={new QueryClient()}>
      <ChatInterface {...props} />
    </QueryClientProvider>,
  );
}

describe('ChatInterface', () => {
  it('marks the assistant as Beta, with the same badge as the landing page', () => {
    renderChat();

    expect(screen.getByText('Beta')).toHaveClass('rounded-full', 'uppercase');
  });

  it('shows the disclaimer and the Sievers et al. (2021) source', () => {
    renderChat();

    expect(screen.getByText(/AI-generated interpretation/)).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: /Sievers et al\. \(2021\)/ }),
    ).toHaveAttribute('href', 'https://doi.org/10.1016/j.ecolind.2021.108141');
  });

  it('shows or hides suggested questions via showSuggestions', () => {
    const { unmount } = renderChat({ showSuggestions: true });
    expect(screen.getByText('Suggested questions')).toBeInTheDocument();
    unmount();

    renderChat({ showSuggestions: false });
    expect(screen.queryByText('Suggested questions')).not.toBeInTheDocument();
  });

  it('keeps the input and suggestions interactive by default', () => {
    renderChat({ showSuggestions: true });

    expect(
      screen.getByPlaceholderText('Ask a follow-up question...'),
    ).toBeEnabled();
    expect(
      screen.getByRole('button', {
        name: 'What are the main ecological signals here?',
      }),
    ).toBeEnabled();
    expect(
      screen.getByRole('button', { name: 'Dismiss suggested questions' }),
    ).toBeInTheDocument();
  });

  it('disables the input and suggestions and shows the hint when readOnly', () => {
    renderChat({
      showSuggestions: true,
      readOnly: true,
      readOnlyHint: <a href="/map">Try it in the map</a>,
    });

    expect(
      screen.getByPlaceholderText('Ask a follow-up question...'),
    ).toBeDisabled();
    expect(
      screen.getByRole('button', {
        name: 'What are the main ecological signals here?',
      }),
    ).toBeDisabled();
    expect(
      screen.queryByRole('button', { name: 'Dismiss suggested questions' }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'Try it in the map' }),
    ).toBeInTheDocument();
  });

  it('highlights the given phrases in assistant messages, and nothing by default', () => {
    const { container, unmount } = renderChat();
    expect(container.querySelector('mark')).toBeNull();
    unmount();

    renderChat({ highlights: ['example insight'] });
    expect(
      screen.getByText('example insight', { selector: 'mark' }),
    ).toBeInTheDocument();
  });
});

describe('ChatInterface sources (GLO-207)', () => {
  afterEach(() => cleanup());

  it('global mode falls back to Sievers 2021 when no source is returned', () => {
    renderChatWith({
      mode: 'global',
      selectedCellId: 18684,
      initialInsight: makeInsight({ gridCellId: 18684 }),
    });

    expect(
      screen.getByText(/Sievers et al\. \(2021\) Ecological Indicators/),
    ).toBeInTheDocument();
  });

  it('local mode shows the partner field-monitoring source, never Sievers', () => {
    renderChatWith({
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
    renderChatWith({
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
    renderChatWith({
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
    renderChatWith({
      mode: 'local',
      selectedSiteId: null,
      localSiteContext: null,
    });

    expect(
      screen.getByText(
        'Select a monitoring location to view contextual analysis.',
      ),
    ).toBeInTheDocument();
    expect(screen.queryByText(/grid cell/i)).not.toBeInTheDocument();
  });

  it('local mode shows a DOI-less source as plain text, never linked to Sievers', () => {
    renderChatWith({
      mode: 'local',
      selectedSiteId: 'za-mngazana',
      localSiteContext,
      initialInsight: makeInsight({
        sources: [{ citation: 'UWC field survey 2026', section: 'Methods' }],
      }),
    });

    expect(screen.getByText('UWC field survey 2026')).toBeInTheDocument();
    expect(
      screen.queryByRole('link', { name: /UWC field survey/ }),
    ).not.toBeInTheDocument();
    expect(screen.queryByText(/Sievers/)).not.toBeInTheDocument();
  });
});
