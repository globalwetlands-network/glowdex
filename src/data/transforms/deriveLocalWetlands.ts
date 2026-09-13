import type {
  LocalSiteRaw,
  LocalObservationRaw,
  LocalObservation,
  LocalSite,
  LocalSitePoint,
  LocalSiteMetadata,
  SiteCondition,
} from '../types/local-wetlands.types';

const SITE_CONDITIONS: SiteCondition[] = [
  'Reference',
  'Degraded',
  'Rehabilitated',
];

function isSiteCondition(value: string): value is SiteCondition {
  return (SITE_CONDITIONS as string[]).includes(value);
}

/**
 * Synonyms folded onto the canonical condition set. "Restored" is
 * the same category as "Rehabilitated". Applied to both files so a
 * future monthly data drop using either term stays consistent
 * without a code change.
 */
const CONDITION_ALIASES: Record<string, string> = {
  Restored: 'Rehabilitated',
};

function normalizeCondition(value: string): string {
  return CONDITION_ALIASES[value] ?? value;
}

/**
 * Parses the observations file into per-site observations, keyed by
 * the stable `site_id`. That id is assigned once per site and never
 * changes on rename, so a renamed site's density lands on the right
 * site with no name-matching or bridging map.
 */
function deriveObservations(
  obsRows: LocalObservationRaw[],
): Map<string, LocalObservation[]> {
  const bySite = new Map<string, LocalObservation[]>();

  for (const row of obsRows) {
    const siteId = row.site_id?.trim();
    if (!siteId) {
      console.warn('deriveLocalWetlands: skipping observation with no site_id');
      continue;
    }

    const siteType = normalizeCondition(row.Site_Type);
    if (!isSiteCondition(siteType)) {
      console.warn(`Skipping unknown Site_Type "${row.Site_Type}"`);
      continue;
    }

    const year = parseInt(row.Year, 10);
    if (isNaN(year)) {
      console.warn(
        `Skipping observation with invalid year: ` +
          `site_id=${siteId}, Year=${row.Year}`,
      );
      continue;
    }

    if (!bySite.has(siteId)) {
      bySite.set(siteId, []);
    }

    // Only record an observation when density data is present. A month
    // with no measurements (empty Density/SE/Samples_n) is normal.
    const density = parseFloat(row.Density);
    const se = parseFloat(row.SE);
    const samplesN = parseInt(row.Samples_n, 10);
    if (!isNaN(density) && !isNaN(se) && !isNaN(samplesN)) {
      bySite.get(siteId)!.push({
        year,
        siteType,
        species: row.Species.trim(),
        density,
        se,
        samplesN,
      });
    }
  }

  return bySite;
}

/**
 * Builds LocalSite objects from the two source files.
 *
 * Coordinates, the site list, and the partner come from the sites
 * file (one marker point per row). Density/species data comes from
 * the observations file, joined by the stable `site_id`. Sites present
 * only in the sites file (e.g. Beachwood) get an empty observations
 * array and render as "Data still to be analysed".
 */
export function deriveLocalWetlands(
  siteRows: LocalSiteRaw[],
  obsRows: LocalObservationRaw[],
): LocalSite[] {
  const obsBySite = deriveObservations(obsRows);

  const siteMap = new Map<
    string,
    { points: LocalSitePoint[]; meta: LocalSiteMetadata }
  >();

  for (const row of siteRows) {
    const siteId = row.site_id?.trim();
    if (!siteId) {
      console.warn('deriveLocalWetlands: skipping site row with no site_id');
      continue;
    }

    const lat = parseFloat(row.Location_lat);
    const lng = parseFloat(row.Location_long);
    // Skip points without coordinates — a site with no valid points
    // renders no marker.
    if (isNaN(lat) || isNaN(lng)) {
      continue;
    }

    // Normalise synonyms (e.g. "Restored" → "Rehabilitated"); accept
    // any other non-empty Site_Type for markers — the strict
    // SiteCondition guard only applies to chart data.
    const condition = normalizeCondition(row.Site_Type.trim());
    const point: LocalSitePoint = { coordinates: [lng, lat], condition };

    const existing = siteMap.get(siteId);
    if (existing) {
      existing.points.push(point);
    } else {
      siteMap.set(siteId, {
        points: [point],
        meta: {
          id: siteId,
          name: row.Location_name.trim(),
          country: row.Country_name.trim(),
          coordinates: [lng, lat], // representative point = first row
          partnerId: row.partner_id?.trim() || null,
        },
      });
    }
  }

  return Array.from(siteMap.values()).map(({ points, meta }) => {
    const observations = obsBySite.get(meta.id) ?? [];

    if (!meta.partnerId) {
      console.warn(
        `No partner_id for site "${meta.id}" (${meta.name}). ` +
          `Add it to the sites file partner_id column — the partner ` +
          `link will not be shown for this site.`,
      );
    }

    return {
      ...meta,
      points,
      availableYears: [...new Set(observations.map((o) => o.year))].sort(
        (a, b) => a - b,
      ),
      observations,
    };
  });
}
