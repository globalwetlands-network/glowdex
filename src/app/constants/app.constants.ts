/**
 * Application-wide constants
 */

/** Mobile breakpoint in pixels */
export const MOBILE_BREAKPOINT = 768;

/** Quantile slider configuration */
export const QUANTILE_CONFIG = {
  MIN: 0,
  MAX: 0.5,
  STEP: 0.05,
  DEFAULT: 0.25,
} as const;

/** Typology scale mappings */
export const TYPOLOGY_SCALE_MAP = {
  scale5: 5,
  scale18: 18,
} as const;
