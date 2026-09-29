import { describe, expect, it } from 'vitest';
import { MAX_SITE_ASSOCIATION_DISTANCE_KM } from '@/data/constants/localWetlands.constants';
import { calculateDistance } from '@/utils/geo';
import {
  EXAMPLE_CELL,
  EXAMPLE_DISTRIBUTIONS,
  EXAMPLE_INDICATOR_PERCENTILES,
  EXAMPLE_HIGHLIGHT,
  EXAMPLE_INSIGHTS,
  EXAMPLE_QUOTE,
  EXAMPLE_LOCAL_SITE,
  EXAMPLE_MANGROVE_AREA_HA,
  EXAMPLE_LOCAL_SITE_CONTEXT,
  EXAMPLE_TYPOLOGIES,
} from './workedExample';

describe('worked example fixture', () => {
  it('is one consistent place: tile 21812, Bayhead, South Africa, Typology 1', () => {
    expect(EXAMPLE_CELL.id).toBe(21812);
    expect(EXAMPLE_CELL.country).toBe('South Africa');
    expect(EXAMPLE_CELL.cluster5).toBe(1);
    expect(EXAMPLE_CELL.mangroves).toBe(true);
    expect(EXAMPLE_TYPOLOGIES.scale5[1]).toBeDefined();

    expect(EXAMPLE_LOCAL_SITE.name).toBe('Bayhead');
    expect(EXAMPLE_LOCAL_SITE.country).toBe('South Africa');
    expect(EXAMPLE_LOCAL_SITE_CONTEXT.siteName).toBe('Bayhead');
    expect(EXAMPLE_INSIGHTS.local.gridCellId).toBe(EXAMPLE_CELL.id);
    expect(EXAMPLE_INSIGHTS.global.gridCellId).toBe(EXAMPLE_CELL.id);
  });

  it('places the local site close enough to the tile to be associated with it', () => {
    const { latitude, longitude } = EXAMPLE_CELL.centerCoords!;
    const [siteLng, siteLat] = EXAMPLE_LOCAL_SITE.coordinates;

    expect(
      calculateDistance(latitude, longitude, siteLat, siteLng),
    ).toBeLessThanOrEqual(MAX_SITE_ASSOCIATION_DISTANCE_KM);
  });

  it('has real measurements and chart data for the place', () => {
    expect(EXAMPLE_LOCAL_SITE_CONTEXT.conditions.length).toBeGreaterThan(0);

    const distributions = Object.values(EXAMPLE_DISTRIBUTIONS).flat();
    expect(distributions.length).toBeGreaterThan(0);
    for (const d of distributions) {
      expect(d.values.length).toBeGreaterThan(0);
      expect(d.selectedValue).toEqual(expect.any(Number));
    }
  });

  it('agrees with the data it sits beside', () => {
    const percentile = Object.fromEntries(
      EXAMPLE_INDICATOR_PERCENTILES.map((p) => [p.key, p.percentile]),
    );
    // "falling into the bottom decile"
    expect(percentile.mang_fish_dens).toBeLessThan(10);
    // "invertebrate density is near median"
    expect(percentile.mang_invert_dens).toBeGreaterThanOrEqual(35);
    expect(percentile.mang_invert_dens).toBeLessThanOrEqual(65);
    // "the species threat score is moderately low"
    expect(percentile.mang_spec_score).toBeLessThan(50);
    // "exceptionally low fish density … near median … moderately low"
    for (const insight of Object.values(EXAMPLE_INSIGHTS)) {
      expect(insight.text).toContain('exceptionally low fish density');
      expect(insight.text).toContain('invertebrate density is near median');
      expect(insight.text).toContain('species threat is moderately low');
    }
    // "covers 64 hectares"
    expect(Math.round(EXAMPLE_MANGROVE_AREA_HA)).toBe(64);
    expect(EXAMPLE_INSIGHTS.global.text).toContain('covers 64 hectares');
    // "crab densities in degraded and rehabilitated zones well below the reference"
    const density = Object.fromEntries(
      EXAMPLE_LOCAL_SITE_CONTEXT.conditions.map((c) => [
        c.siteType,
        c.totalDensity,
      ]),
    );
    expect(density.Degraded).toBeLessThan(density.Reference);
    expect(density.Rehabilitated).toBeLessThan(density.Reference);
  });

  it('keeps local findings to local mode, highlights, and no health language', () => {
    expect(EXAMPLE_INSIGHTS.local.text).toContain(
      'Local field data from Bayhead',
    );
    expect(EXAMPLE_INSIGHTS.global.text).not.toMatch(/local field data/i);
    for (const insight of Object.values(EXAMPLE_INSIGHTS)) {
      expect(insight.text).toContain(EXAMPLE_HIGHLIGHT);
      expect(insight.text).not.toMatch(/health/i);
    }
    expect((EXAMPLE_QUOTE.highlight + EXAMPLE_QUOTE.rest).toLowerCase()).toBe(
      `${EXAMPLE_HIGHLIGHT}.`,
    );
  });
});
