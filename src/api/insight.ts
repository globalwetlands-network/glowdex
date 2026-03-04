export interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface InsightRequest {
  gridCellId: number;
  /** Legacy single-turn question. Prefer messages[] for multi-turn conversations. */
  question?: string;
  /** Multi-turn conversation history including the current user message as the last entry. */
  messages?: ConversationMessage[];
}

export interface InsightResponse {
  text: string;
  gridCellId: number;
}

/**
 * Fetch insights from the AI backend for a specific grid cell.
 * Supports both single-turn (question) and multi-turn (messages[]) modes.
 */
export async function fetchInsight({
  gridCellId,
  question,
  messages,
}: InsightRequest): Promise<InsightResponse> {
  const response = await fetch('/api/ai/insight', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ gridCellId, question, messages }),
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
