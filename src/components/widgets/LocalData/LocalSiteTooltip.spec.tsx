import { render, screen, cleanup } from '@testing-library/react';
import { describe, it, expect, afterEach } from 'vitest';
import { LocalSiteTooltip } from './LocalSiteTooltip';
import type {
  LocalSite,
  LocalObservation,
} from '@/data/types/local-wetlands.types';

function obs(over: Partial<LocalObservation> = {}): LocalObservation {
  return {
    year: 2026,
    siteType: 'Rehabilitated',
    species: '1',
    density: 24.9,
    se: 0.5,
    samplesN: 3,
    ...over,
  };
}

function makeSite(over: Partial<LocalSite> = {}): LocalSite {
  return {
    id: 'site-1',
    name: 'Bayhead',
    country: 'South Africa',
    coordinates: [31.0, -29.0],
    partnerId: 'uwc-za',
    availableYears: [2026],
    observations: [obs()],
    points: [
      { coordinates: [31.0, -29.0], condition: 'Reference' },
      { coordinates: [31.1, -29.1], condition: 'Degraded' },
      { coordinates: [31.2, -29.2], condition: 'Rehabilitated' },
    ],
    ...over,
  };
}

afterEach(cleanup);

describe('LocalSiteTooltip', () => {
  it('shows a single badge for the hovered condition (point mode)', () => {
    render(
      <LocalSiteTooltip
        site={makeSite()}
        name="Bayhead"
        country="South Africa"
        hoveredCondition="Rehabilitated"
      />,
    );
    expect(screen.getByText('Rehabilitated')).toBeInTheDocument();
    expect(screen.queryByText('Reference')).not.toBeInTheDocument();
    // Density for the hovered condition is shown.
    expect(screen.getByText('24.9 ind/m²')).toBeInTheDocument();
  });

  it('shows one badge per condition in order (site mode)', () => {
    render(
      <LocalSiteTooltip
        site={makeSite()}
        name="Bayhead"
        country="South Africa"
        hoveredCondition={null}
      />,
    );
    expect(screen.getByText('Reference')).toBeInTheDocument();
    expect(screen.getByText('Degraded')).toBeInTheDocument();
    expect(screen.getByText('Rehabilitated')).toBeInTheDocument();
  });

  it('shows "Data still to be analysed" and no density for a site without observations', () => {
    render(
      <LocalSiteTooltip
        site={makeSite({
          observations: [],
          availableYears: [],
          points: [{ coordinates: [31.0, -29.0], condition: 'Reference' }],
        })}
        name="Beachwood"
        country="South Africa"
        hoveredCondition={null}
      />,
    );
    expect(screen.getByText('Data still to be analysed')).toBeInTheDocument();
    expect(screen.queryByText(/ind\/m²/)).not.toBeInTheDocument();
  });

  it('renders a "Restored" badge with no density', () => {
    render(
      <LocalSiteTooltip
        site={makeSite({
          observations: [],
          availableYears: [],
          points: [{ coordinates: [39.5, 4.4], condition: 'Restored' }],
        })}
        name="Gazi"
        country="Kenya"
        hoveredCondition="Restored"
      />,
    );
    expect(screen.getByText('Restored')).toBeInTheDocument();
    expect(screen.queryByText(/ind\/m²/)).not.toBeInTheDocument();
  });
});
