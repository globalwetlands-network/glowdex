import Plot from 'react-plotly.js';
import type { SpeciesPopulationSegment } from '@/data/speciesSpotlight';

interface SpeciesDonutChartProps {
  segments: SpeciesPopulationSegment[];
}

export function SpeciesDonutChart({ segments }: SpeciesDonutChartProps) {
  const data: Plotly.Data[] = [
    {
      type: 'pie',
      hole: 0.65,
      values: segments.map((s) => s.value),
      labels: segments.map((s) => s.label),
      marker: {
        colors: segments.map((s) => s.color),
      },
      textinfo: 'none',
      hoverinfo: 'label+value',
      showlegend: false,
    },
  ];

  const layout: Partial<Plotly.Layout> = {
    width: 200,
    height: 200,
    showlegend: false,
    margin: { t: 0, b: 0, l: 0, r: 0 },
    paper_bgcolor: 'transparent',
    plot_bgcolor: 'transparent',
  };

  return (
    <Plot
      data={data}
      layout={layout}
      config={{ displayModeBar: false, staticPlot: true }}
      style={{ width: '200px', height: '200px' }}
    />
  );
}
