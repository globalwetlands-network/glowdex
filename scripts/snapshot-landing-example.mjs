#!/usr/bin/env node
/**
 * Snapshots the landing page's "See it in action" worked example from the
 * canonical data store into src/features/landing/fixtures/workedExample.json.
 *
 * The fixture holds small RAW subsets (grid item, residuals, cluster rows,
 * GeoJSON feature, indicator labels, local site/observation rows) so the page
 * runs the app's own transforms on them (joinGridData, deriveTypologies,
 * deriveLocalWetlands, …) instead of hand-copied values.
 *
 * Re-run when the dataset or the example place changes:
 *   node scripts/snapshot-landing-example.mjs [storeUrl]
 * storeUrl defaults to VITE_DATA_STORE_URL, then the public store.
 */
import { writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import Papa from 'papaparse';

// The worked example (GLO-190): one place used everywhere on the page.
const TILE_ID = 21812; // Bayhead, South Africa — Typology 1
const LOCAL_SITE_ID = 'za-bayhead';
const INDICATOR_KEYS = [
  'mang_fish_dens',
  'mang_invert_dens',
  'mang_spec_score',
];
/** Max values kept per violin distribution (evenly spaced quantiles). */
const MAX_DISTRIBUTION_VALUES = 300;

const STORE_URL = (
  process.argv[2] ??
  process.env.VITE_DATA_STORE_URL ??
  'https://storage.googleapis.com/mbcam-data-public'
).replace(/\/+$/, '');

const OUT_FILE = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../src/features/landing/fixtures/workedExample.json',
);

async function fetchText(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`${response.status} fetching ${url}`);
  return response.text();
}

function parseCsv(text) {
  return Papa.parse(text, { header: true, skipEmptyLines: true }).data;
}

/** Keeps up to `max` evenly spaced values of the sorted input (shape-preserving). */
function sampleSorted(values, max) {
  const sorted = [...values].sort((a, b) => a - b);
  if (sorted.length <= max) return sorted;
  return Array.from(
    { length: max },
    (_, i) => sorted[Math.round((i * (sorted.length - 1)) / (max - 1))],
  );
}

const manifest = JSON.parse(await fetchText(`${STORE_URL}/manifest.json`));
const bundle = `${STORE_URL}/${manifest.path.replace(/^\/+|\/+$/g, '')}`;

const [gridItemsCsv, residualsCsv, clustersCsv, geojsonText, labelsText] =
  await Promise.all(
    [
      'grid-items.csv',
      'grid-items-residuals.csv',
      'all-clusters.csv',
      'grid.geojson',
      'indicator-labels.json',
    ].map((file) => fetchText(`${bundle}/${file}`)),
  );
const [localSitesCsv, localObservationsCsv, localMetaText] = await Promise.all(
  ['local-sites.csv', 'local-observations.csv', 'local-meta.json'].map((file) =>
    fetchText(`${STORE_URL}/local/${file}`),
  ),
);

// Grid item + residuals for the tile, in the shapes loadGridItems / loadResiduals return.
const gridRow = parseCsv(gridItemsCsv).find((r) => Number(r.ID) === TILE_ID);
if (!gridRow) throw new Error(`Tile ${TILE_ID} not in grid-items.csv`);
const gridItem = {
  id: TILE_ID,
  country: gridRow.TERRITORY1,
  iso3: gridRow.ISO_TER1,
};

const residualRows = parseCsv(residualsCsv);
const toResidual = (row) => {
  const { ID, ...rest } = row;
  const values = {};
  for (const [key, val] of Object.entries(rest)) {
    if (val !== undefined && val !== '') values[key] = parseFloat(val);
  }
  return { id: parseInt(ID, 10), values };
};
const tileResidualRow = residualRows.find((r) => Number(r.ID) === TILE_ID);
if (!tileResidualRow) throw new Error(`Tile ${TILE_ID} not in residuals`);

