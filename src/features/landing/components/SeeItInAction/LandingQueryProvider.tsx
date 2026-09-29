import { type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { EXAMPLE_PARTNERS } from '../../fixtures/workedExample';

/**
 * Query client for the landing page's reused app widgets. The landing page
 * sits outside AppProviders; this client is pre-seeded with the worked
 * example's data and never refetches, so the showcase makes no API calls.
 */
const landingQueryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: Infinity, retry: false, refetchOnWindowFocus: false },
  },
});
landingQueryClient.setQueryData(['partners'], EXAMPLE_PARTNERS);

export function LandingQueryProvider({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={landingQueryClient}>
      {children}
    </QueryClientProvider>
  );
}
