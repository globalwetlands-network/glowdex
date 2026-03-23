import Papa from 'papaparse';

/**
 * Parses CSV string data into typed objects
 *
 * Uses PapaParse library with strict configuration:
 * - Header row is used for property names
 * - Empty lines are skipped
 * - Dynamic typing is disabled for manual type control
 *
 * @template T - The expected type of each parsed row
 * @param csvString - Raw CSV data as a string
 * @returns Array of parsed objects matching type T
 *
 * @example
 * ```ts
 * const data = parseCsv<GridItemRaw>(csvString);
 * ```
 */
export function parseCsv<T>(csvString: string): T[] {
  const result = Papa.parse<T>(csvString, {
    header: true,
    skipEmptyLines: true,
    dynamicTyping: false, // We handle types manually for strictness
  });

  if (result.errors.length) {
    console.warn('CSV Parse Errors:', result.errors);
  }

  return result.data;
}
