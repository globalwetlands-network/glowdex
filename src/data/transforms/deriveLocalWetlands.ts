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

function isSiteCondition(value: string): value is SiteCondition {
  return (SITE_CONDITIONS as string[]).includes(value);
}

/**
 * Normalises a string to a stable kebab-case slug.
 * Strips punctuation and special characters before
 * replacing spaces with hyphens, preventing collisions
 * from names that differ only in punctuation.
 */
function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

/**
 * Fallback partner ID mapping by slugified location name.
 * Used when a row has no Partner_id CSV column value.
 * Partner IDs match PARTNER_REGISTRY in
 * glowdex-api/src/partners/partner.config.ts.
 */
const PARTNER_ID_BY_LOCATION: Record<string, string> = {
  mngazana: 'uwc-za',
  bayhead: 'uwc-za',
  annandale: 'griffith-university-au',
  'punta-flor': 'universidad-costa-rica-cr',
  'honda-bay': 'katala-foundation-ph',
};

export function deriveLocalWetlands(
  rawRows: LocalObservationRaw[],
): LocalSite[] {
  const siteMap = new Map<
    string,
    {
      rows: LocalObservation[];
      meta: LocalSiteMetadata;
    }
  >();

  for (const row of rawRows) {
    if (!isSiteCondition(row.Site_Type)) {
      console.warn(`Skipping unknown Site_Type "${row.Site_Type}"`);
      continue;
    }

    const density = parseFloat(row.Density);
    const se = parseFloat(row.SE);
    const samplesN = parseInt(row.Samples_n, 10);
    const year = parseInt(row.Year, 10);
    const lat = parseFloat(row.Location_lat);
    const lng = parseFloat(row.Location_long);

    if (isNaN(year) || isNaN(lat) || isNaN(lng)) {
      console.warn(
        `Skipping malformed row — invalid coordinates or year: ` +
          `Location=${row.Location_name}, Year=${row.Year}`,
      );
      continue;
    }

    if (!row.Location_name || !row.Country_name) {
      console.warn(
        'deriveLocalWetlands: skipping malformed row ' +
          `— Location_name="${row.Location_name ?? 'undefined'}"` +
          `, Country_name="${row.Country_name ?? 'undefined'}"`,
      );
      continue;
    }

    // Trim whitespace — CSV values may have trailing spaces
    const locationName = row.Location_name.trim();
    const countryName = row.Country_name.trim();

    const locationSlug = slugify(locationName);
    const siteId = `${locationSlug}-${slugify(countryName)}`;

    if (!siteMap.has(siteId)) {
      // CSV Partner_id takes priority; fall back to hardcoded location map
      const csvPartnerId = row.Partner_id?.trim() || null;
      const partnerId =
        csvPartnerId ?? PARTNER_ID_BY_LOCATION[locationSlug] ?? null;

      if (!partnerId) {
        console.warn(
          `No partner ID found for location "${locationName}". ` +
            `Add Partner_id to CSV or PARTNER_ID_BY_LOCATION fallback. ` +
            `Partner link will not be shown for this site.`,
        );
      }

      siteMap.set(siteId, {
        rows: [],
        meta: {
          id: siteId,
          name: locationName,
          country: countryName,
          coordinates: [lng, lat], // [lng, lat] GeoJSON
          partnerId,
        },
      });
    } else {
      // Site already exists — check for coordinate drift
      // siteMap.has(siteId) is true in this branch —
      // the non-null assertion is safe here.
      const existingMeta = siteMap.get(siteId)!.meta;
      // 0.0001 degrees ≈ 11 metres at the equator —
      // sufficient for site-level monitoring data.
      const coordDrift =
        Math.abs(existingMeta.coordinates[0] - lng) > 0.0001 ||
        Math.abs(existingMeta.coordinates[1] - lat) > 0.0001;

      if (coordDrift) {
        console.warn(
          `Coordinate divergence detected for site ` +
            `"${locationName}" (${siteId}). ` +
            `Stored: [${existingMeta.coordinates}], ` +
            `Row: [${lng}, ${lat}]. ` +
            `Using coordinates from first row. ` +
            `Check CSV for data entry errors.`,
        );
      }
    }

    // Only push observation if density data is present
    if (!isNaN(density) && !isNaN(se) && !isNaN(samplesN)) {
      const entry = siteMap.get(siteId)!;
      entry.rows.push({
        year,
        siteType: row.Site_Type,
        species: row.Species.trim(),
        density,
        se,
        samplesN,
      });
    }
  }

  return Array.from(siteMap.values()).map(({ rows, meta }) => ({
    ...meta,
    availableYears: [...new Set(rows.map((o) => o.year))].sort((a, b) => a - b),
    observations: rows,
  }));
}
