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

export interface InsightSource {
  citation: string;
  section: string;
  doi?: string;
}

export interface InsightResponse {
  gridCellId: number;
  text: string;
  statistics?: AIStatisticalContextV1;
  sources?: InsightSource[];
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

/** How the backend resolved its dataset at boot. Mirrors the backend enum. */
export type DatasetSourceMode = 'manifest' | 'legacy' | 'local';

/**
 * Shape of `GET /api/meta/dataset` — the dataset the backend is currently
 * serving. Mirrors `DatasetMetaResponse` in glowdex-api. `dataset_version` is
 * present only in `manifest` mode; in `legacy`/`local` mode there is no
 * manifest, so version fields are absent — the frontend skew check treats that
 * as "nothing to compare" rather than diffing against a missing value.
 */
export interface DatasetMetaResponse {
  mode: DatasetSourceMode;
  hash: string;
  buildDate: string;
  row_count: number;
  dataset_version?: string;
  schema_version?: string;
  typology_scheme?: string;
  nclust?: number;
  habitat_scope?: string;
  built?: string;
}
