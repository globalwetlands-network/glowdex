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
import {
  transformIndicators,
  type IndicatorRaw,
} from '@/data/loaders/loadIndicators';
import { aggregateByCondition } from '@/data/transforms/aggregateLocalObservations';
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

const exampleYear = EXAMPLE_LOCAL_SITE.availableYears.at(-1) ?? 0;

/** Local field context for the assistant, built the way App.tsx builds it. */
export const EXAMPLE_LOCAL_SITE_CONTEXT: LocalSiteContext = {
  siteName: EXAMPLE_LOCAL_SITE.name,
  country: EXAMPLE_LOCAL_SITE.country,
  partner: EXAMPLE_PARTNERS.partners[0].institution,
  year: exampleYear,
  conditions: aggregateByCondition(
    EXAMPLE_LOCAL_SITE.observations,
    exampleYear,
  ).filter((c) => c.samplesN > 0),
};

/** The key finding, highlighted wherever the example shows the assistant. */
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
  'species threat is moderately low.';

/**
 * Illustrative assistant summaries for the worked example — one per mode.
 * Condensed from the live assistant's response for this tile (captured
 * 2026-09-29, dataset 2026.09.0) for display; not verbatim output. Every claim
 * matches the fixture data (see workedExample.spec.ts), and they avoid
 * "health" framing, which is blocked until the prompt-level fix (GLO-190).
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
    gridCellId: EXAMPLE_TILE_ID,
    text:
      `${GLOBAL_SUMMARY} Local field data from ${EXAMPLE_LOCAL_SITE.name} ` +
      'shows crab densities in degraded and rehabilitated zones well below ' +
      'the local reference.',
    meta: { latencyMs: 0, totalTokensUsed: 0 },
  },
};
