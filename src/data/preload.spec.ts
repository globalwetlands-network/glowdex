import { describe, expect, it, vi } from 'vitest';
import { createCachedLoader } from './preload';

describe('createCachedLoader', () => {
  it('shares one load between concurrent and repeat callers', async () => {
    const load = vi.fn().mockResolvedValue('data');
    const cache = createCachedLoader(load);

    const [a, b] = await Promise.all([cache.get(), cache.get()]);
    await cache.get();

    expect(a).toBe('data');
    expect(b).toBe('data');
    expect(load).toHaveBeenCalledTimes(1);
  });

  it('exposes the value via peek only once the load has resolved', async () => {
    const cache = createCachedLoader(() => Promise.resolve(42));

    expect(cache.peek()).toBeUndefined();
    const pending = cache.get();
    expect(cache.peek()).toBeUndefined();
    await pending;
    expect(cache.peek()).toBe(42);
  });

  it('clears a failed load so the next call retries', async () => {
    const load = vi
      .fn()
      .mockRejectedValueOnce(new Error('offline'))
      .mockResolvedValueOnce('data');
    const cache = createCachedLoader(load);

    await expect(cache.get()).rejects.toThrow('offline');
    expect(cache.peek()).toBeUndefined();
    await expect(cache.get()).resolves.toBe('data');
    expect(load).toHaveBeenCalledTimes(2);
  });

  it('refetches after clear()', async () => {
    const load = vi
      .fn()
      .mockResolvedValueOnce('old')
      .mockResolvedValueOnce('new');
    const cache = createCachedLoader(load);

    await cache.get();
    cache.clear();

    expect(cache.peek()).toBeUndefined();
    await expect(cache.get()).resolves.toBe('new');
    expect(cache.peek()).toBe('new');
  });

  it('ignores a load that was cleared while in flight', async () => {
    let resolveFirst: (value: string) => void = () => {};
    const load = vi
      .fn()
      .mockImplementationOnce(
        () => new Promise<string>((resolve) => (resolveFirst = resolve)),
      )
      .mockResolvedValueOnce('fresh');
    const cache = createCachedLoader(load);

    const stale = cache.get();
    cache.clear();
    await cache.get();
    resolveFirst('stale');
    await stale;

    expect(cache.peek()).toBe('fresh');
  });
});