// Cluster rows: the tile's own, plus one exemplar per scale-5 / scale-18
// cluster so deriveTypologies yields the full colour legend.
const clusterRows = parseCsv(clustersCsv);
const tileCluster = clusterRows.find((r) => Number(r.ID) === TILE_ID);
if (!tileCluster) throw new Error(`Tile ${TILE_ID} not in all-clusters.csv`);
const exemplars = new Map([[tileCluster.ID, tileCluster]]);
const seen5 = new Set([tileCluster.cluster_5]);
const seen18 = new Set([tileCluster.cluster_18]);
for (const row of clusterRows) {
  if (!seen5.has(row.cluster_5) || !seen18.has(row.cluster_18)) {
    seen5.add(row.cluster_5);
    seen18.add(row.cluster_18);
    exemplars.set(row.ID, row);
  }
}

// Violin distributions + percentiles from the RAW indicator values of every
// cell in the tile's scale-5 typology — what the backend's statistics
// (sampledDistribution / cellValue / percentile) and the assistant are based on.
const typologyIds = new Set(
  clusterRows
    .filter((r) => r.cluster_5 === tileCluster.cluster_5)
    .map((r) => Number(r.ID)),
);
const typologyGridRows = parseCsv(gridItemsCsv).filter((r) =>
  typologyIds.has(Number(r.ID)),
);
const rawValues = (key) =>
  typologyGridRows
    .map((r) => parseFloat(r[key]))
    .filter((v) => Number.isFinite(v));

const cellValues = Object.fromEntries(
  INDICATOR_KEYS.map((key) => [key, parseFloat(gridRow[key])]),
);
const distributionValues = Object.fromEntries(
  INDICATOR_KEYS.map((key) => [
    key,
    sampleSorted(rawValues(key), MAX_DISTRIBUTION_VALUES),
  ]),
);
/** Share (0–100) of the typology's cells below the tile, over ALL cells. */
const percentiles = Object.fromEntries(
  INDICATOR_KEYS.map((key) => {
    const values = rawValues(key);
    const below = values.filter((v) => v < cellValues[key]).length;
    return [key, Math.round((below / values.length) * 100)];
  }),
);
const mangroveAreaHa = parseFloat(gridRow.mang_area_ha);

const feature = JSON.parse(geojsonText).features.find(
  (f) => f.properties.ID === TILE_ID,
);
if (!feature) throw new Error(`Tile ${TILE_ID} not in grid.geojson`);

const indicatorLabels = JSON.parse(labelsText).filter((i) =>
  INDICATOR_KEYS.includes(i.indicator),
);

const localSiteRows = parseCsv(localSitesCsv).filter(
  (r) => r.site_id === LOCAL_SITE_ID,
);
const localObservationRows = parseCsv(localObservationsCsv).filter(
  (r) => r.site_id === LOCAL_SITE_ID,
);
if (localSiteRows.length === 0) {
  throw new Error(`Local site ${LOCAL_SITE_ID} not in local-sites.csv`);
}

const fixture = {
  meta: {
    datasetVersion: manifest.dataset_version,
    localUpdated: JSON.parse(localMetaText).updated ?? null,
    snapshotDate: new Date().toISOString().slice(0, 10),
    tileId: TILE_ID,
    localSiteId: LOCAL_SITE_ID,
    typologyCellCount: typologyIds.size,
  },
  gridItem,
  residuals: toResidual(tileResidualRow),
  clusterRows: [...exemplars.values()],
  feature: {
    type: feature.type,
    properties: { ID: TILE_ID },
    geometry: feature.geometry,
  },
  indicatorLabels,
  mangroveAreaHa,
  cellValues,
  distributionValues,
  percentiles,
  localSiteRows,
  localObservationRows,
};

await writeFile(OUT_FILE, `${JSON.stringify(fixture, null, 2)}\n`);
console.log(
  `Wrote ${path.relative(process.cwd(), OUT_FILE)} — dataset ${manifest.dataset_version}, ` +
    `tile ${TILE_ID} (${gridItem.country}, typology ${tileCluster.cluster_5}), ` +
    `${typologyIds.size} typology cells, site ${LOCAL_SITE_ID}, ` +
    `percentiles ${JSON.stringify(percentiles)}`,
);
