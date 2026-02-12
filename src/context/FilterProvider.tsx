
import { useMemo, useState, type ReactNode } from 'react';
import { INITIAL_FILTER_STATE, type FilterState } from '@/features/widgets/types/filter.types';

// Context
import { FilterContext, type FilterContextValue } from './FilterContext';

export function FilterProvider({ children }: { children: ReactNode }) {
  const [filterState, setFilterState] = useState<FilterState>(INITIAL_FILTER_STATE);

  const value = useMemo<FilterContextValue>(() => ({
    filterState,
    setFilterState
  }), [filterState]);

  return (
    <FilterContext.Provider value={value}>
      {children}
    </FilterContext.Provider>
  );
}
