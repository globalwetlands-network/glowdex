import { describe, it, expect } from 'vitest';
import { getRegionSpecies } from './getRegionSpecies';
import type { SpeciesConfigResponse } from '@/api/species';
import type { PartnerResponse } from '@/api/partners';

function makeSpecies(
  overrides: Partial<SpeciesConfigResponse> & { id: string },
): SpeciesConfigResponse {
  return {
    commonName: overrides.id,
    scientificName: 'Genus species',
    conservationStatus: 'LC',
    iucnUrl: '',
    summaryText: '',
    dataApplicability: '',
    dataSource: '',
    learnMoreUrl: '',
    mapTipText: '',
    partnerIds: [],
    regionBounds: [],
    ...overrides,
  } as SpeciesConfigResponse;
}

// Cell somewhere off northern Australia.
const coords = { latitude: -12, longitude: 132 };

const inRange = makeSpecies({
  id: 'in-range',
  regionBounds: [{ label: 'N Australia', lat: [-20, -5], lng: [120, 150] }],
});
const outOfRange = makeSpecies({
  id: 'out-of-range',
  regionBounds: [{ label: 'Caribbean', lat: [10, 25], lng: [-90, -60] }],
});

describe('getRegionSpecies', () => {
  it('returns species whose region bounds contain the cell', () => {
    const result = getRegionSpecies(coords, [inRange, outOfRange], []);
    expect(result.map((s) => s.id)).toEqual(['in-range']);
  });

  it('returns an empty array when the cell has no coordinates', () => {
    expect(getRegionSpecies(undefined, [inRange], [])).toEqual([]);
  });

  it('returns an empty array when no species match the region', () => {
    expect(getRegionSpecies(coords, [outOfRange], [])).toEqual([]);
  });

  it('includes species matched via a nearby partner', () => {
    const partnerSpecies = makeSpecies({
      id: 'partner-species',
      partnerIds: ['p1'],
    });
    const partners: PartnerResponse[] = [
      {
        id: 'p1',
        institution: 'Nearby Institute',
        coordinates: [132.1, -12.1], // ~15km away
      } as PartnerResponse,
    ];
    const result = getRegionSpecies(coords, [partnerSpecies], partners);
    expect(result.map((s) => s.id)).toContain('partner-species');
  });

  it('ignores a partner match that is geographically distant', () => {
    const partnerSpecies = makeSpecies({
      id: 'distant-partner-species',
      partnerIds: ['p2'],
    });
    const partners: PartnerResponse[] = [
      {
        id: 'p2',
        institution: 'Far Institute',
        coordinates: [-70, 15], // Caribbean, thousands of km away
      } as PartnerResponse,
    ];
    expect(getRegionSpecies(coords, [partnerSpecies], partners)).toEqual([]);
  });

  it('excludes stub species', () => {
    const stub = makeSpecies({
      id: 'stub',
      stub: true,
      regionBounds: [{ label: 'N Australia', lat: [-20, -5], lng: [120, 150] }],
    });
    expect(getRegionSpecies(coords, [stub], [])).toEqual([]);
  });

  it('deduplicates a species matched by both partner and region', () => {
    const both = makeSpecies({
      id: 'both',
      partnerIds: ['p1'],
      regionBounds: [{ label: 'N Australia', lat: [-20, -5], lng: [120, 150] }],
    });
    const partners: PartnerResponse[] = [
      {
        id: 'p1',
        institution: 'Nearby Institute',
        coordinates: [132.1, -12.1],
      } as PartnerResponse,
    ];
    const result = getRegionSpecies(coords, [both], partners);
    expect(result).toHaveLength(1);
  });
});
