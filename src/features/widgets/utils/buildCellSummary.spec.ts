import { describe, it, expect } from 'vitest';
import { buildCellSummary } from './buildCellSummary';
import type { BuildCellSummaryInput } from './buildCellSummary';
import type { EnrichedGridCell } from '@/app/types/app.types';
import type {
  AIStatisticalIndicatorSummary,
  LocalSiteContext,
} from '@/api/types';
import type { SpeciesConfigResponse } from '@/api/species';

function makeCell(overrides: Partial<EnrichedGridCell> = {}): EnrichedGridCell {
  return {
    id: 4821,
    country: 'Indonesia',
    iso3: 'IDN',
    residuals: {},
    cluster5: 3,
    cluster18: 12,
    mangroves: true,
    saltmarsh: false,
    seagrass: false,
    centerCoords: { latitude: -2.15, longitude: 106.42 },
    ...overrides,
  } as EnrichedGridCell;
}

const indicatorSummary: AIStatisticalIndicatorSummary = {
  key: 'mang_mean_agb_mg_ha',
  indicator: 'Raw backend label',
  groupingLabel: 'Cluster_3',
  cellValue: 118.4,
  min: 0,
  q1: 80,
  median: 100,
  q3: 140,
  max: 300,
  percentile: 62,
  sampledDistribution: [],
};

const speciesConfig: SpeciesConfigResponse = {
  id: 'horseshoe-crab',
  commonName: 'Mangrove Horseshoe Crab',
  scientificName: 'Carcinoscorpius rotundicauda',
  conservationStatus: 'DD',
  iucnUrl: '',
  summaryText: '',
  dataApplicability: '',
  dataSource: '',
  learnMoreUrl: '',
  mapTipText: '',
  partnerIds: [],
  regionBounds: [],
};

const localSiteContext: LocalSiteContext = {
  siteName: 'Bintan Reference Plots',
  country: 'Indonesia',
  partner: 'Example Institute',
  year: 2023,
  conditions: [
    { siteType: 'Reference', totalDensity: 12.5, combinedSE: 1.2, samplesN: 8 },
  ],
};

function baseInput(): BuildCellSummaryInput {
  return {
    cell: makeCell(),
    scale: 'scale5',
    statisticalSummaries: [indicatorSummary],
    species: [speciesConfig],
    localSiteContext,
    generatedDate: '2026-08-24',
  };
}

describe('buildCellSummary', () => {
  it('assembles location, typology, indicators, species and local data', () => {
    const summary = buildCellSummary(baseInput());

    expect(summary.location.tileId).toBe(4821);
    expect(summary.location.country).toBe('Indonesia');
    expect(summary.location.iso3).toBe('IDN');
    expect(summary.location.coordinates).not.toBe('Not available');

    // scale5 resolves the human typology name + description
    expect(summary.typology.number).toBe(3);
    expect(summary.typology.name).toBe('High Climate Impacts');
    expect(summary.typology.description).toContain('climate');

    expect(summary.indicators).toHaveLength(1);
    // Curated science-approved label is preferred over the raw backend field.
    expect(summary.indicators[0].label).toBe('Above-ground biomass');
    expect(summary.indicators[0].percentile).toBe(62);
    // Percentile is translated into a typology-relative reading.
    expect(summary.indicators[0].interpretation).toContain('typology');

    // conservation code is expanded to its human label
    expect(summary.species[0].conservationStatus).toBe('Data Deficient');

    expect(summary.localMonitoring?.siteName).toBe('Bintan Reference Plots');
    expect(summary.localMonitoring?.conditions).toHaveLength(1);
  });

  it('always includes the typology-relative caveat and a source citation', () => {
    const summary = buildCellSummary(baseInput());

    expect(summary.caveat.toLowerCase()).toContain('typology');
    expect(summary.caveat.toLowerCase()).toContain('not global');
    expect(summary.citation).toContain('Sievers et al. (2021)');
    expect(summary.citation).toContain('2026-08-24');
  });

  it('handles a cell with no species and no local monitoring data', () => {
    const summary = buildCellSummary({
      ...baseInput(),
      species: [],
      localSiteContext: null,
    });

    expect(summary.species).toEqual([]);
    expect(summary.localMonitoring).toBeNull();
    // caveat + citation still present
    expect(summary.caveat).toBeTruthy();
    expect(summary.citation).toBeTruthy();
  });

  it('omits the typology description for the 18-typology scale', () => {
    const summary = buildCellSummary({ ...baseInput(), scale: 'scale18' });

    expect(summary.typology.number).toBe(12);
    expect(summary.typology.name).toBeNull();
    expect(summary.typology.description).toBeNull();
  });

  it('reports coordinates as unavailable when the cell has none', () => {
    const summary = buildCellSummary({
      ...baseInput(),
      cell: makeCell({
        centerCoords: undefined,
        lat: undefined,
        lng: undefined,
      }),
    });

    expect(summary.location.coordinates).toBe('Not available');
    expect(summary.location.latitude).toBeNull();
  });

  it('treats a half-populated lat/lng pair as unavailable', () => {
    const summary = buildCellSummary({
      ...baseInput(),
      cell: makeCell({ centerCoords: undefined, lat: 9.5, lng: undefined }),
    });

    // Without both axes, formatCoordinate would emit a misleading 0 — so
    // the summary reports the coordinates as unavailable instead.
    expect(summary.location.coordinates).toBe('Not available');
    expect(summary.location.latitude).toBeNull();
    expect(summary.location.longitude).toBeNull();
  });

  it('reflects a non-mangrove cell', () => {
    const summary = buildCellSummary({
      ...baseInput(),
      cell: makeCell({ mangroves: false }),
    });
    expect(summary.hasMangrove).toBe(false);
  });
});
