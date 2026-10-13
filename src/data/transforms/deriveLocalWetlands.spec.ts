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
    Site_lat: '-29.8896064',
    Site_long: '31.0125925',
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
    Site_lat: '-29.8896064',
    Site_long: '31.0125925',
    Year: '2026',
    Site_Type: 'Reference',
    Species_richness: '3',
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
        siteRow({ Site_Type: 'Degraded', Site_long: '31.0383481' }),
        siteRow({ Site_Type: 'Reference', Site_long: '31.0179211' }),
        siteRow({ Site_Type: 'Rehabilitated', Site_long: '31.0408006' }),
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
          Site_lat: '',
          Site_long: '',
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
          Site_lat: '4.42483',
          Site_long: '39.53684',
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
          Site_lat: '-27.693817',
          Site_long: '153.322803',
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
          Site_lat: '-29.8064421',
          Site_long: '31.0383481',
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

  it('falls back to the legacy Location_lat/Location_long headers', () => {
    const legacy: LocalSiteRaw = {
      Country_name: 'South Africa',
      Location_name: 'Bayhead',
      Location_lat: '-29.8896064',
      Location_long: '31.0125925',
      Year: '2026',
      Site_Type: 'Reference',
      site_id: 'za-bayhead',
      partner_id: 'uwc-za',
    };
    const sites = deriveLocalWetlands([legacy], []);
    expect(sites).toHaveLength(1);
    expect(sites[0].coordinates).toEqual([31.0125925, -29.8896064]);
  });

  it('still loads sites when name, country and Site_Type columns are missing', () => {
    const row = siteRow();
    delete row.Location_name;
    delete row.Country_name;
    delete row.Site_Type;

    const sites = deriveLocalWetlands([row], []);
    expect(sites).toHaveLength(1);
    expect(sites[0].name).toBe('');
    expect(sites[0].country).toBe('');
    expect(sites[0].points[0].condition).toBe('');
  });

  it('reads observations with no Species column and ignores Species_richness', () => {
    const row = obsRow({ Species_richness: '7', Density: '4.5' });
    expect(row).not.toHaveProperty('Species');

    const sites = deriveLocalWetlands([siteRow()], [row]);
    expect(sites[0].observations).toEqual([
      {
        year: 2026,
        siteType: 'Reference',
        density: 4.5,
        se: 1,
        samplesN: 5,
      },
    ]);
  });

  it('skips an observation whose Site_Type column is missing', () => {
    const row = obsRow();
    delete row.Site_Type;
    const sites = deriveLocalWetlands([siteRow()], [row]);
    expect(sites[0].observations).toHaveLength(0);
  });

  it('keeps every observation row for a condition with several points', () => {
    const sites = deriveLocalWetlands(
      [siteRow()],
      [obsRow({ Density: '10' }), obsRow({ Density: '12' })],
    );
    expect(sites[0].observations.map((o) => o.density)).toEqual([10, 12]);
  });

  it('drops an observation whose site_id is missing', () => {
    const sites = deriveLocalWetlands(
      [siteRow()],
      [obsRow({ site_id: '', Density: '10' })],
    );
    expect(sites[0].observations).toHaveLength(0);
  });
});
