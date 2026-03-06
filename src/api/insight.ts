import type { InsightRequest, InsightResponse } from './types';

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
  const body: Record<string, any> = { gridCellId, question, messages };

  // Only pass contextId if it's not the default to keep the request clean
  if (contextId && contextId !== 'default') {
    body.contextId = contextId;
  }

  const response = await fetch('/api/ai/insight', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    let errorMessage = 'Failed to fetch insight';
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorMessage;
    } catch {
      // Ignore JSON parse errors for non-JSON responses
    }
    throw new Error(errorMessage);
  }

  return response.json();
}
