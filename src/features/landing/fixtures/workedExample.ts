/**
 * The "See it in action" worked example: ONE place used everywhere on the
 * landing page — tile 21812, Bayhead, South Africa (Typology 1) — so the
 * tooltip, panel, charts, assistant, and explainer all tell the same story.
 *
 * `workedExample.json` is a raw snapshot of the canonical data store (see
 * `scripts/snapshot-landing-example.mjs`, which records the dataset version).
 * The app's own transforms run on it here, so every card shows exactly what
 * the live map would for this place.
 */
import type { Feature, Geometry } from 'geojson';
import type { PartnersResponse } from '@/api/partners';
import type { InsightResponse, LocalSiteContext } from '@/api/types';
import type { EnrichedGridCell } from '@/app/types/app.types';
import { buildLocalSiteContext } from '@/app/utils/buildLocalSiteContext';
import {
  transformIndicators,
  type IndicatorRaw,
} from '@/data/loaders/loadIndicators';
import { deriveLocalWetlands } from '@/data/transforms/deriveLocalWetlands';
import { deriveTypologies } from '@/data/transforms/deriveTypologies';
import { joinGridData } from '@/data/transforms/joinGridWithClusters';
import type { ClusterRaw } from '@/data/types/cluster.types';
import type {
  LocalObservationRaw,
  LocalSiteRaw,
} from '@/data/types/local-wetlands.types';
import type { DistributionsByDimension } from '@/features/widgets/types/indicator.types';
import { getFeatureCenterCoords } from '@/utils/geo';
import snapshot from './workedExample.json';

const clusterRows = snapshot.clusterRows as ClusterRaw[];

const [joinedCell] = joinGridData(
  [snapshot.gridItem],
  [snapshot.residuals],
  clusterRows.filter((row) => Number(row.ID) === snapshot.gridItem.id),
);

export const EXAMPLE_TILE_ID = snapshot.meta.tileId;
export const EXAMPLE_DATASET_VERSION = snapshot.meta.datasetVersion;

/** The example tile, enriched like `useSelectedCell` does (bbox centre). */
export const EXAMPLE_CELL: EnrichedGridCell = {
  ...joinedCell,
  centerCoords: getFeatureCenterCoords(snapshot.feature as Feature),
};

export const EXAMPLE_TYPOLOGIES = deriveTypologies(clusterRows);

/** The example tile's polygon and scale-5 typology colour (for map overlays). */
export const EXAMPLE_TILE = {
  geometry: snapshot.feature.geometry as Geometry,
  color:
    EXAMPLE_TYPOLOGIES.scale5[EXAMPLE_CELL.cluster5 ?? 0]?.color ?? '#0a5c47',
};

type IndicatorKey = keyof typeof snapshot.cellValues;

/**
 * Violin data for the example's typology, grouped by dimension like the app.
 * Raw indicator values — what the backend's statistics (and so the live
 * app's violins and assistant) are based on.
 */
export const EXAMPLE_DISTRIBUTIONS: DistributionsByDimension =
  transformIndicators(
    snapshot.indicatorLabels as IndicatorRaw[],
  ).reduce<DistributionsByDimension>((groups, indicator) => {
    const key = indicator.key as IndicatorKey;
    (groups[indicator.dimension] ??= []).push({
      indicator,
      values: snapshot.distributionValues[key] ?? [],
      selectedValue: snapshot.cellValues[key],
    });
    return groups;
  }, {});

/**
 * Where the example tile sits within its typology for each indicator: the
 * share (0–100) of the typology's cells below it, over the full typology.
 */
export const EXAMPLE_INDICATOR_PERCENTILES = Object.entries(
  snapshot.percentiles,
).map(([key, percentile]) => ({ key, percentile }));

export const EXAMPLE_MANGROVE_AREA_HA = snapshot.mangroveAreaHa;

export const EXAMPLE_LOCAL_SITES = deriveLocalWetlands(
  snapshot.localSiteRows as LocalSiteRaw[],
  snapshot.localObservationRows as LocalObservationRaw[],
);
export const EXAMPLE_LOCAL_SITE = EXAMPLE_LOCAL_SITES[0];
export const EXAMPLE_LOCAL_UPDATED = snapshot.meta.localUpdated;

