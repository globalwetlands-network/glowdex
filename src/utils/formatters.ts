/**
 * Returns the ordinal suffix for a given number.
 * e.g., 1 -> "1st", 2 -> "2nd", 3 -> "3rd", 4 -> "4th"
 */
export function getOrdinalSuffix(n: number): string {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return s[(v - 20) % 10] || s[v] || s[0];
}

/**
 * Formats a percentile digit into its ordinal representation.
 * e.g., 95 -> "95th"
 */
export function formatPercentile(percentile: number): string {
  return `${Math.round(percentile)}${getOrdinalSuffix(Math.round(percentile))}`;
}
