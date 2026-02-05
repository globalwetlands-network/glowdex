import rawData from '../raw/grid-items.csv?raw';
import { parseCsv } from './csvParser';
import type { GridItem, GridItemRaw } from '../types/grid.types';

export function loadGridItems(): GridItem[] {
  const raw = parseCsv<GridItemRaw>(rawData);

  return raw.map(row => ({
    id: parseInt(row.ID, 10),
    lat: parseFloat(row.lat),
    lng: parseFloat(row.lng),
    country: row.country,
    iso3: row.iso3,
  }));
}
