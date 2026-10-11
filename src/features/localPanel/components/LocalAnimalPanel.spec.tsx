import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { DemoPlotsState } from '@/features/analytics';
import type {
  LocalObservation,
  LocalSite,
  SiteCondition,
} from '@/data/types/local-wetlands.types';
import { LocalAnimalPanel } from './LocalAnimalPanel';

const demo = vi.hoisted(() => ({ state: 'off' as DemoPlotsState }));
vi.mock('@/features/analytics', () => ({ useDemoPlots: () => demo.state }));

const capture = vi.hoisted(() => vi.fn());
vi.mock('posthog-js/react', () => ({ usePostHog: () => ({ capture }) }));

vi.mock('@/api/hooks/usePartners', () => ({
  usePartners: () => ({ data: { partners: [] } }),
}));

vi.mock('react-plotly.js', () => ({
  default: () => <div data-testid="plotly" />,
}));

function obs(siteType: SiteCondition, density = 10): LocalObservation {
  return { year: 2026, siteType, density, se: 1, samplesN: 5 };
}

function makeSite(
  id: string,
  name: string,
  country: string,
  observations: LocalObservation[],
): LocalSite {
  return {
    id,
    name,
    country,
    coordinates: [0, 0],
    partnerId: null,
    availableYears: observations.length ? [2026] : [],
    observations,
    points: [],
  };
}

const SITES: LocalSite[] = [
  makeSite('au-moreton-bay', 'Southern Moreton Bay', 'Australia', [
    obs('Reference', 13.6),
    obs('Reference', 45.6),
    obs('Rehabilitated', 28),
  ]),
  makeSite('ph-rasa-island', 'Rasa Island', 'Philippines', [
    obs('Degraded'),
    obs('Reference'),
    obs('Rehabilitated'),
  ]),
  makeSite('cr-isla-chira', 'Isla Chira', 'Costa Rica', [
    obs('Degraded'),
    obs('Reference'),
    obs('Rehabilitated'),
  ]),
  makeSite('hk-wetland-park', 'Hong Kong Wetland Park', 'Hong Kong', []),
  makeSite('ke-gazi', 'Gazi Bay', 'Kenya', []),
  makeSite('za-bayhead', 'Bayhead', 'South Africa', [
    obs('Degraded'),
    obs('Reference'),
    obs('Rehabilitated'),
  ]),
  makeSite('za-beachwood', 'Beachwood', 'South Africa', []),
];

function renderPanel(selectedSiteId: string | null = null) {
  const onSiteSelect = vi.fn();
  const onSiteClear = vi.fn();
  const utils = render(
    <LocalAnimalPanel
      localSites={SITES}
      selectedSiteId={selectedSiteId}
      onSiteSelect={onSiteSelect}
      onSiteClear={onSiteClear}
    />,
  );
  return { ...utils, onSiteSelect, onSiteClear };
}

function pill(name: RegExp | string) {
  return screen.getByRole('button', { name });
}

beforeEach(() => {
  demo.state = 'off';
  capture.mockClear();
});

afterEach(() => cleanup());

