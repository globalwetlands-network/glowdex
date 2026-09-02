/**
 * Maximum distance in km between a monitoring site
 * and a selected cell center for the site to be
 * considered associated with that cell.
 *
 * 100km × √2 ≈ 141km (grid cell diagonal) + 16km
 * buffer = 157km. Sites beyond this threshold are
 * not shown, preventing cross-cell associations.
 */
export const MAX_SITE_ASSOCIATION_DISTANCE_KM = 157;

/**
 * Map zoom at which the local-sites layer switches from one
 * representative pin per site (below) to one pin per coordinate
 * point (at/above). Keeps coincident/near-coincident points from
 * reading as a single blob at low zoom while still exposing the
 * precise per-condition coordinates as the user zooms in.
 */
export const LOCAL_SITE_POINT_ZOOM = 9;

/**
 * Colours per site condition, shared by the crab-density chart
 * (SiteConditionChart) and the map hover badge so the two never
 * drift. Matches the chart's ecological palette. ("Restored" is
 * normalised to "Rehabilitated" in deriveLocalWetlands, so it never
 * reaches here as a distinct condition.)
 */
export const SITE_CONDITION_COLORS: Record<string, string> = {
  Reference: '#4a7c59', // deep sage green
  Degraded: '#b85c4a', // muted terracotta
  Rehabilitated: '#c49a3c', // warm amber
};

/** Stable display order for condition badges. Unknowns are appended. */
export const SITE_CONDITION_ORDER = ['Reference', 'Degraded', 'Rehabilitated'];

/** Fallback colour for any unexpected Site_Type value. */
export const SITE_CONDITION_FALLBACK_COLOR = '#6b7280';
