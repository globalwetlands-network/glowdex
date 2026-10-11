import ts from 'typescript';

/**
 * Static check for dead-end links (GLO-210), used by noDeadLinks.spec.ts.
 * Parses TS/TSX and looks only at link positions, whatever the quoting:
 * - JSX `href` / `to` attributes: `href="#"`, `href={'#'}`, ``href={`#`}``
 * - object properties named `href`, `to`, `url` or `link`
 * - constants whose name ends in HREF, URL or LINK (e.g. `METHODS_HREF`)
 *
 * A value is dead when it's empty, a bare `#`, or a `javascript:` URL. A page
 * that doesn't exist yet goes through SiteLink and src/constants/comingSoon.ts
 * instead.
 */

export interface LinkFinding {
  file: string;
  line: number;
  value: string;
}

export interface LinkScan {
  /** Dead link values found. */
  dead: LinkFinding[];
  /** In-page anchors used as link values (`#faq` → `faq`). */
  anchors: LinkFinding[];
  /** Static `id="…"` values on intrinsic JSX elements (`<section id="faq">`). */
  ids: Set<string>;
}

const LINK_ATTRIBUTES = new Set(['href', 'to']);
const LINK_PROPERTIES = new Set(['href', 'to', 'url', 'link']);
const LINK_CONSTANT = /(?:href|url|link)$/i;

/** True for a link value that goes nowhere. */
export function isDeadLinkValue(value: string): boolean {
  const v = value.trim();
  return v === '' || v === '#' || /^javascript:/i.test(v);
}

/** The literal text of a string or no-substitution template, else null. */
function staticString(node: ts.Node | undefined): string | null {
  if (!node) return null;
  if (ts.isJsxExpression(node)) return staticString(node.expression);
  if (ts.isParenthesizedExpression(node)) return staticString(node.expression);
  if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) {
    return node.text;
  }
  return null;
}

/** The name of an identifier or string-literal property key, else null. */
function keyName(name: ts.PropertyName | ts.BindingName): string | null {
  if (ts.isIdentifier(name) || ts.isStringLiteral(name)) return name.text;
  return null;
}

/** Scans one source file for link values and static element ids. */
export function scanLinks(
  file: string,
  source: string,
  into?: LinkScan,
): LinkScan {
  const scan: LinkScan = into ?? { dead: [], anchors: [], ids: new Set() };
  const sf = ts.createSourceFile(
    file,
    source,
    ts.ScriptTarget.Latest,
    true,
    file.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
  );

  /** Records a link value found at `node`. */
  function record(node: ts.Node, value: string): void {
    const line = sf.getLineAndCharacterOfPosition(node.getStart(sf)).line + 1;
    const finding = { file, line, value };
    if (isDeadLinkValue(value)) scan.dead.push(finding);
    else if (value.startsWith('#')) scan.anchors.push(finding);
  }

  /** Visits every node, collecting link values and ids. */
  function visit(node: ts.Node): void {
    if (ts.isJsxAttribute(node) && ts.isIdentifier(node.name)) {
      const name = node.name.text;
      const value = staticString(node.initializer);
      if (value !== null && LINK_ATTRIBUTES.has(name)) record(node, value);
      // Only intrinsic elements (<section id>) render a DOM id; a component
      // prop named `id` (e.g. SiteLink's) does not.
      const tag = node.parent.parent;
      if (
        value !== null &&
        name === 'id' &&
        (ts.isJsxOpeningElement(tag) || ts.isJsxSelfClosingElement(tag)) &&
        ts.isIdentifier(tag.tagName) &&
        /^[a-z]/.test(tag.tagName.text)
      ) {
        scan.ids.add(value);
      }
    } else if (ts.isPropertyAssignment(node)) {
      const name = keyName(node.name);
      const value = staticString(node.initializer);
      if (name && value !== null && LINK_PROPERTIES.has(name)) {
        record(node, value);
      }
    } else if (ts.isVariableDeclaration(node)) {
      const name = keyName(node.name);
      const value = staticString(node.initializer);
      if (name && value !== null && LINK_CONSTANT.test(name)) {
        record(node, value);
      }
    }
    ts.forEachChild(node, visit);
  }

  visit(sf);
  return scan;
}
