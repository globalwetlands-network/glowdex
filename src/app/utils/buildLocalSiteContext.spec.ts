import { describe, expect, it, vi } from 'vitest';
import { buildLocalSiteContext } from './buildLocalSiteContext';
import type { LocalSite } from '@/data/types/local-wetlands.types';
import type { PartnerResponse } from '@/api/partners';
import { MAX_LOCAL_AI_CONDITIONS } from '@/data/constants/localWetlands.constants';

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

  it('sends one labelled entry per sampling point, not a sum per condition', () => {
    const point = makeSite().observations[0];
    const site = makeSite({
      observations: [
        { ...point, density: 11.3 },
        { ...point, density: 4.2 },
        { ...point, siteType: 'Degraded', density: 2.1 },
      ],
    });

    expect(
      buildLocalSiteContext(site, partners, false)?.conditions.map((c) => [
        c.label,
        c.totalDensity,
      ]),
    ).toEqual([
      ['Reference 1', 11.3],
      ['Reference 2', 4.2],
      ['Degraded', 2.1],
    ]);
  });

  it('caps the entries at MAX_LOCAL_AI_CONDITIONS and warns', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const point = makeSite().observations[0];
    const site = makeSite({
      observations: Array.from(
        { length: MAX_LOCAL_AI_CONDITIONS + 2 },
        (_, i) => ({ ...point, density: i + 1 }),
      ),
    });

    const ctx = buildLocalSiteContext(site, partners, false);

    expect(ctx?.conditions).toHaveLength(MAX_LOCAL_AI_CONDITIONS);
    expect(ctx?.conditions[0].label).toBe('Reference 1');
    expect(warn).toHaveBeenCalledOnce();
    warn.mockRestore();
  });

  it('does not warn about the cap while the partner name is still loading', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const point = makeSite().observations[0];
    const site = makeSite({
      observations: Array.from(
        { length: MAX_LOCAL_AI_CONDITIONS + 2 },
        (_, i) => ({ ...point, density: i + 1 }),
      ),
    });

    expect(buildLocalSiteContext(site, undefined, false)).toBeNull();
    expect(warn).not.toHaveBeenCalled();
    warn.mockRestore();
  });
});
