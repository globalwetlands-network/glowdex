/**
 * Name and scientific description for each of the 5 broad typologies.
 * Source: Sievers et al. (2021) Ecological Indicators 131:108141
 * https://doi.org/10.1016/j.ecolind.2021.108141
 */
export const TYPOLOGY_5_INFO: Record<
  number,
  { name: string; description: string }
> = {
  1: {
    name: 'The Catchall',
    description:
      'No strongly distinctive indicators. Cells vary without consistent patterns. Found throughout much of the world (34% of cells).',
  },
  2: {
    name: 'High Land and Marine Impacts',
    description:
      'High land and marine-based threats across habitats, with a high number of threatened saltmarsh and seagrass species. Predominantly Europe, central-west Africa, and Asia.',
  },
  3: {
    name: 'High Climate Impacts',
    description:
      'High climate-based impacts (ocean acidification, sea level rise, warming) across habitats. Southeast Asia, Madagascar, parts of central Europe and northeast USA.',
  },
  4: {
    name: 'Low Climate Impact Increase, High Species Threat',
    description:
      'Low rate of increase in climate-based impacts, low mangrove above-ground biomass, high proportion of threatened mangrove species. West coast USA/Canada and the Caribbean.',
  },
  5: {
    name: 'The High-Functioning Refuge',
    description:
      'Low marine and land-based impacts, high mangrove biomass, fish and invertebrate density, few threatened species. Australia, Papua New Guinea, and Colombia.',
  },
};
