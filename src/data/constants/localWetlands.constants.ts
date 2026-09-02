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
