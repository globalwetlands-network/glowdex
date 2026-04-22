import type { InsightRequest, InsightResponse } from './types';
import { apiClient } from './client';

/**
 * Fetch insights from the AI backend for a specific grid cell.
 * Supports both single-turn (question) and multi-turn (messages[]) modes.
 */
export async function fetchInsight({
  gridCellId,
  question,
  messages,
  contextId,
}: InsightRequest): Promise<InsightResponse> {
  const body: Record<string, unknown> = { gridCellId, question, messages };

  // Only pass contextId if it's not the default to keep the request clean
  if (contextId && contextId !== 'default') {
    body.contextId = contextId;
  }

  return apiClient<InsightResponse>('/ai/insight', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}
