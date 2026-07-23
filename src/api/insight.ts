import posthog from 'posthog-js';
import type { InsightRequest, InsightResponse } from './types';
import { apiClient } from './client';

/**
 * Reads the current PostHog identity so the backend can attribute its AI
 * observability events ($ai_generation / $ai_embedding) to the same person and
 * session as our frontend analytics. Returns nothing when PostHog is not
 * initialised (see main.tsx) so the backend falls back to IP-based attribution.
 */
function getPostHogIdentity(): { distinctId?: string; sessionId?: string } {
  try {
    const distinctId = posthog.get_distinct_id?.();
    const sessionId = posthog.get_session_id?.();
    return {
      ...(distinctId ? { distinctId } : {}),
      ...(sessionId ? { sessionId } : {}),
    };
  } catch {
    // posthog is an uninitialised stub — no identity to send.
    return {};
  }
}

/**
 * Fetch insights from the AI backend for a specific grid cell.
 * Supports both single-turn (question) and multi-turn (messages[]) modes.
 */
export async function fetchInsight({
  gridCellId,
  question,
  messages,
  contextId,
  localSiteContext,
}: InsightRequest): Promise<InsightResponse> {
  const body: Record<string, unknown> = {
    gridCellId,
    question,
    messages,
    ...(localSiteContext ? { localSiteContext } : {}),
    // Forwarded to the backend AnalyticsInterceptor for AI event attribution.
    ...getPostHogIdentity(),
  };

  // Only pass contextId if it's not the default to keep the request clean
  if (contextId && contextId !== 'default') {
    body.contextId = contextId;
  }

  return apiClient<InsightResponse>('/ai/insight', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}
