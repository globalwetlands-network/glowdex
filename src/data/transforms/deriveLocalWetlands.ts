/**
 * Transforms raw local wetlands CSV rows into typed LocalSite[].
 *
 * One site is hardcoded for iteration one (Mgazana, ZAF).
 * The transform is designed to scale to multiple sites — each
 * site is identified by a siteId derived from the row data.
 *
 * globalMaxDensity mirrors Nelson's fixed_y_limit:
 * sum all species densities per condition per year, add
 * combined SE, take the maximum across all groups × 1.1,
 * with a minimum floor of 5.
 */

import type {
  LocalObservationRaw,
  LocalObservation,
  LocalSite,
  LocalSiteMetadata,
  SiteCondition,
} from '../types/local-wetlands.types';

const SITE_CONDITIONS: SiteCondition[] = [
  'Reference',
  'Degraded',
  'Rehabilitated',
];

/**
 * Site metadata registry for iteration one.
 *
 * TODO: Replace placeholder coordinates with verified
 * Mgazana geolocation before release.
 * TODO: Confirm partner organisation name with science
 * team before release.
 *
 * When additional sites are added, add a new entry here
 * and add a Site_ID column to local-wetlands-crab-data.csv so rows
 * can be attributed to the correct site.
 */
const SITE_METADATA: Record<string, LocalSiteMetadata> = {
  'mgazana-zaf': {
    id: 'mgazana-zaf',
    name: 'Mgazana',
    country: 'South Africa',
    countryCode: 'ZAF',
    partner: 'University of the Western Cape (UWC)',
    coordinates: [29.45, -31.68], // [lng, lat] — placeholder
  },
};

function isSiteCondition(value: string): value is SiteCondition {
  return (SITE_CONDITIONS as string[]).includes(value);
}

export function deriveLocalWetlands(
  rawRows: LocalObservationRaw[],
): LocalSite[] {
  // Group observations by siteId.
  // For iteration one all rows belong to 'mgazana-zaf'.
  // When a Site_ID column is added to the CSV, derive
  // siteId from that column here instead.
  const siteMap = new Map<string, LocalObservation[]>();

  for (const row of rawRows) {
    if (!isSiteCondition(row.Site_Type)) {
      console.warn(`Unknown Site_Type "${row.Site_Type}" — skipping row`);
      continue;
    }

    const siteId = 'mgazana-zaf';
    if (!siteMap.has(siteId)) {
      siteMap.set(siteId, []);
    }

    siteMap.get(siteId)!.push({
      year: parseInt(row.Year, 10),
      siteType: row.Site_Type,
      species: row.Species,
      density: parseFloat(row.Density),
      se: parseFloat(row.SE),
      samplesN: parseInt(row.Samples_n, 10),
    });
  }

  return Array.from(siteMap.entries()).map(([siteId, observations]) => {
    const meta = SITE_METADATA[siteId];
    if (!meta) {
      throw new Error(
        `No metadata found for siteId "${siteId}". ` +
          `Add an entry to SITE_METADATA in deriveLocalWetlands.ts.`,
      );
    }

    const availableYears = [...new Set(observations.map((o) => o.year))].sort(
      (a, b) => a - b,
    );

    // Compute fixed Y-axis max — mirrors Nelson's fixed_y_limit.
    // Group by year + siteType, sum densities and combined SE,
    // take max across all groups × 1.1 buffer.
    // Minimum floor of 5 prevents zero-height chart when all
    // densities are zero.
    const yearConditionMap = new Map<string, LocalObservation[]>();

    for (const obs of observations) {
      const key = `${obs.year}__${obs.siteType}`;
      if (!yearConditionMap.has(key)) {
        yearConditionMap.set(key, []);
      }
      yearConditionMap.get(key)!.push(obs);
    }

    const groupTotals = Array.from(yearConditionMap.values()).map((group) => {
      const totalDensity = group.reduce((sum, o) => sum + o.density, 0);
      const combinedSE = Math.sqrt(
        group.reduce((sum, o) => sum + o.se ** 2, 0),
      );
      return totalDensity + combinedSE;
    });

    const globalMaxDensity = Math.max(...groupTotals, 5) * 1.1;

    return {
      ...meta,
      observations,
      availableYears,
      globalMaxDensity,
    };
  });
}
