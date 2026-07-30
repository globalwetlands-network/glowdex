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
