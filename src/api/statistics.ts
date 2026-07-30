import type { StatisticsResponse } from './types';
import { apiClient } from './client';

/**
 * Fetch deterministic statistical summaries for a specific grid cell.
 * This is faster than fetchInsight as it does not involve LLM execution.
 */
export async function fetchStatistics(
  gridCellId: number,
): Promise<StatisticsResponse> {
  return apiClient<StatisticsResponse>(`/statistics/${gridCellId}`);
}
