/**
 * MangroveExtentLayer
 *
 * Renders the Global Mangrove Watch (GMW) v4 habitat extent as a
 * vector tile fill layer on the Mapbox map.
 *
 * Data source: GMW public Mapbox tileset (globalmangrovewatch account)
 * Tileset: globalmangrovewatch.gmw_v4019_sen2_mng_all_zooms
 * Source layer: gmw_v4019_sen2_mng
 * License: CC-BY 4.0 — Bunting et al. (2022), globalmangrovewatch.org
 *
 * ─── Dependency risk ────────────────────────────────────────────
 * This layer depends on a public Mapbox tileset hosted by the GMW
 * organisation. We do not own this data or token. If the token is
 * rotated or the tileset is moved, the layer will silently fail.
 *
 * Mitigation:
 * - Token stored in VITE_GMW_MAPBOX_TOKEN environment variable
 * - Layer disabled gracefully if token is absent
 * - Post-conference: migrate to a GLOWdex-owned Mapbox tileset
 *   using the GMW v3.0 CC-BY 4.0 data from Zenodo
 *   (https://doi.org/10.5281/zenodo.6894273)
 *
 * ─── Layer ordering ─────────────────────────────────────────────
 * Rendered below the grid layer in Map.tsx so habitat polygons are
 * visible as context through the semi-transparent grid without
 * obscuring typology colours.
 */

import { Source, Layer } from 'react-map-gl';

const GMW_TOKEN = import.meta.env.VITE_GMW_MAPBOX_TOKEN as string | undefined;
const GMW_LAYER_ENABLED = import.meta.env.VITE_GMW_LAYER_ENABLED === 'true';

interface MangroveExtentLayerProps {
  enabled: boolean;
}

export function MangroveExtentLayer({ enabled }: MangroveExtentLayerProps) {
  // Disable gracefully if token is absent or feature flag is off
  if (!enabled || !GMW_TOKEN || !GMW_LAYER_ENABLED) return null;

  const tiles = [
    `https://a.tiles.mapbox.com/v4/globalmangrovewatch.gmw_v4019_sen2_mng_all_zooms/{z}/{x}/{y}.vector.pbf?access_token=${GMW_TOKEN}`,
    `https://b.tiles.mapbox.com/v4/globalmangrovewatch.gmw_v4019_sen2_mng_all_zooms/{z}/{x}/{y}.vector.pbf?access_token=${GMW_TOKEN}`,
  ];

  return (
    <Source
      id="gmw-extent-source"
      type="vector"
      tiles={tiles}
      minzoom={0}
      maxzoom={12}
    >
      <Layer
        id="gmw-extent-fill"
        type="fill"
        source="gmw-extent-source"
        source-layer="gmw_v4019_sen2_mng"
        beforeId="grid-fill"
        paint={{
          'fill-color': '#1d9e75',
          'fill-opacity': 0.6,
        }}
      />
    </Source>
  );
}
