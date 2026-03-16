import type { StatisticsResponse } from './types';
import { apiClient } from './client';

/**
 * Fetch deterministic statistical summaries for a specific grid cell.
 * This is faster than fetchInsight as it does not involve LLM execution.
 */
export async function fetchStatistics(
  gridCellId: number,
  contextId: string = 'default',
): Promise<StatisticsResponse> {

  const params = new URLSearchParams();

  if (contextId !== 'default') {
    params.set('contextId', contextId);
  }

  const query = params.toString();
  const endpoint = `/statistics/${gridCellId}${query ? `?${query}` : ''}`;

  return apiClient<StatisticsResponse>(endpoint);
}
