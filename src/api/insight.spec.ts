import { afterEach, describe, expect, it, vi } from 'vitest';
import { fetchInsight } from './insight';
import { apiClient } from './client';
import type { LocalSiteContext } from './types';

vi.mock('./client', () => ({ apiClient: vi.fn().mockResolvedValue({}) }));
vi.mock('posthog-js', () => ({ default: {} }));

const localSiteContext: LocalSiteContext = {
  siteName: 'Mngazana',
  country: 'South Africa',
  partner: 'University of the Western Cape (UWC)',
  year: 2026,
  conditions: [
    { siteType: 'Reference', totalDensity: 28.3, combinedSE: 2.4, samplesN: 6 },
  ],
};

/** Parses the JSON body of the most recent apiClient call. */
function sentBody(): Record<string, unknown> {
  const [, options] = vi.mocked(apiClient).mock.calls.at(-1)!;
  return JSON.parse(String(options?.body));
}

describe('fetchInsight (GLO-207 mode separation)', () => {
  afterEach(() => vi.clearAllMocks());

  it('global mode sends mode + gridCellId and never localSiteContext', async () => {
    await fetchInsight({ mode: 'global', gridCellId: 18684, localSiteContext });

    const body = sentBody();
    expect(body.mode).toBe('global');
    expect(body.gridCellId).toBe(18684);
    expect(body).not.toHaveProperty('localSiteContext');
  });

  it('local mode sends mode + localSiteContext and never gridCellId', async () => {
    await fetchInsight({ mode: 'local', gridCellId: 18684, localSiteContext });

    const body = sentBody();
    expect(body.mode).toBe('local');
    expect(body.localSiteContext).toEqual(localSiteContext);
    expect(body).not.toHaveProperty('gridCellId');
  });

  it('never puts a site id inside localSiteContext (backend rejects unknown fields)', async () => {
    await fetchInsight({ mode: 'local', localSiteContext });

    expect(Object.keys(sentBody().localSiteContext as object).sort()).toEqual([
      'conditions',
      'country',
      'partner',
      'siteName',
      'year',
    ]);
  });
});
