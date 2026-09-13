import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { deriveLocalWetlands } from './deriveLocalWetlands';
import type {
  LocalSiteRaw,
  LocalObservationRaw,
} from '../types/local-wetlands.types';

function siteRow(over: Partial<LocalSiteRaw> = {}): LocalSiteRaw {
  return {
    Country_name: 'South Africa',
    Location_name: 'Bayhead',
    Location_lat: '-29.8896064',
    Location_long: '31.0125925',
    Year: '2026',
    Site_Type: 'Reference',
    site_id: 'za-bayhead',
    partner_id: 'uwc-za',
    ...over,
  };
}

function obsRow(over: Partial<LocalObservationRaw> = {}): LocalObservationRaw {
  return {
    Country_name: 'South Africa',
    Location_name: 'Bayhead',
    Location_lat: '-29.8896064',
    Location_long: '31.0125925',
    Year: '2026',
    Site_Type: 'Reference',
    Species: '1',
    Density: '10',
    SE: '1',
    Samples_n: '5',
    site_id: 'za-bayhead',
    ...over,
  };
}

beforeEach(() => {
  vi.spyOn(console, 'warn').mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('deriveLocalWetlands', () => {
  it('collects one point per coordinate row for a site', () => {
    const sites = deriveLocalWetlands(
      [
        siteRow({ Site_Type: 'Degraded', Location_long: '31.0383481' }),
        siteRow({ Site_Type: 'Reference', Location_long: '31.0179211' }),
        siteRow({ Site_Type: 'Rehabilitated', Location_long: '31.0408006' }),
      ],
      [],
    );

    expect(sites).toHaveLength(1);
    expect(sites[0].id).toBe('za-bayhead');
    expect(sites[0].points).toHaveLength(3);
    expect(sites[0].points.map((p) => p.condition)).toEqual([
      'Degraded',
      'Reference',
      'Rehabilitated',
    ]);
    // Representative coordinate = first row.
    expect(sites[0].coordinates).toEqual([31.0383481, -29.8896064]);
  });

  it('skips coordinate rows with empty lat/long (no marker)', () => {
    const sites = deriveLocalWetlands(
      [
        siteRow({
          Country_name: 'China',
          Location_name: 'Zhuhai',
          Location_lat: '',
          Location_long: '',
          Site_Type: '',
          site_id: 'cn-zhuhai',
          partner_id: '',
        }),
      ],
      [],
    );
    expect(sites).toHaveLength(0);
  });

  it('normalises "Restored" to "Rehabilitated" on the point', () => {
    const sites = deriveLocalWetlands(
      [
        siteRow({
          Country_name: 'Kenya',
          Location_name: 'Gazi',
          Location_lat: '4.42483',
          Location_long: '39.53684',
          Site_Type: 'Restored',
          site_id: 'ke-gazi',
          partner_id: 'wiomn-ke',
        }),
      ],
      [],
    );
    expect(sites).toHaveLength(1);
    expect(sites[0].points[0].condition).toBe('Rehabilitated');
  });

  it('joins observations to a renamed site by stable site_id', () => {
    // The sites file calls it "Southern Moreton Bay"; the observations
    // file still says "Moreton Bay". The shared site_id joins them with
    // no name matching or bridging map.
    const sites = deriveLocalWetlands(
      [
        siteRow({
          Country_name: 'Australia',
          Location_name: 'Southern Moreton Bay',
          Location_lat: '-27.693817',
          Location_long: '153.322803',
          Site_Type: 'Reference',
          site_id: 'au-moreton-bay',
          partner_id: 'griffith-university-au',
        }),
      ],
      [
        obsRow({
          Country_name: 'Australia',
          Location_name: 'Moreton Bay',
          Site_Type: 'Reference',
          Density: '9.2',
          site_id: 'au-moreton-bay',
        }),
      ],
    );

    const site = sites.find((s) => s.id === 'au-moreton-bay');
    expect(site).toBeDefined();
    expect(site!.observations).toHaveLength(1);
    expect(site!.observations[0].density).toBeCloseTo(9.2);
    expect(site!.availableYears).toEqual([2026]);
    // Partner id comes from the sites file.
    expect(site!.partnerId).toBe('griffith-university-au');
  });

  it('reads partner_id from the sites file', () => {
    const sites = deriveLocalWetlands([siteRow({ partner_id: 'uwc-za' })], []);
    expect(sites[0].partnerId).toBe('uwc-za');
  });

  it('serves a site with no observations from the sites file alone', () => {
    const sites = deriveLocalWetlands(
      [
        siteRow({
          Location_name: 'Beachwood',
          Location_lat: '-29.8064421',
          Location_long: '31.0383481',
          site_id: 'za-beachwood',
          partner_id: 'uwc-za',
        }),
      ],
      [],
    );
    expect(sites[0].id).toBe('za-beachwood');
    expect(sites[0].partnerId).toBe('uwc-za');
    // No density data -> empty observations -> "to be analysed" state.
    expect(sites[0].observations).toHaveLength(0);
    expect(sites[0].availableYears).toHaveLength(0);
  });

  it('drops an observation whose site_id is missing', () => {
    const sites = deriveLocalWetlands(
      [siteRow()],
      [obsRow({ site_id: '', Density: '10' })],
    );
    expect(sites[0].observations).toHaveLength(0);
  });
});
