import type { StatisticsResponse } from './types';

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
  const url = `/api/statistics/${gridCellId}${query ? `?${query}` : ''}`;

  const response = await fetch(url);

  if (!response.ok) {
    let errorMessage = 'Failed to fetch statistics';
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorMessage;
    } catch { }
    throw new Error(errorMessage);
  }

  return response.json();
}
