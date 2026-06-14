/**
 * Species colour palette for local wetlands crab data.
 *
 * Derived from the R/Shiny prototype reference implementation
 * using viridis palette option "H". Matches the species
 * composition chart in the reference implementation.
 *
 * Keyed by species name so the palette is self-documenting
 * and can be looked up by name when rendering charts.
 *
 * TODO: Make data-driven when species list becomes dynamic
 * across multiple sites and countries. Currently ordered to
 * match mock data species sequence.
 */
export const CRAB_SPECIES_PALETTE: Record<string, string> = {
  'Austruca occidentalis': '#440154',
  'Paraleptuca chlorophthalmus': '#31688e',
  'Perisesarma guttatum': '#35b779',
  'Neosarmatium africanum': '#fde725',
  'Tubuca urvillei': '#f97316',
};

/**
 * Ordered list of swatch colours for the species composition
 * trigger. Used when rendering swatches without a specific
 * species name (e.g. the inactive disclosure trigger).
 */
export const CRAB_SPECIES_SWATCH_COLORS = Object.values(CRAB_SPECIES_PALETTE);
