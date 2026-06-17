/**
 * Canonical import hub for map marker icons used across UI surfaces.
 *
 * Colours match the corresponding Mapbox layer definitions — see
 * `src/constants/map-colours.ts` for the authoritative values.
 *
 * `PartnerMarkerIcon` and `MangroveExtentIcon` are re-exported from
 * `src/components/map/markers/` where their colours are defined.
 */

import { MONITORING_COLOUR, TILE_COLOUR } from '@/constants/map-colours';

export { PartnerMarkerIcon } from '@/components/map/markers/PartnerMarkerIcon';
export { MangroveExtentIcon } from '@/components/map/markers/MangroveExtentIcon';

export function MonitoringLocationIcon({ size = 12 }: { size?: number }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        backgroundColor: MONITORING_COLOUR,
        flexShrink: 0,
      }}
    />
  );
}

export function TileMarkerIcon({ size = 12 }: { size?: number }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: 2,
        backgroundColor: TILE_COLOUR,
        flexShrink: 0,
      }}
    />
  );
}
