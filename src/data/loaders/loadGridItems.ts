import rawData from '@/data/raw/grid-items.csv?raw';
import { parseCsv } from './csvParser';
import type { GridItem, GridItemRaw } from '../types/grid.types';

// NOTE: This loader is currently synchronous (using Vite's ?raw import).
// This is intentional for GLO-6 to ensure deterministic build-time data loading.
// In the future, this may be replaced by an async fetch to a backend API.
export function loadGridItems(): GridItem[] {
  const raw = parseCsv<GridItemRaw>(rawData);

  return raw.map(row => ({
    id: parseInt(row.ID, 10),
    lat: parseFloat(row.lat || '0'), // Fallback 0 or parse logic if lat/lng missing/named differently
    lng: parseFloat(row.lng || '0'),
    country: row.TERRITORY1, // Map from CSV header
    iso3: row.ISO_TER1,      // Map from CSV header
  }));
}
