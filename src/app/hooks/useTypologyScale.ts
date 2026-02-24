import { useMemo } from 'react';

import { TYPOLOGY_SCALE_MAP } from '../constants/app.constants';

/**
 * Converts typology scale from string format to numeric format
 * 
 * @param typologyScale - Scale in 'scale5' or 'scale18' format
 * @returns Numeric scale value (5 or 18)
 */
export function useTypologyScale(typologyScale: 'scale5' | 'scale18'): 5 | 18 {
  return useMemo(
    () => TYPOLOGY_SCALE_MAP[typologyScale],
    [typologyScale]
  );
}
