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
  contextId?: string;
}

export interface InsightResponse {
  gridCellId: number;
  text: string;
  statistics?: AIStatisticalContextV1;
  meta: {
    latencyMs: number;
    totalTokensUsed: number;
  };
}

export interface AIStatisticalIndicatorSummary {
  indicator: string;
  groupingLabel: string;
  cellValue: number;
  min: number;
  q1: number;
  median: number;
  q3: number;
  max: number;
  percentile: number;
}

export interface AIStatisticalContextV1 {
  summaries: AIStatisticalIndicatorSummary[];
}

export interface StatisticsResponse {
  gridCellId: number;
  statistics: AIStatisticalContextV1;
}
