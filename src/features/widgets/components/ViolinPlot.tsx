import Plot from 'react-plotly.js';
import type { IndicatorDistribution } from '../types/indicator.types';
import type { AIStatisticalIndicatorSummary } from '@/api';
import { ChartAIInsights } from './ChartAIInsights';

interface GroupedViolinPlotProps {
  distributions: Record<string, IndicatorDistribution[]>;
  isLoading?: boolean;
  selectedCellId: number | null;
  statisticalSummaries?: AIStatisticalIndicatorSummary[];
  onAskAI?: (prompt: string) => void;
}

export function GroupedViolinPlot({
  distributions,
  isLoading,
  selectedCellId,
  statisticalSummaries,
  onAskAI
}: GroupedViolinPlotProps) {
  if (isLoading) {
    return <div className="h-64 bg-gray-50 animate-pulse rounded-lg" />;
  }

  const dimensions = Object.keys(distributions);

  if (dimensions.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400 text-sm">
        No data available for current filters.
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {dimensions.map(dimension => (
        <div key={dimension} className="space-y-4">
          <h3 className="text-sm font-bold text-gray-700 border-b border-gray-200 pb-2">
            {dimension}
          </h3>

          <div className="space-y-1">
            {distributions[dimension].map((dist) => (
              <SingleIndicatorRow
                key={dist.indicator.key}
                distribution={dist}
                statisticalSummaries={statisticalSummaries}
                selectedCellId={selectedCellId}
                onAskAI={onAskAI}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// Removed fragile KEY_TO_BACKEND_LABEL mapping

function SingleIndicatorRow({
  distribution,
  statisticalSummaries,
  selectedCellId,
  onAskAI
}: {
  distribution: IndicatorDistribution;
  statisticalSummaries?: AIStatisticalIndicatorSummary[];
  selectedCellId: number | null;
  onAskAI?: (prompt: string) => void;
}) {
  const { indicator, values, selectedValue } = distribution;

  const match = statisticalSummaries?.find(s => s.key === indicator.key);

  const trace: Partial<Plotly.Data> = {
    type: 'violin',
    x: values, // Horizontal violin
    points: false, // Don't show all points
    box: { visible: true, width: 0.2 },
    line: { color: '#3b82f6', width: 1 },
    fillcolor: 'rgba(59, 130, 246, 0.3)',
    orientation: 'h', // Horizontal
    hoverinfo: 'skip',
    showlegend: false,
    width: 0.8,
  };

  const layout: Partial<Plotly.Layout> = {
    margin: { t: 0, b: 20, l: 0, r: 0 }, // Tight margins
    height: 80, // Very compact
    xaxis: {
      zeroline: false,
      showgrid: true,
      gridcolor: '#f3f4f6',
      tickfont: { size: 10, color: '#9ca3af' },
    },
    yaxis: {
      showticklabels: false,
      showgrid: false,
      zeroline: false,
    },
    hovermode: 'closest',
    dragmode: false,
  };

  if (selectedValue !== undefined) {
    layout.shapes = [
      {
        type: 'line',
        x0: selectedValue,
        x1: selectedValue,
        y0: 0,
        y1: 1,
        yref: 'paper',
        line: {
          color: 'rgba(225,29,72,0.4)',
          width: 1,
          dash: 'dot'
        }
      }
    ];
  }

  // If selected value exists, add a marker trace
  const data = [trace];
  if (selectedValue !== undefined) {
    data.push({
      type: 'scatter',
      x: [selectedValue],
      y: [0], // Center of violin (violin is centered at 0 on local y-axis for single trace)
      // Actually violin positioning in 'h' mode is on y-axis categories.
      // If we don't provide y, it defaults to 'trace 0'.
      // We need to match the violin's y-position.
      // For a single violin, it's usually at y=0 or y='trace name'.
      // Let's explicit set y=[''] for violin and marker.
      mode: 'markers',
      marker: {
        symbol: 'diamond',
        size: 10,
        color: '#E11D48',
        line: { color: '#FFFFFF', width: 2 }
      },
      hovertemplate: "This location<br>%{x}<extra></extra>",
      name: 'Selected',
      showlegend: false
    } as Plotly.Data);
  }

  // Override violin y to align with marker
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (trace as any).y0 = 0;

  return (
    <div className="flex flex-col">
      <div className="flex justify-between items-baseline mb-1">
        <span className="text-xs font-medium text-gray-600 truncate" title={indicator.label}>
          {indicator.label}
        </span>
        {selectedValue !== undefined && (
          <span className="text-xs font-mono text-pink-600 bg-pink-50 px-1.5 rounded">
            {selectedValue.toFixed(2)}
          </span>
        )}
      </div>
      <div className="relative border-l-2 border-gray-100 pl-2">
        <Plot
          data={data}
          layout={layout}
          config={{ displayModeBar: false, staticPlot: false }}
          style={{ width: '100%', height: '80px' }}
          useResizeHandler={true}
        />
        {match && match.cellValue !== undefined && selectedCellId && onAskAI && (
          <ChartAIInsights
            indicatorName={indicator.label}
            value={match.cellValue}
            percentile={match.percentile}
            q1={match.q1}
            q3={match.q3}
            selectedCellId={selectedCellId}
            onAskAI={onAskAI}
          />
        )}
      </div>
    </div>
  );
}
