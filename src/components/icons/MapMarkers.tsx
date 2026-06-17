/**
 * Canonical import hub for map marker icons used across UI surfaces.
 *
 * Colours match the corresponding Mapbox layer definitions:
 * - `MONITORING_COLOUR` — `LocalSiteLayer.tsx` `circle-color`
 * - `TILE_COLOUR` — tile square in `SelectTilePrompt` and `WelcomeModal`
 *
 * `PartnerMarkerIcon` and `MangroveExtentIcon` are re-exported from
 * `src/components/map/markers/` where their colours are defined.
 */

const MONITORING_COLOUR = '#3b82f6';
const TILE_COLOUR = '#4CAF82';

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
