import { Component, lazy, Suspense, useState, type ReactNode } from 'react';
import type { PlotParams } from 'react-plotly.js';
import { getLoadedChart, preloadCharts } from './preloadCharts';

interface ChartPlaceholderProps {
  height: number | string | undefined;
  failed?: boolean;
}

/** Same box as the chart, so nothing shifts when the chart arrives. */
export function ChartPlaceholder({ height, failed }: ChartPlaceholderProps) {
  if (failed) {
    return (
      <div
        className="flex items-center justify-center rounded bg-gray-50 text-xs text-gray-400"
        style={{ height }}
      >
        Chart could not load
      </div>
    );
  }
  return (
    <div
      role="status"
      aria-busy="true"
      className="animate-pulse rounded bg-gray-50 motion-reduce:animate-none"
      style={{ height }}
    >
      <span className="sr-only">Loading chart</span>
    </div>
  );
}

interface ChartErrorBoundaryProps {
  height: number | string | undefined;
  children: ReactNode;
}

/** Keeps a failed chart download, or a chart that throws, from taking down the panel around it. */
class ChartErrorBoundary extends Component<
  ChartErrorBoundaryProps,
  { failed: boolean }
> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    if (this.state.failed) {
      return <ChartPlaceholder height={this.props.height} failed />;
    }
    return this.props.children;
  }
}

/**
 * A Plotly chart whose code loads on demand. Takes react-plotly.js props;
 * shows a placeholder of the chart's height until Plotly has loaded.
 */
export function Plot(props: PlotParams) {
  const height = props.style?.height ?? props.layout.height;
  // Decided once per mount: switching paths later would remount (and redraw) the chart.
  const [LoadedChart] = useState(getLoadedChart);
  // One lazy() per mount, not per module: React.lazy keeps a failed load for
  // good, so a shared one would leave every later chart broken after a single
  // failed download. A fresh one calls preloadCharts() again, which retries.
  const [LazyPlotlyChart] = useState(() => lazy(preloadCharts));

  return (
    <ChartErrorBoundary height={height}>
      {LoadedChart ? (
        <LoadedChart {...props} />
      ) : (
        <Suspense fallback={<ChartPlaceholder height={height} />}>
          <LazyPlotlyChart {...props} />
        </Suspense>
      )}
    </ChartErrorBoundary>
  );
}
