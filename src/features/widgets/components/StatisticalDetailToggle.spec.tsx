import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, afterEach } from 'vitest';
import { StatisticalDetailToggle } from './StatisticalDetailToggle';
import type { AIStatisticalContextV1 } from '@/api/types';

function makeSummary(
  key: string,
  indicator: string,
  cellValue: number,
  percentile: number,
) {
  return {
    key,
    indicator,
    groupingLabel: 'Cluster_1',
    cellValue,
    min: 0,
    q1: 25,
    median: 50,
    q3: 75,
    max: 100,
    percentile,
    sampledDistribution: [],
  };
}

const ecologicalStats: AIStatisticalContextV1 = {
  summaries: [
    makeSummary('mang_fish_dens', 'Fish density', 2230, 83),
    makeSummary('mang_spec_score', 'Species threat score', 0.957, 86),
    makeSummary(
      'pressure_mangrove_climate_current',
      'Climate pressure',
      1.51,
      91,
    ),
    makeSummary('pressure_mangrove_climate_rate', 'Climate rate', 0.083, 66),
  ],
};

describe('StatisticalDetailToggle', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders the toggle button', () => {
    render(<StatisticalDetailToggle statistics={ecologicalStats} />);
    expect(screen.getByTestId('toggle-button')).toBeInTheDocument();
    expect(screen.getByTestId('toggle-button')).toHaveTextContent(
      'Show statistical detail',
    );
  });

  it('panel is hidden by default', () => {
    render(<StatisticalDetailToggle statistics={ecologicalStats} />);
    expect(screen.queryByTestId('stats-panel')).not.toBeInTheDocument();
  });

  it('opens panel when toggle button is clicked', () => {
    render(<StatisticalDetailToggle statistics={ecologicalStats} />);
    fireEvent.click(screen.getByTestId('toggle-button'));
    expect(screen.getByTestId('stats-panel')).toBeInTheDocument();
  });

  it('closes panel when toggle button is clicked again', () => {
    render(<StatisticalDetailToggle statistics={ecologicalStats} />);
    fireEvent.click(screen.getByTestId('toggle-button'));
    expect(screen.getByTestId('stats-panel')).toBeInTheDocument();
    fireEvent.click(screen.getByTestId('toggle-button'));
    expect(screen.queryByTestId('stats-panel')).not.toBeInTheDocument();
  });

  it('button has correct aria-expanded state', () => {
    render(<StatisticalDetailToggle statistics={ecologicalStats} />);
    const btn = screen.getByTestId('toggle-button');
    expect(btn).toHaveAttribute('aria-expanded', 'false');
    fireEvent.click(btn);
    expect(btn).toHaveAttribute('aria-expanded', 'true');
  });

  it('shows all three sections when open', () => {
    render(<StatisticalDetailToggle statistics={ecologicalStats} />);
    fireEvent.click(screen.getByTestId('toggle-button'));
    expect(screen.getByText('Ecological indicators')).toBeInTheDocument();
    expect(screen.getByText('Current pressures')).toBeInTheDocument();
    expect(screen.getByText('Pressure trends')).toBeInTheDocument();
  });

  it('renders fish density label and interpretation', () => {
    render(<StatisticalDetailToggle statistics={ecologicalStats} />);
    fireEvent.click(screen.getByTestId('toggle-button'));
    expect(screen.getByText('Fish density')).toBeInTheDocument();
    expect(screen.getByText('above typical range')).toBeInTheDocument();
  });

  it('uses inverted interpretation for species threat score', () => {
    render(<StatisticalDetailToggle statistics={ecologicalStats} />);
    fireEvent.click(screen.getByTestId('toggle-button'));
    expect(screen.getByText('above typical threat level')).toBeInTheDocument();
  });

  it('uses stress language for current pressure indicators', () => {
    render(<StatisticalDetailToggle statistics={ecologicalStats} />);
    fireEvent.click(screen.getByTestId('toggle-button'));
    expect(
      screen.getByText('exceptionally elevated stress'),
    ).toBeInTheDocument();
  });

  it('uses direction language for rate indicators', () => {
    render(<StatisticalDetailToggle statistics={ecologicalStats} />);
    fireEvent.click(screen.getByTestId('toggle-button'));
    expect(screen.getByText('increasing at typical rate')).toBeInTheDocument();
  });

  it('renders correct ordinal suffix', () => {
    render(<StatisticalDetailToggle statistics={ecologicalStats} />);
    fireEvent.click(screen.getByTestId('toggle-button'));
    expect(screen.getByText('83rd')).toBeInTheDocument();
  });

  it('shows citation in footer', () => {
    render(<StatisticalDetailToggle statistics={ecologicalStats} />);
    fireEvent.click(screen.getByTestId('toggle-button'));
    expect(screen.getByText(/Sievers et al\. \(2021\)/)).toBeInTheDocument();
  });

  it('returns null when summaries are empty', () => {
    render(<StatisticalDetailToggle statistics={{ summaries: [] }} />);
    expect(
      screen.queryByTestId('statistical-detail-toggle'),
    ).not.toBeInTheDocument();
  });
});
