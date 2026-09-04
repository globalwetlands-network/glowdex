import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { datasetClient, DataStoreError } from './datasetClient';
import type { Manifest } from './manifest.types';

const STORE = 'https://store.test';
const MANIFEST: Manifest = {
  dataset_version: '2026.09.0',
  path: 'datasets/2026.09.0/',
};

function mockManifestResponse(manifest: Manifest = MANIFEST) {
  return {
    ok: true,
    status: 200,
    statusText: 'OK',
    json: () => Promise.resolve(manifest),
  } as Response;
}

describe('datasetClient', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
    datasetClient.resetManifest();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
    datasetClient.resetManifest();
  });

  describe('store mode (VITE_DATA_STORE_URL set)', () => {
    beforeEach(() => {
      vi.stubEnv('VITE_DATA_STORE_URL', STORE);
    });

    it('resolves the manifest and builds asset URLs from its path', async () => {
      vi.mocked(fetch).mockResolvedValue(mockManifestResponse());

      const manifest = await datasetClient.resolveManifest();
      expect(manifest.dataset_version).toBe('2026.09.0');
      expect(fetch).toHaveBeenCalledWith(
        `${STORE}/manifest.json`,
        expect.objectContaining({ signal: expect.any(AbortSignal) }),
      );

      await expect(datasetClient.assetUrl('grid-items.csv')).resolves.toBe(
        `${STORE}/datasets/2026.09.0/grid-items.csv`,
      );
      await expect(datasetClient.bundleBase()).resolves.toBe(
        `${STORE}/datasets/2026.09.0/`,
      );
    });

    it('fetches the manifest at most once (cached promise)', async () => {
      vi.mocked(fetch).mockResolvedValue(mockManifestResponse());

      await Promise.all([
        datasetClient.assetUrl('grid-items.csv'),
        datasetClient.assetUrl('grid.geojson'),
        datasetClient.resolveManifest(),
      ]);

      expect(fetch).toHaveBeenCalledTimes(1);
    });

    it('builds the local URL from the fixed local/ path, without the manifest', () => {
      expect(datasetClient.localUrl('local-sites.csv')).toBe(
        `${STORE}/local/local-sites.csv`,
      );
      expect(fetch).not.toHaveBeenCalled();
    });

    it('throws DataStoreError when the store is unreachable', async () => {
      vi.mocked(fetch).mockRejectedValue(new TypeError('Failed to fetch'));

      await expect(datasetClient.resolveManifest()).rejects.toBeInstanceOf(
        DataStoreError,
      );
    });

    it('throws DataStoreError on a non-OK response', async () => {
      vi.mocked(fetch).mockResolvedValue({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      } as Response);

      await expect(datasetClient.resolveManifest()).rejects.toBeInstanceOf(
        DataStoreError,
      );
    });

    it('throws DataStoreError on malformed JSON', async () => {
      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        status: 200,
        statusText: 'OK',
        json: () => Promise.reject(new SyntaxError('Unexpected token')),
      } as unknown as Response);

      await expect(datasetClient.resolveManifest()).rejects.toBeInstanceOf(
        DataStoreError,
      );
    });

    it('throws DataStoreError when the manifest is valid JSON but missing path/version', async () => {
      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        status: 200,
        statusText: 'OK',
        json: () => Promise.resolve({ dataset_version: '2026.09.0' }), // no path
      } as unknown as Response);

      await expect(datasetClient.resolveManifest()).rejects.toBeInstanceOf(
        DataStoreError,
      );
    });

    it('clears the cached promise on failure so a retry re-fetches', async () => {
      vi.mocked(fetch)
        .mockRejectedValueOnce(new TypeError('Failed to fetch'))
        .mockResolvedValueOnce(mockManifestResponse());

      // First attempt fails...
      await expect(datasetClient.resolveManifest()).rejects.toBeInstanceOf(
        DataStoreError,
      );

      // ...retry succeeds because the rejected promise was not cached.
      const manifest = await datasetClient.resolveManifest();
      expect(manifest.dataset_version).toBe('2026.09.0');
      expect(fetch).toHaveBeenCalledTimes(2);
    });

    it('resetManifest() forces a re-fetch even after a successful resolve', async () => {
      vi.mocked(fetch).mockResolvedValue(mockManifestResponse());

      await datasetClient.resolveManifest();
      datasetClient.resetManifest();
      await datasetClient.resolveManifest();

      expect(fetch).toHaveBeenCalledTimes(2);
    });
  });

  describe('fallback mode (VITE_DATA_STORE_URL unset)', () => {
    beforeEach(() => {
      vi.stubEnv('VITE_DATA_STORE_URL', '');
    });

    it('resolves asset URLs to same-origin public/data without fetching a manifest', async () => {
      await expect(datasetClient.assetUrl('grid-items.csv')).resolves.toBe(
        '/data/grid-items.csv',
      );
      expect(datasetClient.localUrl('local-sites.csv')).toBe(
        '/data/local-sites.csv',
      );
      expect(fetch).not.toHaveBeenCalled();
    });
  });
});
