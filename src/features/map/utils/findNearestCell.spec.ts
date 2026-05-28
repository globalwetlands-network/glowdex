import { findNearestCell } from './findNearestCell';
import type { RichGridCell } from '@/data/types/grid.types';
import { Habitat } from '@/types/enums/habitat.enum';
import { describe, expect, it } from 'vitest';

/**
 * Minimal mock cell factory — only populates fields relevant to findNearestCell.
 * Other required fields are cast via `as unknown as RichGridCell` to avoid
 * coupling the test to unrelated schema changes.
 */
function mockCell(id: number, lat: number, lng: number): RichGridCell {
  return {
    id,
    lat,
    lng,
    residuals: {},
    [Habitat.MANGROVES]: true,
    [Habitat.SALTMARSH]: false,
    [Habitat.SEAGRASS]: false,
  } as unknown as RichGridCell;
}

const cells: RichGridCell[] = [
  mockCell(1, -6.2, 39.2), // Zanzibar — close to coast
  mockCell(2, 9.7, 118.7), // Palawan, Philippines
  mockCell(3, -27.5, 153.0), // Queensland, Australia
];

describe('findNearestCell', () => {
  it('returns the nearest cell within the default threshold', () => {
    // Given: a search location near Zanzibar
    // When: finding the nearest cell
    const result = findNearestCell(39.207743, -6.166059, cells);

    // Then: returns the Zanzibar cell
    expect(result).toBe(1);
  });

  it('returns null when no cell is within the threshold', () => {
    // Given: a search location in the middle of Europe with no nearby mangrove cells
    // When: finding the nearest cell with default 500km threshold
    const result = findNearestCell(2.3522, 48.8566, cells); // Paris

    // Then: no cell is close enough
    expect(result).toBeNull();
  });

  it('returns null when cells array is empty', () => {
    // Given: no cells available
    // When: finding the nearest cell
    const result = findNearestCell(39.207743, -6.166059, []);

    // Then: returns null
    expect(result).toBeNull();
  });

  it('respects a custom threshold', () => {
    // Given: a search location near Zanzibar and a very tight threshold of 1km
    // When: finding nearest cell with 1km threshold
    const result = findNearestCell(39.207743, -6.166059, cells, 1);

    // Then: no cell is within 1km
    expect(result).toBeNull();
  });

  it('skips cells with missing coordinates', () => {
    // Given: a mix of cells with and without coordinates
    const cellsWithMissing: RichGridCell[] = [
      {
        id: 99,
        residuals: {},
        [Habitat.MANGROVES]: true,
        [Habitat.SALTMARSH]: false,
        [Habitat.SEAGRASS]: false,
      } as unknown as RichGridCell,
      mockCell(1, -6.2, 39.2),
    ];

    // When: finding the nearest cell
    const result = findNearestCell(39.207743, -6.166059, cellsWithMissing);

    // Then: skips the cell without coords and returns the valid one
    expect(result).toBe(1);
  });

  it('selects the closest of multiple nearby cells', () => {
    // Given: two cells both within threshold, one closer
    const nearbyCells: RichGridCell[] = [
      mockCell(10, -6.2, 39.2), // ~5km from Zanzibar City
      mockCell(11, -6.5, 39.5), // ~50km from Zanzibar City
    ];

    // When: finding the nearest cell
    const result = findNearestCell(39.207743, -6.166059, nearbyCells);

    // Then: returns the closer cell
    expect(result).toBe(10);
  });
});
