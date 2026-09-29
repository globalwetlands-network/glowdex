import { describe, expect, it } from 'vitest';
import { resolveHeroMediaVariant } from './heroMedia';

describe('resolveHeroMediaVariant', () => {
  it('defaults to photo when nothing is set', () => {
    expect(resolveHeroMediaVariant('', undefined)).toBe('photo');
  });

  it('uses the env flag when there is no query param', () => {
    expect(resolveHeroMediaVariant('', 'video')).toBe('video');
  });

  it('lets the ?hero= query param override the env flag', () => {
    expect(resolveHeroMediaVariant('?hero=photo', 'video')).toBe('photo');
    expect(resolveHeroMediaVariant('?hero=video', 'photo')).toBe('video');
  });

  it('ignores unrecognised values', () => {
    expect(resolveHeroMediaVariant('?hero=gif', 'nonsense')).toBe('photo');
    expect(resolveHeroMediaVariant('?hero=gif', 'video')).toBe('video');
  });
});
