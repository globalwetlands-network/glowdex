import { createContext, useContext } from 'react';

export interface SelectionContextValue {
  selectedCellId: number | null;
  setSelectedCellId: (id: number | null) => void;
  hoveredCellId: number | null;
  setHoveredCellId: (id: number | null) => void;
}

export const SelectionContext = createContext<
  SelectionContextValue | undefined
>(undefined);

export function useSelection() {
  const context = useContext(SelectionContext);
  if (context === undefined) {
    throw new Error('useSelection must be used within a SelectionProvider');
  }
  return context;
}
