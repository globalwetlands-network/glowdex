import Plot from 'react-plotly.js';
import type { Layout, Data } from 'plotly.js';

interface ViolinPlotProps {
  data: number[]; // Array of values to plot (e.g. residuals)
  title: string;
  color?: string;
  height?: number;
}

export function ViolinPlot({ data, title, color = '#8884d8', height = 250 }: ViolinPlotProps) {

  const plotData: Data[] = [
    {
      type: 'violin',
      y: data,
      points: false, // Don't show all points for performance
      box: {
        visible: true // Show box plot inside violin
      },
      line: {
        color: color,
        width: 1
      },
      fillcolor: color,
      opacity: 0.6,
      meanline: {
        visible: true
      },
      name: title,
      hoverinfo: 'y',
    } as Data
  ];

  const layout: Partial<Layout> = {
    title: {
      text: title,
      font: { size: 12, family: 'Inter, sans-serif' }
    },
    margin: { l: 40, r: 10, t: 30, b: 30 },
    height: height,
    showlegend: false,
    yaxis: {
      zeroline: false,
      gridcolor: '#f0f0f0',
      fixedrange: true // Disable zoom for simple widget
    },
    xaxis: {
      fixedrange: true
    },
    paper_bgcolor: 'rgba(0,0,0,0)',
    plot_bgcolor: 'rgba(0,0,0,0)',
  };

  const config = {
    displayModeBar: false, // Hide toolbar
    responsive: true,
  };

  return (
    <div className="w-full bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
      <Plot
        data={plotData}
        layout={layout}
        config={config}
        style={{ width: '100%', height: '100%' }}
        useResizeHandler={true}
      />
    </div>
  );
}