/** Partner registry entry for the example site (name as in `menuContent`). */
export const EXAMPLE_PARTNERS: PartnersResponse = {
  partners: [
    {
      id: EXAMPLE_LOCAL_SITE.partnerId ?? 'uwc-za',
      institution: 'University of the Western Cape',
      city: 'Cape Town',
      country: EXAMPLE_LOCAL_SITE.country,
      coordinates: EXAMPLE_LOCAL_SITE.coordinates,
      lead: '',
      role: '',
      websiteUrl: 'https://www.uwc.ac.za',
    },
  ],
  total: 1,
};

/**
 * Local field context for the assistant, built by the same function the map
 * uses in Local mode, so it carries the map's per-sampling-point entries.
 */
export const EXAMPLE_LOCAL_SITE_CONTEXT: LocalSiteContext = (() => {
  const context = buildLocalSiteContext(
    EXAMPLE_LOCAL_SITE,
    EXAMPLE_PARTNERS.partners,
    false,
  );
  if (!context) {
    throw new Error('Worked example: the local site has no field data');
  }
  return context;
})();

/** The global key finding, highlighted in the global assistant and explainer. */
export const EXAMPLE_HIGHLIGHT =
  'exceptionally low fish density compared to similar systems in its typology';

/** Pull quote for the explainer: the key finding, led by its highlight. */
export const EXAMPLE_QUOTE = {
  highlight: 'Exceptionally low fish density',
  rest: ' compared to similar systems in its typology.',
};

const GLOBAL_SUMMARY =
  'This urban mangrove system in South Africa shows ' +
  `${EXAMPLE_HIGHLIGHT}, while invertebrate density is near median and ` +
  // The SCORE is low, which means MORE threatened species (higher score =
  // fewer threatened species) — never shorten this to "threat is low".
  'the species threat score is moderately low.';

/** The local key finding, highlighted in the local assistant. */
const LOCAL_HIGHLIGHT = 'well below the local reference';

/** The phrase highlighted in each mode's assistant summary. */
export const EXAMPLE_HIGHLIGHTS: Record<'local' | 'global', string> = {
  global: EXAMPLE_HIGHLIGHT,
  local: LOCAL_HIGHLIGHT,
};

/**
 * Illustrative assistant summaries for the worked example — one per mode,
 * kept as separate as the map keeps them (GLO-207): global reads the tile,
 * local reads only the site's field data, with no grid cell. Condensed from
 * the live assistant's responses (captured 2026-09-29, dataset 2026.09.0) for
 * display; not verbatim output. Every claim matches the fixture data (see
 * workedExample.spec.ts), and they avoid "health" framing, which is blocked
 * until the prompt-level fix (GLO-190).
 */
export const EXAMPLE_INSIGHTS: Record<'local' | 'global', InsightResponse> = {
  global: {
    gridCellId: EXAMPLE_TILE_ID,
    text:
      `Mangrove habitat covers ${Math.round(EXAMPLE_MANGROVE_AREA_HA)} ` +
      `hectares of this tile. ${GLOBAL_SUMMARY}`,
    // No `sources`: ChatInterface falls back to the Sievers et al. (2021)
    // citation/DOI, which is what the live assistant cites.
    meta: { latencyMs: 0, totalTokensUsed: 0 },
  },
  local: {
    gridCellId: null,
    text:
      `Field monitoring at ${EXAMPLE_LOCAL_SITE_CONTEXT.siteName}, ` +
      `${EXAMPLE_LOCAL_SITE_CONTEXT.country}, by the ` +
      `${EXAMPLE_LOCAL_SITE_CONTEXT.partner} in ` +
      `${EXAMPLE_LOCAL_SITE_CONTEXT.year} shows crab densities in degraded ` +
      `and rehabilitated zones ${LOCAL_HIGHLIGHT}.`,
    // Empty, as the live backend returns for local answers: ChatInterface
    // then credits the partner's field monitoring, never Sievers et al.
    sources: [],
    meta: { latencyMs: 0, totalTokensUsed: 0 },
  },
};
