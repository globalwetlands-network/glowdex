import { describe, it, expect } from 'vitest';
import { observationEntries } from './aggregateLocalObservations';
import type { LocalObservation } from '../types/local-wetlands.types';

function obs(over: Partial<LocalObservation> = {}): LocalObservation {
  return {
    year: 2026,
    siteType: 'Reference',
    density: 10,
    se: 1,
    samplesN: 5,
    ...over,
  };
}

describe('observationEntries', () => {
  it('returns one entry per row without summing', () => {
    const entries = observationEntries(
      [
        obs({ density: 10, se: 1, samplesN: 5 }),
        obs({ density: 12, se: 2, samplesN: 6 }),
      ],
      2026,
    );
    expect(entries).toEqual([
      {
        siteType: 'Reference',
        label: 'Reference 1',
        totalDensity: 10,
        combinedSE: 1,
        samplesN: 5,
      },
      {
        siteType: 'Reference',
        label: 'Reference 2',
        totalDensity: 12,
        combinedSE: 2,
        samplesN: 6,
      },
    ]);
  });

  it('orders Reference, Degraded, Rehabilitated, then file order', () => {
    const entries = observationEntries(
      [
        obs({ siteType: 'Rehabilitated', density: 1 }),
        obs({ siteType: 'Degraded', density: 2 }),
        obs({ siteType: 'Reference', density: 3 }),
        obs({ siteType: 'Degraded', density: 4 }),
      ],
      2026,
    );
    expect(entries.map((e) => [e.label, e.totalDensity])).toEqual([
      ['Reference', 3],
      ['Degraded 1', 2],
      ['Degraded 2', 4],
      ['Rehabilitated', 1],
    ]);
  });

  it('uses the plain condition name when a condition has one row', () => {
    const entries = observationEntries(
      [obs({ siteType: 'Degraded' }), obs({ siteType: 'Rehabilitated' })],
      2026,
    );
    expect(entries.map((e) => e.label)).toEqual(['Degraded', 'Rehabilitated']);
  });

  it('includes only the requested year and numbers within it', () => {
    const entries = observationEntries(
      [obs({ year: 2025, density: 99 }), obs({ year: 2026, density: 10 })],
      2026,
    );
    expect(entries).toHaveLength(1);
    expect(entries[0].label).toBe('Reference');
    expect(entries[0].totalDensity).toBe(10);
  });

  it('returns an empty list when there are no rows', () => {
    expect(observationEntries([], 2026)).toEqual([]);
  });
});
