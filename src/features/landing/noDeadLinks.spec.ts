import { describe, expect, it } from 'vitest';

/**
 * Regression guard (GLO-210): no dead-end links in the landing page or the
 * map menu content. A page that doesn't exist yet goes through SiteLink and
 * src/constants/comingSoon.ts instead of an `href="#"`.
 */
const SOURCES = import.meta.glob<string>(
  [
    '/src/features/landing/**/*.{ts,tsx}',
    '/src/app/content/**/*.{ts,tsx}',
    '/src/app/components/TopBar.tsx',
    '/src/app/components/MenuDrawer.tsx',
    '!**/*.spec.{ts,tsx}',
  ],
  { query: '?raw', import: 'default', eager: true },
);

const DEAD_LINK_PATTERNS: [string, RegExp][] = [
  ['href="#"', /href=["']#["']/],
  ['href=""', /href=["']["']/],
  ['to="#"', /\bto=["']#?["']/],
  ["href: '#' / href: ''", /\bhref:\s*["']#?["']/],
  ["…HREF = '#'", /HREF\s*=\s*["']#?["']/],
];

describe('no dead-end links (GLO-210)', () => {
  it('scans the landing page and menu sources', () => {
    expect(Object.keys(SOURCES).length).toBeGreaterThan(10);
  });

  it.each(DEAD_LINK_PATTERNS)('has no %s', (_label, pattern) => {
    const offenders = Object.entries(SOURCES)
      .filter(([, source]) => pattern.test(source))
      .map(([path]) => path);
    expect(offenders).toEqual([]);
  });
});
