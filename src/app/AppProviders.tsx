import { type ReactNode } from 'react';
import { DataProvider } from '@/context/DataProvider';
import { FilterProvider } from '@/context/FilterProvider';
import { SelectionProvider } from '@/context/SelectionProvider';

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <DataProvider>
      <FilterProvider>
        <SelectionProvider>
          {children}
        </SelectionProvider>
      </FilterProvider>
    </DataProvider>
  );
}
