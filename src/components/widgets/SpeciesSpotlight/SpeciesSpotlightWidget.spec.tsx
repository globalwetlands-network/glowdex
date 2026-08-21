import { render, screen, cleanup } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { SpeciesSpotlightWidget } from './SpeciesSpotlightWidget';
import { useSpeciesConfig } from '@/api/hooks/useSpeciesConfig';
import type { SpeciesConfigResponse } from '@/api/species';
import type { EnrichedGridCell } from '@/app/types/app.types';
import type { TypologyMap } from '@/data/types/cluster.types';

// ─── Mocks ───────────────────────────────────────────────────────────────────
//
// The widget's own responsibility is selection logic (loading → auto-select →
// empty state) driven by the backend config query. We stub the data hooks and
// the heavy child components so these tests exercise that logic in isolation.

vi.mock('posthog-js/react', () => ({
  usePostHog: () => ({ capture: vi.fn() }),
}));

vi.mock('@/api/hooks/useSpeciesConfig');

// SpeciesTab pulls its own observations query — stub it to just surface which
// species the widget resolved as active.
vi.mock('./SpeciesTab', () => ({
  SpeciesTab: ({ species }: { species: SpeciesConfigResponse }) => (
    <div data-testid="species-tab">{species.id}</div>
  ),
}));

vi.mock('@/components/shared/TileCapsule', () => ({
  TileCapsule: () => <div data-testid="tile-capsule" />,
}));

const mockUseSpeciesConfig = vi.mocked(useSpeciesConfig);

// ─── Fixtures ────────────────────────────────────────────────────────────────

function makeSpecies(
  overrides: Partial<SpeciesConfigResponse> & Pick<SpeciesConfigResponse, 'id'>,
): SpeciesConfigResponse {
  return {
    commonName: overrides.id,
    scientificName: 'Scientificus exampleus',
    conservationStatus: 'LC',
    iucnUrl: 'https://example.org',
    summaryText: 'Summary.',
    dataApplicability: 'Regional',
    dataSource: 'Source',
    learnMoreUrl: 'https://example.org',
    mapTipText: 'Show observations',
    partnerIds: [],
    regionBounds: [],
    ...overrides,
  };
}

// Katala matches a cell inside Palawan; fiddler-crab matches partner 'uwc-za'.
const KATALA = makeSpecies({
  id: 'katala',
  commonName: 'Philippine Cockatoo',
  conservationStatus: 'CR',
  partnerIds: ['katala-foundation-ph'],
  regionBounds: [{ label: 'Palawan', lat: [7.5, 12.0], lng: [117.0, 120.5] }],
});
const FIDDLER = makeSpecies({
  id: 'fiddler-crab',
  commonName: 'Fiddler Crab',
  partnerIds: ['uwc-za'],
  regionBounds: [
    { label: 'Southern Africa', lat: [-35.0, -12.0], lng: [28.0, 38.0] },
  ],
});
const SPECIES = [KATALA, FIDDLER];

function makeCell(
  latitude: number,
  longitude: number,
  id = 1,
): EnrichedGridCell {
  return {
    id,
    centerCoords: { latitude, longitude },
  } as unknown as EnrichedGridCell;
}

/** Sets the mocked config query to a loaded or still-loading state. */
function setConfig(species: SpeciesConfigResponse[] | undefined) {
  mockUseSpeciesConfig.mockReturnValue({
    data: species ? { species } : undefined,
  } as unknown as ReturnType<typeof useSpeciesConfig>);
}

const baseProps = {
  onSpeciesLayerToggle: vi.fn(),
  partners: [],
  typologies: {} as TypologyMap,
  currentScale: 'scale5' as const,
  onNavigateToAnalysis: vi.fn(),
};

const EMPTY_STATE = /No spotlight species documented for this region yet/i;

afterEach(() => {
  vi.clearAllMocks();
  cleanup();
});

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('SpeciesSpotlightWidget', () => {
  it('renders a tab for every species delivered by the backend config', () => {
    setConfig(SPECIES);
    render(<SpeciesSpotlightWidget {...baseProps} selectedCell={null} />);

    expect(
      screen.getByRole('button', { name: /Philippine Cockatoo/ }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Fiddler Crab/ }),
    ).toBeInTheDocument();
  });

  it('does not flash the empty state while the config query is still loading', () => {
    // Cell selected, but config has not resolved yet → no tabs, no empty state.
    setConfig(undefined);
    render(
      <SpeciesSpotlightWidget
        {...baseProps}
        selectedCell={makeCell(9.5, 118.5)}
      />,
    );

    expect(screen.queryByText(EMPTY_STATE)).not.toBeInTheDocument();
    expect(screen.queryByTestId('species-tab')).not.toBeInTheDocument();
  });

  it('shows the empty state when a cell is selected, config is loaded, and nothing matches', () => {
    // (0, 0) falls outside every species' region bounds and there are no partners.
    setConfig(SPECIES);
    render(
      <SpeciesSpotlightWidget {...baseProps} selectedCell={makeCell(0, 0)} />,
    );

    expect(screen.getByText(EMPTY_STATE)).toBeInTheDocument();
    expect(screen.queryByTestId('species-tab')).not.toBeInTheDocument();
  });

  it('auto-selects the species whose region bounds contain the selected cell', () => {
    // (9.5, 118.5) is inside Katala's Palawan bounds.
    setConfig(SPECIES);
    render(
      <SpeciesSpotlightWidget
        {...baseProps}
        selectedCell={makeCell(9.5, 118.5)}
      />,
    );

    expect(screen.getByTestId('species-tab')).toHaveTextContent('katala');
  });

  it('auto-selects the species linked to a directly-clicked partner', () => {
    // clickedPartnerId matches fiddler-crab's partnerIds (Tier 1a, no cell needed).
    setConfig(SPECIES);
    render(
      <SpeciesSpotlightWidget
        {...baseProps}
        selectedCell={null}
        clickedPartnerId="uwc-za"
      />,
    );

    expect(screen.getByTestId('species-tab')).toHaveTextContent('fiddler-crab');
  });
});
