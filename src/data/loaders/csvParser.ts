import Papa from 'papaparse';

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
