import type { StatisticsResponse } from './types';

/**
 * Fetch deterministic statistical summaries for a specific grid cell.
 * This is faster than fetchInsight as it does not involve LLM execution.
 */
export async function fetchStatistics(gridCellId: number): Promise<StatisticsResponse> {
  const response = await fetch(`/api/statistics/${gridCellId}`);

  if (!response.ok) {
    let errorMessage = 'Failed to fetch statistics';
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorMessage;
    } catch {
      // Ignore
    }
    throw new Error(errorMessage);
  }

  return response.json();
}
