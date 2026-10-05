import { describe, expect, it } from 'vitest';
import { buildLocalSiteContext } from './buildLocalSiteContext';
import type { LocalSite } from '@/data/types/local-wetlands.types';
import type { PartnerResponse } from '@/api/partners';

function makeSite(overrides: Partial<LocalSite> = {}): LocalSite {
  return {
    id: 'za-bayhead',
    name: 'Bayhead',
    country: 'South Africa',
    coordinates: [31.0, -29.9],
    partnerId: 'uwc',
    availableYears: [2026],
    observations: [
      {
        year: 2026,
        siteType: 'Reference',
        species: 'Crab A',
        density: 11.3,
        se: 3.0,
        samplesN: 5,
      },
    ],
    points: [],
    ...overrides,
  };
}

const partners = [
  { id: 'uwc', institution: 'University of the Western Cape' },
] as PartnerResponse[];

describe('buildLocalSiteContext', () => {
  it('resolves the partner institution name once partners have loaded', () => {
    const ctx = buildLocalSiteContext(makeSite(), partners, false);
    expect(ctx).toMatchObject({
      siteName: 'Bayhead',
      country: 'South Africa',
      partner: 'University of the Western Cape',
      year: 2026,
    });
    expect(ctx?.conditions).toHaveLength(1);
  });

  it('waits (null) while the partners request is still in flight', () => {
    expect(buildLocalSiteContext(makeSite(), undefined, false)).toBeNull();
  });

  it('falls back to the site name when the partners request failed', () => {
    const ctx = buildLocalSiteContext(makeSite(), undefined, true);
    expect(ctx?.partner).toBe('Bayhead');
  });

  it('does not wait on partners for a site with no partner', () => {
    const ctx = buildLocalSiteContext(
      makeSite({ partnerId: null }),
      undefined,
      false,
    );
    expect(ctx?.partner).toBe('Bayhead');
  });

  it('returns null for a site with no analysed data', () => {
    expect(
      buildLocalSiteContext(
        makeSite({ availableYears: [], observations: [] }),
        partners,
        false,
      ),
    ).toBeNull();
  });

  it('returns null when every condition has zero samples', () => {
    const site = makeSite();
    site.observations[0].samplesN = 0;
    expect(buildLocalSiteContext(site, partners, false)).toBeNull();
  });
});
