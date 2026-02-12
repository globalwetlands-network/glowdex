
import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';

interface SelectionContextValue {
  selectedCellId: number | null;
  setSelectedCellId: (id: number | null) => void;
  hoveredCellId: number | null;
  setHoveredCellId: (id: number | null) => void;
}

const SelectionContext = createContext<SelectionContextValue | undefined>(undefined);

export function SelectionProvider({ children }: { children: ReactNode }) {
  const [selectedCellId, setSelectedCellId] = useState<number | null>(null);
  const [hoveredCellId, setHoveredCellId] = useState<number | null>(null);

  const value = useMemo<SelectionContextValue>(() => ({
    selectedCellId,
    setSelectedCellId,
    hoveredCellId,
    setHoveredCellId
  }), [selectedCellId, hoveredCellId]);

  return (
    <SelectionContext.Provider value={value}>
      {children}
    </SelectionContext.Provider>
  );
}

export function useSelection() {
  const context = useContext(SelectionContext);
  if (context === undefined) {
    throw new Error('useSelection must be used within a SelectionProvider');
  }
  return context;
}
