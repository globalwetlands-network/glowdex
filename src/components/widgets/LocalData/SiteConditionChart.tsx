/**
 * SiteConditionChart
 *
 * Grouped bar chart showing total crab density (ind. m⁻²)
 * per site condition (Reference / Degraded / Rehabilitated)
 * for a single monitoring site and year.
 *
 * Uses Plotly (react-plotly.js) — consistent with the
 * existing ViolinPlot component.
 *
 * Design decisions:
 * - Three bars side by side on a shared dynamic Y-axis
 * - Error bars show ±SE (combined across species)
 * - n= sample count shown as annotation below each bar
 * - Muted ecological colours per condition:
 *     Reference:      #4a7c59 (deep sage green)
 *     Degraded:       #b85c4a (muted terracotta)
 *     Rehabilitated:  #c49a3c (warm amber)
 * - Dynamic Y-axis — mirrors the updated reference
 *   implementation which uses scale_y_continuous(limits =
 *   c(0, NA)) rather than a fixed global max
 */

import Plot from 'react-plotly.js';
import type { LocalObservation } from '@/data/types/local-wetlands.types';
import { aggregateByCondition } from '@/data/transforms/aggregateLocalObservations';
import { SITE_CONDITION_COLORS } from '@/data/constants/localWetlands.constants';

interface SiteConditionChartProps {
  observations: LocalObservation[];
  year: number;
}

export function SiteConditionChart({
  observations,
  year,
}: SiteConditionChartProps) {
  const aggregated = aggregateByCondition(observations, year);

  const trace: Partial<Plotly.Data> = {
    type: 'bar',
    x: aggregated.map((a) => a.siteType),
    y: aggregated.map((a) => a.totalDensity),
    error_y: {
      type: 'data',
      array: aggregated.map((a) => a.combinedSE),
      visible: true,
      color: '#333333',
      thickness: 1.5,
      width: 6,
    },
    marker: {
      color: aggregated.map((a) => SITE_CONDITION_COLORS[a.siteType]),
      opacity: 0.85,
      line: {
        color: aggregated.map((a) => SITE_CONDITION_COLORS[a.siteType]),
        width: 1,
      },
    },
    width: 0.5,
    hovertemplate:
      '<b>%{x}</b><br>' + 'Density: %{y:.2f} ind. m⁻²<br>' + '<extra></extra>',
    showlegend: false,
  };

  const layout: Partial<Plotly.Layout> = {
    margin: { t: 8, b: 48, l: 48, r: 8 },
    height: 220,
    xaxis: {
      showgrid: false,
      zeroline: false,
      tickfont: { size: 11, color: '#374151' },
    },
    yaxis: {
      title: {
        text: 'Crab density (individuals/m²)',
        font: { size: 10, color: '#6b7280' },
      },
      zeroline: true,
      zerolinecolor: '#e5e7eb',
      gridcolor: '#f3f4f6',
      tickfont: { size: 10, color: '#9ca3af' },
      rangemode: 'tozero',
    },
    plot_bgcolor: 'transparent',
    paper_bgcolor: 'transparent',
    dragmode: false,
    annotations: aggregated.map((a) => ({
      x: a.siteType,
      y: 0,
      yref: 'y',
      yanchor: 'top',
      yshift: -24,
      text: `n=${a.samplesN}`,
      showarrow: false,
      font: { size: 9, color: '#9ca3af' },
    })),
  };

  return (
    <Plot
      data={[trace]}
      layout={layout}
      config={{ displayModeBar: false, staticPlot: false }}
      style={{ width: '100%' }}
      useResizeHandler={true}
    />
  );
}
