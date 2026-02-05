import rawData from '../raw/grid-items-residuals.csv?raw';
import { parseCsv } from './csvParser';
import type { Residuals, ResidualsRaw } from '../types/grid.types';

export function loadResiduals(): Residuals[] {
  const raw = parseCsv<ResidualsRaw>(rawData);

  return raw.map(row => {
    const { ID, ...rest } = row;
    // Everything else is a numeric residual value
    const values: Record<string, number> = {};
    Object.entries(rest).forEach(([key, val]) => {
      if (val !== undefined && val !== '') {
        values[key] = parseFloat(val);
      }
    });

    return {
      id: parseInt(ID, 10),
      values,
    };
  });
}