describe('LocalAnimalPanel', () => {
  it('shows a skeleton, not the normal view, while the flag loads', () => {
    demo.state = 'loading';
    renderPanel('au-moreton-bay');
    expect(screen.getByTestId('local-panel-skeleton')).toBeInTheDocument();
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
    expect(
      screen.queryByTestId('native-density-chart'),
    ).not.toBeInTheDocument();
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });

  describe('flag off', () => {
    it('shows the native density chart and no plot anywhere', () => {
      renderPanel('au-moreton-bay');
      expect(screen.getByTestId('native-density-chart')).toBeInTheDocument();
      expect(screen.queryByText('Preview data')).not.toBeInTheDocument();
      expect(screen.queryByRole('img')).not.toBeInTheDocument();
    });

    it('shows "not yet available" for views without data', () => {
      renderPanel('au-moreton-bay');
      expect(pill(/By species.*not yet available/)).toBeDisabled();
      expect(pill(/Over time.*not yet available/)).toBeDisabled();

      fireEvent.click(pill('Diversity'));
      expect(screen.getByText('Not yet available')).toBeInTheDocument();

      fireEvent.click(pill(/Wildlife/));
      expect(screen.getByText('Not yet available')).toBeInTheDocument();
      expect(screen.queryByRole('img')).not.toBeInTheDocument();
    });

    it('still renders native charts for Costa Rica, Philippines and Bayhead', () => {
      for (const id of ['cr-isla-chira', 'ph-rasa-island', 'za-bayhead']) {
        renderPanel(id);
        expect(screen.getByTestId('native-density-chart')).toBeInTheDocument();
        cleanup();
      }
    });

    it('shows "not yet available" at a location without data', () => {
      renderPanel('hk-wetland-park');
      expect(screen.getByText('Not yet available')).toBeInTheDocument();
      expect(
        screen.queryByTestId('native-density-chart'),
      ).not.toBeInTheDocument();
    });
  });

  describe('flag on', () => {
    beforeEach(() => {
      demo.state = 'on';
    });

    it('shows the density plot with badge, alt text and credit', async () => {
      renderPanel('au-moreton-bay');
      const img = await screen.findByRole('img', {
        name: /Bar chart of mean crab density/,
      });
      expect(img).toHaveAttribute('loading', 'lazy');
      expect(screen.getByText('Preview data')).toBeInTheDocument();
      expect(
        screen.getByText(
          'Courtesy of Griffith University · Southern Moreton Bay, Australia',
        ),
      ).toBeInTheDocument();
    });

    it('hides the native chart where a density plot exists (duplication rule)', async () => {
      renderPanel('au-moreton-bay');
      await screen.findByRole('img');
      expect(
        screen.queryByTestId('native-density-chart'),
      ).not.toBeInTheDocument();
    });

    it('enables every Australian view and shows its plot', async () => {
      renderPanel('au-moreton-bay');
      fireEvent.click(pill('Size'));
      fireEvent.click(pill('By month'));
      expect(
        await screen.findByRole('img', { name: /per sampling month/ }),
      ).toBeInTheDocument();
      expect(
        screen.getByText(
          'By-month plots are available for the Rehabilitated site only.',
        ),
      ).toBeInTheDocument();
      fireEvent.click(pill(/Wildlife/));
      expect(
        await screen.findByRole('img', { name: /nMDS ordination/ }),
      ).toBeInTheDocument();
    });

    it('keeps native charts where there are no plots (Costa Rica)', () => {
      renderPanel('cr-isla-chira');
      expect(screen.getByTestId('native-density-chart')).toBeInTheDocument();
      expect(screen.queryByText('Preview data')).not.toBeInTheDocument();
      fireEvent.click(pill('Diversity'));
      expect(screen.getByText('Not yet available')).toBeInTheDocument();
    });

    it('reads "by site type" for the Philippines and disables over time', async () => {
      renderPanel('ph-rasa-island');
      expect(pill('By site type')).toBeInTheDocument();
      expect(pill(/Over time.*not yet available/)).toBeDisabled();
      expect(
        screen.getByText('Philippines · Asia · 3 site types compared'),
      ).toBeInTheDocument();
      fireEvent.click(pill(/Wildlife/));
      expect(
        await screen.findByRole('img', { name: /Two panels/ }),
      ).toBeInTheDocument();
      expect(
        screen.getByText(
          'Courtesy of Katala Foundation · Rasa Island, Philippines',
        ),
      ).toBeInTheDocument();
    });

    it('captures demo_plot_viewed once per view, not per render', async () => {
      const { rerender, onSiteSelect, onSiteClear } =
        renderPanel('au-moreton-bay');
      await screen.findByRole('img');
      rerender(
        <LocalAnimalPanel
          localSites={SITES}
          selectedSiteId="au-moreton-bay"
          onSiteSelect={onSiteSelect}
          onSiteClear={onSiteClear}
        />,
      );
      const viewed = capture.mock.calls.filter(
        ([event]) => event === 'demo_plot_viewed',
      );
      expect(viewed).toEqual([
        [
          'demo_plot_viewed',
          {
            location_id: 'au-moreton-bay',
            plot_id: '01_AUS_crab_density_overall',
            tab: 'crabs',
            metric: 'density',
            view: 'by-site',
            mode: 'local',
          },
        ],
      ]);

      fireEvent.click(pill('Diversity'));
      await screen.findByRole('img', { name: /species per deployment/ });
      expect(
        capture.mock.calls.filter(([event]) => event === 'demo_plot_viewed'),
      ).toHaveLength(2);
    });

    it('opens the plot full size in a lightbox and closes it', async () => {
      renderPanel('au-moreton-bay');
      await screen.findByRole('img');
      fireEvent.click(pill(/Expand/));
      const dialog = screen.getByRole('dialog', {
        name: 'Crab density by site',
        hidden: true,
      });
      expect(
        within(dialog).getByText('Australia · Crabs · Density · By site'),
      ).toBeInTheDocument();
      fireEvent.click(within(dialog).getByRole('button', { name: /Close/ }));
      expect(screen.queryByRole('dialog', { hidden: true })).toBeNull();
    });

    it('closes through the native dialog and ignores clicks on its own blank area', async () => {
      const close = vi.fn(function (this: HTMLDialogElement) {
        this.removeAttribute('open');
      });
      const proto = HTMLDialogElement.prototype as unknown as {
        close?: () => void;
      };
      const original = proto.close;
      proto.close = close;
      try {
        renderPanel('au-moreton-bay');
        await screen.findByRole('img');
        fireEvent.click(pill(/Expand/));
        const dialog = screen.getByRole('dialog', { hidden: true });
        // jsdom has no layout: the box is 0×0 at the origin, so a click
        // at (0, 0) is "inside" it, like a tap on the phone sheet.
        fireEvent.click(dialog, { clientX: 0, clientY: 0 });
        expect(
          screen.getByRole('dialog', { hidden: true }),
        ).toBeInTheDocument();
        // Outside the box is the backdrop.
        fireEvent.click(dialog, { clientX: 500, clientY: 500 });
        expect(close).toHaveBeenCalled();
        expect(screen.queryByRole('dialog', { hidden: true })).toBeNull();
      } finally {
        proto.close = original;
      }
    });

    it('never upscales the small nMDS image', async () => {
      renderPanel('au-moreton-bay');
      fireEvent.click(pill(/Wildlife/));
      const img = await screen.findByRole('img', { name: /nMDS/ });
      expect(screen.getByTestId('plot-box').style.maxWidth).toContain('825px');
      fireEvent.click(pill(/Expand/));
      const dialog = screen.getByRole('dialog', { hidden: true });
      const full = within(dialog).getByRole('img', { hidden: true });
      expect(full.style.maxWidth).toBe('825px');
      expect(img).toHaveAttribute('width', '825');
    });
  });

  describe('selector and empty states', () => {
    it('lists locations with results, derived from the data', () => {
      renderPanel(null);
      expect(
        screen.getByText('Select a continent and country'),
      ).toBeInTheDocument();
      const open = screen
        .getAllByRole('button', { name: /^Open / })
        .map((b) => b.getAttribute('aria-label'));
      expect(open).toEqual([
        'Open Southern Moreton Bay, Australia',
        'Open Isla Chira, Costa Rica',
        'Open Rasa Island, Philippines',
        'Open Bayhead, South Africa',
      ]);
      expect(screen.getByText('Hong Kong')).toBeInTheDocument();
      expect(screen.getByText('Kenya')).toBeInTheDocument();
    });

    it('disables Country and Location until the step before is chosen', () => {
      renderPanel(null);
      expect(screen.getByLabelText('Country')).toBeDisabled();
      expect(screen.getByLabelText('Location')).toBeDisabled();
    });

    it('opens the single location with results when a country is chosen', () => {
      const { onSiteSelect } = renderPanel(null);
      fireEvent.change(screen.getByLabelText('Continent'), {
        target: { value: 'Africa' },
      });
      const country = screen.getByLabelText('Country');
      expect(
        within(country).getByRole('option', { name: 'Kenya · data to come' }),
      ).toBeDisabled();
      fireEvent.change(country, { target: { value: 'South Africa' } });
      expect(onSiteSelect).toHaveBeenCalledWith('za-bayhead');
    });

    it('says when a continent has no results yet', () => {
      render(
        <LocalAnimalPanel
          localSites={[
            ...SITES,
            // An unmapped country falls under "Other", with no results.
            makeSite('xx-site', 'Unmapped Site', 'Unmapped', []),
          ]}
          selectedSiteId={null}
          onSiteSelect={vi.fn()}
          onSiteClear={vi.fn()}
        />,
      );
      fireEvent.change(screen.getByLabelText('Continent'), {
        target: { value: 'Other' },
      });
      expect(
        screen.getByText('No results to show for Other yet'),
      ).toBeInTheDocument();
      expect(
        screen.getByText(
          /Results available: Australia, Costa Rica, Philippines and South Africa\./,
        ),
      ).toBeInTheDocument();
    });

    it('resets the selector when the site is cleared from outside (logo reset)', () => {
      const { rerender, onSiteSelect, onSiteClear } =
        renderPanel('au-moreton-bay');
      expect(screen.getByLabelText('Country')).toHaveValue('Australia');
      rerender(
        <LocalAnimalPanel
          localSites={SITES}
          selectedSiteId={null}
          onSiteSelect={onSiteSelect}
          onSiteClear={onSiteClear}
        />,
      );
      expect(screen.getByLabelText('Continent')).toHaveValue('');
      expect(screen.getByLabelText('Country')).toHaveValue('');
      expect(screen.getByLabelText('Country')).toBeDisabled();
    });

    it('keeps the new continent when the panel itself clears the site', () => {
      const { rerender, onSiteSelect, onSiteClear } =
        renderPanel('au-moreton-bay');
      fireEvent.change(screen.getByLabelText('Continent'), {
        target: { value: 'Africa' },
      });
      expect(onSiteClear).toHaveBeenCalled();
      // The URL catches up: the site is now cleared.
      rerender(
        <LocalAnimalPanel
          localSites={SITES}
          selectedSiteId={null}
          onSiteSelect={onSiteSelect}
          onSiteClear={onSiteClear}
        />,
      );
      expect(screen.getByLabelText('Continent')).toHaveValue('Africa');
      expect(screen.getByLabelText('Country')).toBeEnabled();
    });

    it('reads "By site" at a location without rows', () => {
      renderPanel('hk-wetland-park');
      expect(pill(/^By site.*not yet available/)).toBeInTheDocument();
      expect(
        screen.queryByRole('button', { name: /By site type/ }),
      ).not.toBeInTheDocument();
    });

    it('clears the site when the continent changes', () => {
      const { onSiteClear } = renderPanel('au-moreton-bay');
      fireEvent.change(screen.getByLabelText('Continent'), {
        target: { value: 'Africa' },
      });
      expect(onSiteClear).toHaveBeenCalled();
    });
  });
});
