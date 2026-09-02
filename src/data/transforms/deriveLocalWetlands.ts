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

function makeSiteId(locationName: string, countryName: string): string {
  return `${slugify(locationName)}-${slugify(countryName)}`;
}

/**
 * Renamed sites: maps the observations-file siteId (old name) to
 * the sites-file siteId (new name), so preserved density lands on
 * the correct new site. Sites whose name is unchanged
 * (rasa-island, bayhead, hong-kong-wetland-park, antsohihy, gazi)
 * need no entry.
 *
 * Pending science-lead confirmation — do not change without it.
 */
const OLD_TO_NEW_SITE_ID: Record<string, string> = {
  'moreton-bay-australia': 'southern-moreton-bay-australia',
  'chira-island-costa-rica': 'isla-chira-costa-rica',
  'jharkali-sundarbans-india': 'sundarbans-india',
};

/**
 * Fallback partner ID mapping by slugified location name, used
 * for sites that have no matching observations row (and therefore
 * no Partner_id from the observations file). Partner IDs match
 * PARTNER_REGISTRY in glowdex-api/src/partners/partner.config.ts.
 *
 * All South Africa monitoring sites belong to uwc-za.
 */
const PARTNER_ID_BY_LOCATION: Record<string, string> = {
  bayhead: 'uwc-za',
  beachwood: 'uwc-za',
  mlalazi: 'uwc-za',
  mtata: 'uwc-za',
  mngazana: 'uwc-za',
  ntafufu: 'uwc-za',
  mzimvubu: 'uwc-za',
};

/**
 * Parses the observations file into per-site observations and
 * partner IDs, keyed by the *new* siteId (renamed via
 * OLD_TO_NEW_SITE_ID) so it joins cleanly onto the sites file.
 */
function deriveObservations(
  obsRows: LocalObservationRaw[],
): Map<string, { observations: LocalObservation[]; partnerId: string | null }> {
  const bySite = new Map<
    string,
    { observations: LocalObservation[]; partnerId: string | null }
  >();

  for (const row of obsRows) {
    if (!isSiteCondition(row.Site_Type)) {
      console.warn(`Skipping unknown Site_Type "${row.Site_Type}"`);
      continue;
    }
    if (!row.Location_name || !row.Country_name) {
      console.warn(
        'deriveLocalWetlands: skipping malformed observation row ' +
          `— Location_name="${row.Location_name ?? 'undefined'}"` +
          `, Country_name="${row.Country_name ?? 'undefined'}"`,
      );
      continue;
    }

    const year = parseInt(row.Year, 10);
    if (isNaN(year)) {
      console.warn(
        `Skipping observation with invalid year: ` +
          `Location=${row.Location_name}, Year=${row.Year}`,
      );
      continue;
    }

    const oldSiteId = makeSiteId(
      row.Location_name.trim(),
      row.Country_name.trim(),
    );
    const siteId = OLD_TO_NEW_SITE_ID[oldSiteId] ?? oldSiteId;

    if (!bySite.has(siteId)) {
      bySite.set(siteId, {
        observations: [],
        partnerId: row.Partner_id?.trim() || null,
      });
    }

    // Only record an observation when density data is present.
    const density = parseFloat(row.Density);
    const se = parseFloat(row.SE);
    const samplesN = parseInt(row.Samples_n, 10);
    if (!isNaN(density) && !isNaN(se) && !isNaN(samplesN)) {
      bySite.get(siteId)!.observations.push({
        year,
        siteType: row.Site_Type,
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
 * Coordinates and the site list come from the sites file
 * (one marker point per row). Density/species/partner data comes
 * from the observations file, joined by siteId (renamed sites
 * bridged via OLD_TO_NEW_SITE_ID). Sites present only in the
 * sites file (e.g. Beachwood) get an empty observations array and
 * render as "Data still to be analysed".
 */
export function deriveLocalWetlands(
  siteRows: LocalSiteRaw[],
  obsRows: LocalObservationRaw[],
): LocalSite[] {
  const obsBySite = deriveObservations(obsRows);

  const siteMap = new Map<
    string,
    { points: LocalSitePoint[]; meta: Omit<LocalSiteMetadata, 'partnerId'> }
  >();

  for (const row of siteRows) {
    if (!row.Location_name || !row.Country_name) {
      console.warn(
        'deriveLocalWetlands: skipping malformed site row ' +
          `— Location_name="${row.Location_name ?? 'undefined'}"` +
          `, Country_name="${row.Country_name ?? 'undefined'}"`,
      );
      continue;
    }

    const lat = parseFloat(row.Location_lat);
    const lng = parseFloat(row.Location_long);
    // Skip points without coordinates (e.g. China: Zhuhai, Guangxi)
    // — a site with no valid points renders no marker.
    if (isNaN(lat) || isNaN(lng)) {
      continue;
    }

    const locationName = row.Location_name.trim();
    const countryName = row.Country_name.trim();
    const siteId = makeSiteId(locationName, countryName);

    // Accept any non-empty Site_Type for markers (incl. "Restored")
    // — the strict SiteCondition guard only applies to chart data.
    const condition = row.Site_Type.trim();
    const point: LocalSitePoint = { coordinates: [lng, lat], condition };

    const existing = siteMap.get(siteId);
    if (existing) {
      existing.points.push(point);
    } else {
      siteMap.set(siteId, {
        points: [point],
        meta: {
          id: siteId,
          name: locationName,
          country: countryName,
          coordinates: [lng, lat], // representative point = first row
        },
      });
    }
  }

  return Array.from(siteMap.values()).map(({ points, meta }) => {
    const siteId = meta.id;
    const obs = obsBySite.get(siteId);
    const observations = obs?.observations ?? [];

    // Partner: observations-file Partner_id first, then the
    // location fallback, then none.
    const locationSlug = slugify(meta.name);
    const partnerId =
      obs?.partnerId ?? PARTNER_ID_BY_LOCATION[locationSlug] ?? null;

    if (!partnerId) {
      console.warn(
        `No partner ID found for location "${meta.name}". ` +
          `Add it to the observations file Partner_id column or the ` +
          `PARTNER_ID_BY_LOCATION fallback. Partner link will not be ` +
          `shown for this site.`,
      );
    }

    return {
      ...meta,
      partnerId,
      points,
      availableYears: [...new Set(observations.map((o) => o.year))].sort(
        (a, b) => a - b,
      ),
      observations,
    };
  });
}
