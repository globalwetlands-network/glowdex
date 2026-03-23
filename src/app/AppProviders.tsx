import { type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { DataProvider } from '@/context/DataProvider';
import { FilterProvider } from '@/context/FilterProvider';
import { SelectionProvider } from '@/context/SelectionProvider';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <DataProvider>
        <FilterProvider>
          <SelectionProvider>{children}</SelectionProvider>
        </FilterProvider>
      </DataProvider>
    </QueryClientProvider>
  );
}
