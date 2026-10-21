import { Component, lazy, Suspense, useState, type ReactNode } from 'react';
import type { PlotParams } from 'react-plotly.js';
import { getLoadedChart, preloadCharts } from './preloadCharts';

const LazyPlotlyChart = lazy(preloadCharts);

interface ChartPlaceholderProps {
  height: number | string | undefined;
  failed?: boolean;
}

/** Same box as the chart, so nothing shifts when the chart arrives. */
export function ChartPlaceholder({ height, failed }: ChartPlaceholderProps) {
  if (failed) {
    // Only a reload helps: browsers keep a failed dynamic import for the life
    // of the page and never fetch that chunk again (e.g. an old chunk hash
    // after a deploy), so an in-page retry can't recover.
    return (
      <div
        className="flex items-center justify-center gap-2 rounded bg-gray-50 text-xs text-gray-500"
        style={{ height }}
      >
        Chart could not load.
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="cursor-pointer rounded underline hover:text-gray-700 focus-visible:ring-2 focus-visible:ring-glowdex-teal focus-visible:outline-none"
        >
          Reload page
        </button>
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
 * shows a placeholder of the chart's height until Plotly has loaded, and a
 * reload button if it fails.
 */
export function Plot(props: PlotParams) {
  const height = props.style?.height ?? props.layout.height;
  // Decided once per mount: switching paths later would remount (and redraw) the chart.
  const [LoadedChart] = useState(getLoadedChart);

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
