import { describe, it, expect } from 'vitest';
import { sanitizePdfText } from './generateCellSummaryPdf';

describe('sanitizePdfText', () => {
  it('replaces the prime/double-prime that formatcoords emits for DMS', () => {
    // jsPDF standard fonts cannot render ′ (U+2032) or ″ (U+2033).
    const dms = '9° 30′ 0.0″ N 118° 30′ 0.0″ E';
    const out = sanitizePdfText(dms);

    expect(out).toBe(`9° 30' 0.0" N 118° 30' 0.0" E`);
    expect(out).not.toContain('′');
    expect(out).not.toContain('″');
    // The degree sign is WinAnsi-safe and must be preserved.
    expect(out).toContain('°');
  });

  it('normalises curly quotes to ASCII', () => {
    expect(sanitizePdfText('‘a’ “b”')).toBe(`'a' "b"`);
  });

  it('leaves plain ASCII untouched', () => {
    expect(sanitizePdfText('Rasa Island, Philippines')).toBe(
      'Rasa Island, Philippines',
    );
  });
});
