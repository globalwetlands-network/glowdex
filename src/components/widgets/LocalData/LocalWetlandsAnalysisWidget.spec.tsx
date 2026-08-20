import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { LocalWetlandsAnalysisWidget } from './LocalWetlandsAnalysisWidget';
import type { LocalSite } from '@/data/types/local-wetlands.types';

// The widget resolves partner links via usePartners (TanStack Query)
// and captures analytics via usePostHog. Neither is exercised here,
// so both are stubbed out.
vi.mock('@/api/hooks/usePartners', () => ({
  usePartners: () => ({ data: { partners: [] } }),
}));

vi.mock('posthog-js/react', () => ({
  usePostHog: () => ({ capture: vi.fn() }),
}));

function makeSite(overrides: Partial<LocalSite> = {}): LocalSite {
  return {
    id: 'site-1',
    name: 'Site One',
    country: 'Kenya',
    coordinates: [39.6, -4.0],
    partnerId: null,
    availableYears: [],
    observations: [],
    ...overrides,
  };
}

const noDataSite = makeSite({
  id: 'no-data',
  name: 'No Data Site',
  availableYears: [], // no analysed data -> "Data still to be analysed"
});

const otherSite = makeSite({
  id: 'other',
  name: 'Other Site',
  availableYears: [],
});

const localSites: LocalSite[] = [noDataSite, otherSite];

function renderWidget(
  overrides: Partial<Parameters<typeof LocalWetlandsAnalysisWidget>[0]> = {},
) {
  const props = {
    localSites,
    selectedCell: null,
    selectedSiteId: noDataSite.id,
    onSiteSelect: vi.fn(),
    localSiteLayerEnabled: false,
    onLocalSiteLayerToggle: vi.fn(),
    ...overrides,
  };
  render(<LocalWetlandsAnalysisWidget {...props} />);
  return props;
}

describe('LocalWetlandsAnalysisWidget — no-data location', () => {
  afterEach(() => {
    vi.clearAllMocks();
    cleanup();
  });

  it('keeps the country + location dropdowns visible for a "Data still to be analysed" site', () => {
    renderWidget();

    expect(screen.getByText('Data still to be analysed')).toBeInTheDocument();

    // Country + Monitoring location dropdowns both remain rendered.
    const selects = screen.getAllByRole('combobox');
    expect(selects).toHaveLength(2);
  });

  it('lets the user navigate to another location from a no-data site', () => {
    const { onSiteSelect } = renderWidget();

    const locationSelect = screen
      .getAllByRole('combobox')
      .find((el) => (el as HTMLSelectElement).value === noDataSite.id);
    expect(locationSelect).toBeDefined();

    fireEvent.change(locationSelect as HTMLElement, {
      target: { value: otherSite.id },
    });

    expect(onSiteSelect).toHaveBeenCalledWith(otherSite.id);
  });
});
