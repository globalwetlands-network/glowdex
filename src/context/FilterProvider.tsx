
import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import { INITIAL_FILTER_STATE, type FilterState } from '@/features/widgets/types/filter.types';

interface FilterContextValue {
  filterState: FilterState;
  setFilterState: (state: FilterState | ((prev: FilterState) => FilterState)) => void;
}

const FilterContext = createContext<FilterContextValue | undefined>(undefined);

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

export function useFilter() {
  const context = useContext(FilterContext);
  if (context === undefined) {
    throw new Error('useFilter must be used within a FilterProvider');
  }
  return context;
}
