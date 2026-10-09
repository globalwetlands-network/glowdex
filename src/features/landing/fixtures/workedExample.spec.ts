import { describe, expect, it } from 'vitest';
import { MAX_SITE_ASSOCIATION_DISTANCE_KM } from '@/data/constants/localWetlands.constants';
import { calculateDistance } from '@/utils/geo';
import {
  EXAMPLE_CELL,
  EXAMPLE_DISTRIBUTIONS,
  EXAMPLE_INDICATOR_PERCENTILES,
  EXAMPLE_HIGHLIGHT,
  EXAMPLE_HIGHLIGHTS,
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
    // Local answers are about the site only (GLO-207): no grid cell.
    expect(EXAMPLE_INSIGHTS.local.gridCellId).toBeNull();
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
    // "the species threat score is moderately low" — a low score means MORE
    // threatened species (see the indicator's direction below)
    expect(percentile.mang_spec_score).toBeLessThan(50);
    const specScore = Object.values(EXAMPLE_DISTRIBUTIONS)
      .flat()
      .find((d) => d.indicator.key === 'mang_spec_score')!.indicator;
    expect(specScore.direction).toBe(1);
    expect(specScore.description).toMatch(/higher score = fewer threatened/);
    // "exceptionally low fish density … near median … moderately low"
    const globalText = EXAMPLE_INSIGHTS.global.text;
    expect(globalText).toContain('exceptionally low fish density');
    expect(globalText).toContain('invertebrate density is near median');
    expect(globalText).toContain('the species threat score is moderately low');
    // Saying the THREAT (not the score) is low would invert the meaning.
    expect(globalText).not.toMatch(/species threat is/);
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

  it('keeps each mode to its own findings, highlights, and no health language', () => {
    // Local reads only the site's field data, credited to its partner…
    const local = EXAMPLE_INSIGHTS.local.text;
    expect(local).toContain(
      `Field monitoring at Bayhead, South Africa, by the ` +
        `${EXAMPLE_LOCAL_SITE_CONTEXT.partner} in ${EXAMPLE_LOCAL_SITE_CONTEXT.year}`,
    );
    expect(local).not.toContain(EXAMPLE_HIGHLIGHT);
    expect(local).not.toMatch(/hectares|typology|invertebrate/);
    expect(EXAMPLE_INSIGHTS.local.sources).toEqual([]);
    // …and global never mentions field monitoring.
    expect(EXAMPLE_INSIGHTS.global.text).not.toMatch(/field monitoring/i);
    for (const mode of ['local', 'global'] as const) {
      expect(EXAMPLE_INSIGHTS[mode].text).toContain(EXAMPLE_HIGHLIGHTS[mode]);
      expect(EXAMPLE_INSIGHTS[mode].text).not.toMatch(/health/i);
    }
    expect((EXAMPLE_QUOTE.highlight + EXAMPLE_QUOTE.rest).toLowerCase()).toBe(
      `${EXAMPLE_HIGHLIGHT}.`,
    );
  });
});
