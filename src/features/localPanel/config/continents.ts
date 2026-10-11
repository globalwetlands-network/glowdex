/**
 * Continent for each country in local-sites.csv. The data has no continent
 * column, so the Local panel's Continent → Country → Location selector
 * groups countries with this map. Add a country here when a new one appears
 * in the data; unmapped countries fall under OTHER_CONTINENT.
 */
export const COUNTRY_TO_CONTINENT: Record<string, string> = {
  Australia: 'Oceania',
  'Costa Rica': 'North America',
  'Hong Kong': 'Asia',
  India: 'Asia',
  Indonesia: 'Asia',
  Philippines: 'Asia',
  Kenya: 'Africa',
  Madagascar: 'Africa',
  Mauritius: 'Africa',
  Mozambique: 'Africa',
  'South Africa': 'Africa',
  Tanzania: 'Africa',
};

export const OTHER_CONTINENT = 'Other';

/** The continent a country belongs to. */
export function continentOf(country: string): string {
  return COUNTRY_TO_CONTINENT[country] ?? OTHER_CONTINENT;
}
