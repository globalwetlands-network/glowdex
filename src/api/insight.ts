import posthog from 'posthog-js';
import type {
  InsightMode,
  InsightRequest,
  InsightResponse,
  InsightSubject,
  LocalSiteContext,
} from './types';
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
 * The insight subject for `mode`, or null while it isn't available yet (no
 * cell selected, or the site's field context not built). Callers fetch only
 * once this is non-null.
 */
export function insightSubject(
  mode: InsightMode,
  gridCellId: number | null | undefined,
  localSiteContext: LocalSiteContext | null | undefined,
): InsightSubject | null {
  if (mode === 'local') {
    return localSiteContext ? { mode, localSiteContext } : null;
  }
  return gridCellId != null ? { mode, gridCellId } : null;
}

/**
 * Fetch insights from the AI backend for a grid cell (global mode) or a
 * monitoring site (local mode). Supports both single-turn (question) and
 * multi-turn (messages[]) requests.
 *
 * Each mode sends only its own subject so the backend can never blend them:
 * global omits localSiteContext, local omits gridCellId. The types already
 * forbid mixing them; this also holds for an untyped caller.
 */
export async function fetchInsight(
  request: InsightRequest,
): Promise<InsightResponse> {
  const { question, messages, contextId } = request;
  const body: Record<string, unknown> = {
    mode: request.mode,
    ...(request.mode === 'global'
      ? { gridCellId: request.gridCellId }
      : { localSiteContext: request.localSiteContext }),
    question,
    messages,
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
