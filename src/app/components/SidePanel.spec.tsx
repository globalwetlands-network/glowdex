import { render, screen, cleanup, within } from '@testing-library/react';
import type { ComponentProps } from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { SidePanel } from './SidePanel';
import type { EnrichedGridCell } from '../types/app.types';
import type { LocalSiteContext } from '@/api/types';

// Gating is what's under test here, so heavy children are stubbed to
// markers. BiodiversityPanel stays real so its switches can be checked.
vi.mock('./AnalysisAssistantWidget', () => ({
  AnalysisAssistantWidget: ({ mode }: { mode: string }) => (
    <div data-testid={`assistant-${mode}`} />
  ),
}));
vi.mock('./GlobalWetlandsAnalysisWidget', () => ({
  GlobalWetlandsAnalysisWidget: () => <div data-testid="global-widget" />,
}));
vi.mock('@/components/widgets/LocalData', () => ({
  LocalWetlandsAnalysisWidget: ({
    hideLayerToggle,
  }: {
    hideLayerToggle?: boolean;
  }) => (
    <div
      data-testid="local-widget"
      data-hide-toggle={String(!!hideLayerToggle)}
    />
  ),
}));
vi.mock('@/features/widgets/components/FilterControls', () => ({
  FilterControls: () => <div data-testid="filters" />,
}));
vi.mock('@/features/widgets/components/SelectionPanel', () => ({
  SelectionPanel: () => <div data-testid="selection-panel" />,
}));
vi.mock('@/features/widgets/components/DownloadSummaryButton', () => ({
  DownloadSummaryButton: () => null,
}));
vi.mock('@/components/widgets/SpeciesSpotlight', () => ({
  SpeciesSpotlightWidget: () => <div data-testid="species-spotlight" />,
}));
vi.mock('@/components/widgets/Partner', () => ({
  PartnerWidget: () => <div data-testid="partner-widget" />,
}));
vi.mock('@/api/hooks/usePartners', () => ({
  usePartners: () => ({ data: { partners: [] } }),
}));
vi.mock('posthog-js/react', () => ({
  usePostHog: () => ({ capture: vi.fn() }),
}));

const cell = {
  id: 18684,
  mangroves: true,
  cluster5: 1,
  cluster18: 1,
} as unknown as EnrichedGridCell;

const localSiteContext: LocalSiteContext = {
  siteName: 'Mngazana',
  country: 'South Africa',
  partner: 'UWC',
  year: 2026,
  conditions: [
    { siteType: 'Reference', totalDensity: 28.3, combinedSE: 2.4, samplesN: 6 },
  ],
};

function renderPanel(overrides: Partial<ComponentProps<typeof SidePanel>>) {
  const props: ComponentProps<typeof SidePanel> = {
    mode: 'global',
    filterState: {
      typologyScale: 'scale5',
    } as ComponentProps<typeof SidePanel>['filterState'],
    onFilterChange: vi.fn(),
    selectedCell: null,
    onClearSelection: vi.fn(),
    typologies: { scale5: {}, scale18: {} },
    distributions: {} as ComponentProps<typeof SidePanel>['distributions'],
    isLoading: false,
    visibleCellCount: 2845,
    onSpeciesLayerToggle: vi.fn(),
    onPartnerLayerToggle: vi.fn(),
    partnerLayerEnabled: true,
    onMangroveLayerToggle: vi.fn(),
    mangroveLayerEnabled: true,
    activeTab: 'analysis',
    onTabChange: vi.fn(),
    clickedPartnerId: null,
    localSites: [],
    localDataUpdated: null,
    selectedSiteId: null,
    onSiteSelect: vi.fn(),
    localSiteLayerEnabled: true,
    onLocalSiteLayerToggle: vi.fn(),
    onViewLocalData: vi.fn(),
    localSiteContext: null,
    isLocalContextPending: false,
    speciesConfig: [],
    partners: [],
    ...overrides,
  };
  return render(<SidePanel {...props} />);
}

describe('SidePanel mode gating (GLO-207)', () => {
  afterEach(() => cleanup());

  describe('Local mode', () => {
    it('Analysis shows only the local widget (toggle hidden), no global content', () => {
      renderPanel({ mode: 'local' });

      expect(screen.getByTestId('local-widget')).toHaveAttribute(
        'data-hide-toggle',
        'true',
      );
      expect(screen.queryByTestId('global-widget')).not.toBeInTheDocument();
      expect(screen.queryByTestId('filters')).not.toBeInTheDocument();
      expect(screen.queryByTestId('selection-panel')).not.toBeInTheDocument();
      expect(screen.queryByText(/tile/i)).not.toBeInTheDocument();
    });

    it('never renders global cards even if a cell is passed in', () => {
      renderPanel({ mode: 'local', selectedCell: cell });

      expect(screen.queryByTestId('global-widget')).not.toBeInTheDocument();
      expect(screen.queryByTestId('filters')).not.toBeInTheDocument();
      expect(screen.queryByTestId('assistant-global')).not.toBeInTheDocument();
    });

    it('shows a site-scoped assistant once a site has local context', () => {
      renderPanel({
        mode: 'local',
        selectedSiteId: 'za-mngazana',
        localSiteContext,
      });

      expect(screen.getByTestId('assistant-local')).toBeInTheDocument();
      expect(screen.queryByTestId('assistant-global')).not.toBeInTheDocument();
    });

    it('keeps the Biodiversity tab widgets but hides the pin switch', () => {
      renderPanel({ mode: 'local' });

      expect(screen.getByTestId('partner-widget')).toBeInTheDocument();
      expect(screen.getByTestId('species-spotlight')).toBeInTheDocument();
      const switches = screen.getAllByRole('switch');
      expect(switches).toHaveLength(1); // mangrove extent only
      expect(
        screen.getByText('Show mangrove habitat extent'),
      ).toBeInTheDocument();
      expect(
        screen.queryByText('Show monitoring locations on map'),
      ).not.toBeInTheDocument();
    });

    it('hides the "Mangrove Tiles" footer', () => {
      renderPanel({ mode: 'local' });
      expect(screen.queryByText(/Mangrove Tiles/)).not.toBeInTheDocument();
    });
  });

  describe('Global mode', () => {
    it('shows the tile prompt and no local widget when nothing is selected', () => {
      renderPanel({ mode: 'global' });

      expect(screen.queryByTestId('local-widget')).not.toBeInTheDocument();
      expect(
        screen.getAllByText(/Select a colored tile/).length,
      ).toBeGreaterThan(0);
    });

    it('shows the cell cards for a selected cell, without the local widget', () => {
      renderPanel({ mode: 'global', selectedCell: cell });

      expect(screen.getByTestId('global-widget')).toBeInTheDocument();
      expect(screen.getByTestId('filters')).toBeInTheDocument();
      expect(screen.getByTestId('assistant-global')).toBeInTheDocument();
      expect(screen.queryByTestId('local-widget')).not.toBeInTheDocument();
    });

    it('keeps the pin switch on the Biodiversity tab and the tile footer', () => {
      renderPanel({ mode: 'global' });

      expect(
        screen.getByText('Show monitoring locations on map'),
      ).toBeInTheDocument();
      const footer = screen.getByText(/Mangrove Tiles/);
      expect(within(footer).getByText(/2,845/)).toBeTruthy();
    });
  });
});
