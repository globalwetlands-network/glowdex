import { describe, expect, it } from 'vitest';
import { scanLinks, type LinkScan } from './deadLinks';

/**
 * Regression guard (GLO-210): no dead-end links in the landing page or the
 * map menu, and every in-page anchor has a target. A page that doesn't exist
 * yet goes through SiteLink and src/constants/comingSoon.ts instead.
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

function scanAll(): LinkScan {
  const scan: LinkScan = { dead: [], anchors: [], ids: new Set() };
  for (const [file, source] of Object.entries(SOURCES)) {
    scanLinks(file, source, scan);
  }
  return scan;
}

describe('no dead-end links (GLO-210)', () => {
  it('scans the landing page and menu sources', () => {
    expect(Object.keys(SOURCES).length).toBeGreaterThan(10);
  });

  it('has no empty, "#" or javascript: links', () => {
    expect(scanAll().dead).toEqual([]);
  });

  it('has a target id for every in-page anchor', () => {
    const { anchors, ids } = scanAll();
    expect(anchors.length).toBeGreaterThan(0);
    expect(anchors.filter((a) => !ids.has(a.value.slice(1)))).toEqual([]);
  });
});

describe('scanLinks', () => {
  /** Dead values found in a TSX snippet. */
  const deadIn = (source: string) =>
    scanLinks('x.tsx', source).dead.map((d) => d.value);

  it.each([
    ['href="#"', '<a href="#">x</a>'],
    ["href={'#'}", "<a href={'#'}>x</a>"],
    ['href={`#`}', '<a href={`#`}>x</a>'],
    ['href=""', '<a href="">x</a>'],
    ['javascript: URL', '<a href="javascript:void(0)">x</a>'],
    ['to="#"', '<Link to="#">x</Link>'],
    ["href: '#'", "const l = { label: 'A', href: '#' };"],
    ["url: ''", "const l = { url: '' };"],
    ["link: '#'", "const l = { link: '#' };"],
    ["…_HREF = '#'", "export const METHODS_HREF = '#';"],
    ["…_URL = '#'", "export const METHODS_URL = '#';"],
  ])('catches %s', (_label, source) => {
    expect(deadIn(source)).toHaveLength(1);
  });

  it.each([
    ['a real path', '<a href="/map">x</a>'],
    ['an in-page anchor', '<a href="#faq">x</a>'],
    ['a hex colour', "const c = { color: '#ef4444' };"],
    ['an unrelated string', "const label = '#';"],
    ['a dynamic href', '<a href={url}>x</a>'],
  ])('ignores %s', (_label, source) => {
    expect(deadIn(source)).toEqual([]);
  });

  it('collects anchors and only intrinsic-element ids', () => {
    const scan = scanLinks(
      'x.tsx',
      `<>
        <a href="#faq">FAQ</a>
        <section id="faq" />
        <SiteLink id="methods" />
        <div style={{ color: '#ef4444' }} />
      </>`,
    );
    expect(scan.anchors.map((a) => a.value)).toEqual(['#faq']);
    expect([...scan.ids]).toEqual(['faq']);
  });
});
