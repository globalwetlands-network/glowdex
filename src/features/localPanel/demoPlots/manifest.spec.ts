import { describe, expect, it } from 'vitest';
import { LIVE_LOCAL_SITE_IDS } from '../__fixtures__/localSiteIds';
import { DEMO_PLOTS, findCrabPlot, findWildlifePlot } from './manifest';

// Every PNG in this folder, inlined as a data URL (test-only) so the real
// pixel size can be read from the file.
const pngData = import.meta.glob<string>('./*.png', {
  query: '?inline',
  import: 'default',
  eager: true,
});
const pngFiles = Object.keys(pngData);

/** Reads width/height from a PNG data URL's IHDR chunk. */
function pngSize(id: string): { width: number; height: number } {
  const base64 = pngData[`./${id}.png`].split(',')[1];
  const bytes = Uint8Array.from(atob(base64.slice(0, 64)), (c) =>
    c.charCodeAt(0),
  );
  const view = new DataView(bytes.buffer);
  return { width: view.getUint32(16), height: view.getUint32(20) };
}

describe('demo plot manifest', () => {
  it('lists all 13 delivered plots once each', () => {
    expect(DEMO_PLOTS).toHaveLength(13);
    expect(new Set(DEMO_PLOTS.map((p) => p.id)).size).toBe(13);
    expect(pngFiles).toHaveLength(13);
  });

  it.each(DEMO_PLOTS.map((p) => [p.id, p] as const))(
    '%s: file exists and matches its recorded size',
    async (id, plot) => {
      expect(pngFiles).toContain(`./${id}.png`);
      expect(pngSize(id)).toEqual({ width: plot.width, height: plot.height });
      await expect(plot.load()).resolves.toEqual(expect.any(String));
    },
  );

  it('every site id resolves to a real site in the data', () => {
    for (const plot of DEMO_PLOTS) {
      expect(LIVE_LOCAL_SITE_IDS).toContain(plot.siteId);
    }
  });

  it('every plot has alt text, caption and a credit line', () => {
    for (const plot of DEMO_PLOTS) {
      expect(plot.alt.length).toBeGreaterThan(20);
      expect(plot.caption).not.toBe('');
      expect(plot.credit).toMatch(/^Courtesy of /);
    }
  });

  it('gives each Crabs view at most one plot per site', () => {
    const keys = DEMO_PLOTS.filter((p) => p.tab === 'crabs').map(
      (p) => `${p.siteId}/${p.crabMetric}/${p.crabView}`,
    );
    expect(new Set(keys).size).toBe(keys.length);
  });

  it('maps the views from the design data map', () => {
    expect(findCrabPlot('au-moreton-bay', 'density', 'by-site')?.id).toBe(
      '01_AUS_crab_density_overall',
    );
    expect(findCrabPlot('au-moreton-bay', 'size', 'by-month')?.id).toBe(
      '16_AUS_size_distribution_over_time_restored',
    );
    expect(findCrabPlot('ph-rasa-island', 'density', 'over-time')).toBe(
      undefined,
    );
    expect(findWildlifePlot('ph-rasa-island')?.id).toBe(
      'PH_fish_wildlife_indicator_plot',
    );
    expect(findWildlifePlot('cr-isla-chira')).toBe(undefined);
  });

  it('credits each country correctly', () => {
    for (const plot of DEMO_PLOTS) {
      expect(plot.credit).toBe(
        plot.siteId === 'au-moreton-bay'
          ? 'Courtesy of Griffith University'
          : 'Courtesy of Katala Foundation',
      );
    }
  });
});
