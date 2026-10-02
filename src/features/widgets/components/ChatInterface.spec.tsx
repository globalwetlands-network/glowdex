import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, expect, it, vi } from 'vitest';
import type { InsightResponse } from '@/api/types';
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

describe('ChatInterface', () => {
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
