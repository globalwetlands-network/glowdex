
import { useMemo, useState, type ReactNode } from 'react';

// Context
import { SelectionContext, type SelectionContextValue } from './SelectionContext';

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
