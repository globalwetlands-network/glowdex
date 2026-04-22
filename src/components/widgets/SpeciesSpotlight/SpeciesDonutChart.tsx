import Plot from 'react-plotly.js';
import type { SpeciesPopulationSegment } from '@/data/speciesSpotlight';

interface SpeciesDonutChartProps {
  segments: SpeciesPopulationSegment[];
}

export function SpeciesDonutChart({ segments }: SpeciesDonutChartProps) {
  const total = segments.reduce((sum, s) => sum + s.value, 0);

  const data: Plotly.Data[] = [
    {
      type: 'pie',
      hole: 0.65,
      values: segments.map((s) => s.value),
      labels: segments.map((s) => s.label),
      marker: {
        colors: segments.map((s) => s.color),
        line: {
          color: '#ffffff',
          width: 2,
        },
      },
      textinfo: 'none',
      hovertemplate:
        '<b>%{label}</b><br>' +
        '%{value:,} individuals<br>' +
        '%{percent}<extra></extra>',
      hoverlabel: {
        bgcolor: '#1f2937',
        bordercolor: '#1f2937',
        font: { color: '#ffffff', size: 12 },
      },
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
    annotations: [
      {
        text: `<b>${total.toLocaleString()}</b><br><span style="font-size:10px">Total</span>`,
        showarrow: false,
        font: { size: 14, color: '#374151' },
      },
    ],
  };

  return (
    <Plot
      data={data}
      layout={layout}
      config={{ displayModeBar: false, staticPlot: false }}
      style={{ width: '200px', height: '200px' }}
    />
  );
}
