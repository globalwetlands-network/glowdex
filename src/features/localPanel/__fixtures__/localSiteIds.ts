/**
 * Snapshot of the `site_id` values in the live local-sites.csv
 * (`${VITE_DATA_STORE_URL}/local/local-sites.csv`, local-meta updated
 * 2026-10-05). The CSV is fetched at runtime, not bundled, so the manifest
 * test checks against this copy. Refresh it when sites are added or renamed.
 */
export const LIVE_LOCAL_SITE_IDS = [
  'au-moreton-bay',
  'cr-isla-chira',
  'hk-wetland-park',
  'id-segara-anakan',
  'in-sundarbans',
  'ke-gazi',
  'mg-antsohihy',
  'mz-chiango',
  'mz-costa-do-sol',
  'ph-rasa-island',
  'tz-kisakasaka',
  'tz-unguja-central',
  'za-bayhead',
  'za-beachwood',
  'za-mlalazi',
  'za-mngazana',
  'za-mtata',
  'za-mzimvubu',
  'za-ntafufu',
] as const;
