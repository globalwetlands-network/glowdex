import { describe, expect, it } from 'vitest';
import * as seeItInAction from '../components/SeeItInAction/content';
import {
  EXAMPLE_HIGHLIGHT,
  EXAMPLE_INSIGHTS,
  EXAMPLE_QUOTE,
} from '../fixtures/workedExample';
import * as factSheet from './factSheet';
import * as faqs from './faqs';
import * as footer from './footer';
import * as howItWorks from './howItWorks';
import * as partners from './partners';
import * as whoItsFor from './whoItsFor';
import * as whyItMatters from './whyItMatters';

/**
 * Landing copy says "condition profile", not "typology", and "restored", not
 * "rehabilitated" (GLO-231). The data value 'Rehabilitated' lives in fixtures
 * and API types, which this doesn't read.
 */
const LEGACY_TERMS = /typolog|rehabilitat/i;

/** Published titles keep their own wording. */
const ALLOWED = new Set(footer.FOOTER_SOURCES.map((source) => source.title));

/** Keys whose values are identifiers, not copy. */
const IDENTIFIER_KEYS = new Set(['target']);

function collectStrings(value: unknown, path: string, out: [string, string][]) {
  if (typeof value === 'string') {
    out.push([path, value]);
  } else if (Array.isArray(value)) {
    value.forEach((item, i) => collectStrings(item, `${path}[${i}]`, out));
  } else if (
    value !== null &&
    typeof value === 'object' &&
    // Skip React components (e.g. lucide icons).
    !('$$typeof' in value)
  ) {
    for (const [key, child] of Object.entries(value)) {
      if (!IDENTIFIER_KEYS.has(key)) {
        collectStrings(child, `${path}.${key}`, out);
      }
    }
  }
}

describe('landing copy', () => {
  it('never says "typology" or "rehabilitated", apart from published titles', () => {
    const strings: [string, string][] = [];
    collectStrings(
      {
        seeItInAction,
        factSheet,
        faqs,
        footer,
        howItWorks,
        partners,
        whoItsFor,
        whyItMatters,
        workedExample: { EXAMPLE_HIGHLIGHT, EXAMPLE_INSIGHTS, EXAMPLE_QUOTE },
      },
      'copy',
      strings,
    );

    const offenders = strings.filter(
      ([, text]) => LEGACY_TERMS.test(text) && !ALLOWED.has(text),
    );
    expect(offenders).toEqual([]);
    // The walk reaches the copy, and the Sievers title is the one exception.
    expect(strings.length).toBeGreaterThan(50);
    expect(strings.some(([, text]) => ALLOWED.has(text))).toBe(true);
  });
});
