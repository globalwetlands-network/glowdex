import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Stands in for the Plotly bundle; shows which trace type it was given.
const fakeChartModule = vi.hoisted(() => () => ({
  default: (props: { data: Array<{ type: string }> }) => (
    <div data-testid="plotly-chart">{props.data[0].type}</div>
  ),
}));
vi.mock('./PlotlyChart', fakeChartModule);

// The chart code is cached per module, so each test starts from a fresh, cold copy.
let Plot: typeof import('./Plot').Plot;
let preloadCharts: typeof import('./preloadCharts').preloadCharts;
beforeEach(async () => {
  vi.restoreAllMocks();
  vi.resetModules();
  ({ Plot } = await import('./Plot'));
  ({ preloadCharts } = await import('./preloadCharts'));
});

describe('Plot', () => {
  it('shows a placeholder of the chart height until the chart code loads', async () => {
    render(
      <Plot
        data={[{ type: 'violin' }]}
        layout={{ height: 80 }}
        style={{ width: '100%', height: '80px' }}
      />,
    );

    const placeholder = screen.getByRole('status');
    expect(placeholder).toHaveTextContent('Loading chart');
    expect(placeholder).toHaveStyle({ height: '80px' });

    expect(await screen.findByTestId('plotly-chart')).toHaveTextContent(
      'violin',
    );
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('sizes the placeholder from layout.height when style has no height', async () => {
    render(<Plot data={[{ type: 'bar' }]} layout={{ height: 220 }} />);

    expect(screen.getByRole('status')).toHaveStyle({ height: '220px' });
    await screen.findByTestId('plotly-chart');
  });

  it('renders at once, without a placeholder, once the chart code has loaded', async () => {
    await preloadCharts();
    render(<Plot data={[{ type: 'bar' }]} layout={{ height: 220 }} />);

    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    expect(screen.getByTestId('plotly-chart')).toHaveTextContent('bar');
  });

  it('shows an error for a failed download, and a later chart retries it', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.resetModules();
    vi.doMock('./PlotlyChart', () => {
      throw new Error('Failed to fetch dynamically imported module');
    });
    ({ Plot } = await import('./Plot'));
    const { unmount } = render(
      <Plot data={[{ type: 'bar' }]} layout={{ height: 220 }} />,
    );
    expect(await screen.findByText('Chart could not load')).toBeInTheDocument();
    unmount();

    // The network is back: the next chart must fetch again, not reuse the failure.
    vi.doMock('./PlotlyChart', fakeChartModule);
    render(<Plot data={[{ type: 'violin' }]} layout={{ height: 80 }} />);
    expect(await screen.findByTestId('plotly-chart')).toHaveTextContent(
      'violin',
    );
  });

  it('fetches the chart code only once', () => {
    expect(preloadCharts()).toBe(preloadCharts());
  });
});
