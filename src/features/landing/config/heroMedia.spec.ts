import { describe, expect, it } from 'vitest';
import { resolveHeroMediaVariant } from './heroMedia';

describe('resolveHeroMediaVariant', () => {
  it('defaults to video when nothing is set', () => {
    expect(resolveHeroMediaVariant('', undefined)).toBe('video');
  });

  it('uses the env flag when there is no query param', () => {
    expect(resolveHeroMediaVariant('', 'photo')).toBe('photo');
  });

  it('lets the ?hero= query param override the env flag', () => {
    expect(resolveHeroMediaVariant('?hero=photo', 'video')).toBe('photo');
    expect(resolveHeroMediaVariant('?hero=video', 'photo')).toBe('video');
  });

  it('ignores unrecognised values', () => {
    expect(resolveHeroMediaVariant('?hero=gif', 'nonsense')).toBe('video');
    expect(resolveHeroMediaVariant('?hero=gif', 'photo')).toBe('photo');
  });
});
