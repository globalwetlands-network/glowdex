
import { createContext, useContext } from 'react';
import type { FilterState } from '@/features/widgets/types/filter.types';

export interface FilterContextValue {
  filterState: FilterState;
  setFilterState: (state: FilterState | ((prev: FilterState) => FilterState)) => void;
}

export const FilterContext = createContext<FilterContextValue | undefined>(undefined);

export function useFilter() {
  const context = useContext(FilterContext);
  if (context === undefined) {
    throw new Error('useFilter must be used within a FilterProvider');
  }
  return context;
}
