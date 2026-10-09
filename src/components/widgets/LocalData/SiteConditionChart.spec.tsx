import { render, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { SiteConditionChart } from './SiteConditionChart';
import { SITE_CONDITION_COLORS } from '@/data/constants/localWetlands.constants';
import type { LocalObservation } from '@/data/types/local-wetlands.types';

interface CapturedTrace {
  x: string[];
  y: number[];
  error_y: { array: number[] };
  marker: { color: string[] };
}

interface CapturedPlot {
  data: CapturedTrace[];
  layout: { annotations: Array<{ x: string; text: string }> };
}

const plotProps = vi.hoisted(() => ({
  current: null as CapturedPlot | null,
}));

vi.mock('react-plotly.js', () => ({
  default: (props: CapturedPlot) => {
    plotProps.current = props;
    return null;
  },
}));

function obs(over: Partial<LocalObservation> = {}): LocalObservation {
  return {
    year: 2026,
    siteType: 'Reference',
    density: 10,
    se: 1,
    samplesN: 5,
    ...over,
  };
}

afterEach(() => {
  cleanup();
  plotProps.current = null;
});

describe('SiteConditionChart', () => {
  it('draws one bar per row with placeholders for missing conditions', () => {
    render(
      <SiteConditionChart
        observations={[
          obs({ density: 10, se: 1, samplesN: 5 }),
          obs({ density: 12, se: 2, samplesN: 6 }),
        ]}
        year={2026}
      />,
    );

    const trace = plotProps.current!.data[0];
    expect(trace.x).toEqual([
      'Reference 1',
      'Reference 2',
      'Degraded',
      'Rehabilitated',
    ]);
    expect(trace.y).toEqual([10, 12, 0, 0]);
    expect(trace.error_y.array).toEqual([1, 2, 0, 0]);
    expect(trace.marker.color).toEqual([
      SITE_CONDITION_COLORS.Reference,
      SITE_CONDITION_COLORS.Reference,
      SITE_CONDITION_COLORS.Degraded,
      SITE_CONDITION_COLORS.Rehabilitated,
    ]);

    const annotations = plotProps.current!.layout.annotations;
    expect(annotations.map((a) => a.x)).toEqual(trace.x);
    expect(annotations.map((a) => a.text)).toEqual([
      'n=5',
      'n=6',
      'n=0',
      'n=0',
    ]);
  });

  it('labels a single-row condition with the plain condition name', () => {
    render(
      <SiteConditionChart
        observations={[
          obs({ siteType: 'Reference' }),
          obs({ siteType: 'Degraded' }),
          obs({ siteType: 'Rehabilitated' }),
        ]}
        year={2026}
      />,
    );
    expect(plotProps.current!.data[0].x).toEqual([
      'Reference',
      'Degraded',
      'Rehabilitated',
    ]);
  });
});
