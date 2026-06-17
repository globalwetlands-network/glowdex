/**
 * Canonical colour constants for map layer icons and UI legend elements.
 *
 * Values are derived from the Mapbox paint expressions in the corresponding
 * layer components — keep in sync if layer colours change:
 * - PARTNER_COLOUR  — PartnerLayer.tsx `circle-stroke-color` (non-nearest)
 * - MONITORING_COLOUR — LocalSiteLayer.tsx `circle-color`
 * - TILE_COLOUR     — SelectTilePrompt squares and WelcomeModal tile icon
 * - MANGROVE_COLOUR — MangroveExtentIcon fill / MangroveExtentLayer raster tint
 */

export const PARTNER_COLOUR = '#1d9e75';
export const MONITORING_COLOUR = '#3b82f6';
export const TILE_COLOUR = '#4CAF82';
export const MANGROVE_COLOUR = '#1d9e75';
