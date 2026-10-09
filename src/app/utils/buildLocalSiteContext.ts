import type { LocalSiteContext } from '@/api/types';
import type { PartnerResponse } from '@/api/partners';
import type { LocalSite } from '@/data/types/local-wetlands.types';
import { observationEntries } from '@/data/transforms/aggregateLocalObservations';
import { MAX_LOCAL_AI_CONDITIONS } from '@/data/constants/localWetlands.constants';

/**
 * Builds the local site context sent to the AI assistant in Local mode
 * (GLO-207). Uses the most recent available year, with one entry per
 * sampling point (capped at MAX_LOCAL_AI_CONDITIONS). Returns null when the
 * site has no analysed data, or when every sampling point has zero samples
 * (no field data collected).
 *
 * The partner institution name is resolved from the partners API so the
 * AI receives the full name rather than the partner id slug. While that
 * request is in flight (`partners` undefined, `partnersFailed` false) this
 * returns null so the AI waits for the name. If the request has failed,
 * it falls back to the site name — the same fallback used for a partner id
 * missing from the registry — so the assistant still works instead of
 * silently disappearing.
 */
export function buildLocalSiteContext(
  site: LocalSite | undefined,
  partners: PartnerResponse[] | undefined,
  partnersFailed: boolean,
): LocalSiteContext | null {
  if (!site || !site.observations.length) return null;

  // availableYears is sorted ascending in deriveLocalWetlands —
  // .at(-1) safely returns the most recent year.
  const year = site.availableYears.at(-1) ?? null;
  if (!year) return null;

  // One entry per observation row, labelled like the chart bars.
  // Drop rows with no samples — zero samplesN indicates no field data
  // was collected at that point this year. Labels are assigned before
  // this filter, so a dropped row can leave a lone "Reference 1".
  const entries = observationEntries(site.observations, year).filter(
    (c) => c.samplesN > 0,
  );
  if (!entries.length) return null;

  // The backend rejects more than MAX_LOCAL_AI_CONDITIONS entries.
  if (entries.length > MAX_LOCAL_AI_CONDITIONS) {
    console.warn(
      `Site "${site.id}" has ${entries.length} observation rows for ` +
        `${year}; sending the first ${MAX_LOCAL_AI_CONDITIONS} to the AI.`,
    );
  }
  const conditions = entries.slice(0, MAX_LOCAL_AI_CONDITIONS);

  if (site.partnerId && !partners && !partnersFailed) return null;

  const partnerName = site.partnerId
    ? (partners?.find((p) => p.id === site.partnerId)?.institution ?? site.name)
    : site.name;

  return {
    siteName: site.name,
    country: site.country,
    partner: partnerName,
    year,
    conditions,
  };
}
