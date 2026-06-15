export interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface LocalSiteConditionContext {
  siteType: 'Reference' | 'Degraded' | 'Rehabilitated';
  totalDensity: number;
  combinedSE: number;
  samplesN: number;
}

/**
 * Local field monitoring context passed to the AI when
 * a monitoring site is associated with the selected cell.
 * Mirrors LocalSiteContextDto on the backend.
 */
export interface LocalSiteContext {
  siteName: string;
  country: string;
  /** Full institution name from the partners API. */
  partner: string;
  year: number;
  conditions: LocalSiteConditionContext[];
}

export interface InsightRequest {
  gridCellId: number;
  /** Legacy single-turn question. Prefer messages[] for multi-turn conversations. */
  question?: string;
  /** Multi-turn conversation history including the current user message as the last entry. */
  messages?: ConversationMessage[];
  contextId?: string;
  /**
   * Local field monitoring data for the site associated
   * with this grid cell. When present, the AI synthesises
   * both global modelled data and ground-truthed field
   * measurements.
   */
  localSiteContext?: LocalSiteContext;
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
  key: string;
  indicator: string;
  groupingLabel: string;
  cellValue: number;
  min: number;
  q1: number;
  median: number;
  q3: number;
  max: number;
  percentile: number;
  sampledDistribution: number[];
}

export interface AIStatisticalContextV1 {
  summaries: AIStatisticalIndicatorSummary[];
}

export interface StatisticsResponse {
  gridCellId: number;
  statistics: AIStatisticalContextV1;
}
