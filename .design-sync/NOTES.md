# design-sync notes — glowdex

Repo-specific gotchas for `/design-sync`. Append to this whenever a re-sync
teaches you something.

## This repo is an app, not a library

- No Storybook, no `*.stories.*`, and `package.json` has **no** `main`/`module`/`exports`.
  There is no shipped library entry or `.d.ts` tree.
- `shape` is pinned to `package` in the config.
- **Do not** let the converter fall into synth-entry mode (it `export *`s every
  `src/**/*.tsx`, which pulls in `main.tsx`'s `createRoot().render()` side effect and
  breaks the bundle at load). Instead we pass an explicit curated barrel as `--entry`:
  `--entry ./.design-sync/entry.tsx`. That barrel re-exports only the curated components,
  and `componentSrcMap` in the config pins the same set (drives the card/.d.ts list and
  the per-component src enrichment).

## Scope: presentational subset only

Deliberately curated to the provider-free, presentational UI. Excluded because they need
live data / providers and render better as static screenshots:

- Chat / AI: `ChatInterface`, `ChartAIInsights`
- Charts: `ViolinPlot`, `SiteConditionChart`, `SpeciesDonutChart`
- Data-fetching widgets: all `*Widget`, `BiodiversityPanel` (`usePartners`), `SidePanel`
  (composes coupled children), `DatasetVersionBadge` (`useData`)
- Map runtime: `Map`, `GridLayer`, all `*Layer`

`WelcomeModal`, `TileCapsule`, `StatisticalDetailToggle` call `usePostHog()` but
optional-chain it (`posthog?.`), so they render without a provider — no `cfg.provider` needed.

## CSS / tokens

- `cssEntry` is `dist/glowdex.css` — a stable copy of the content-hashed
  `dist/assets/index-*.css`, made by `cfg.buildCmd`
  (`npm run build && cp dist/assets/index-*.css dist/glowdex.css && tsc -p .design-sync/tsconfig.dts.json`).
  Always run the full `buildCmd` before the converter; a bare `npm run build` wipes `dist/`
  (incl. `dist/types` and `dist/glowdex.css`).
- **Tailwind v4 ignores `tailwind.config.js` unless the CSS says `@config`.** Before the
  2026-09-23 sync, `src/styles/globals.css` lacked it, so `bg-glowdex-green`/`bg-glowdex-teal`
  and the whole safelist were never compiled (invisible Retry button in `DataUnavailable`,
  uncoloured bars in `StatisticalDetailToggle`). Fixed by adding
  `@config '../../tailwind.config.js';`. If brand classes vanish again, check that line first.
- Only classes the app itself uses exist in the shipped CSS (compiled output, not the full
  Tailwind set). `conventions.md` enumerates the verified vocabulary.
- `guidelinesGlob` = `docs/design/*.md` (the design-context doc). The default glob picked up
  `docs/architecture.md` etc., which are engineering docs, not design guidance.

## Getting real prop types (no shipped .d.ts)

The converter only extracts props from a shipped `.d.ts` tree — with none, every
`<Name>Props` degrades to `[key: string]: unknown`. Fix: emit declarations first with
`node_modules/.bin/tsc -p .design-sync/tsconfig.dts.json` → `dist/types/`.
`findTypesRoot` prefers `dist/types` over `lib`, so the build then extracts real props.
**Re-run the tsc emit whenever component source changes, before `package-build.mjs`.**
Caveat: `@/`-aliased domain types (RichGridCell, TypologyMap, AIStatisticalContextV1)
resolve to `any` in the emitted contracts because ts-morph isn't given the path alias —
prop names + literal unions are accurate; exact object shapes live in the bundled source.

## Gotchas hit during the verify loop

- **Do not stage the converter's `lib/` at the repo root** without `dist/types/` present —
  `findTypesRoot`'s candidate list includes `lib`, so it would point ts-morph at the wrong
  tree. Emitting to `dist/types` (higher priority) avoids the collision.
- **MapTooltip is `export default memo(...)`** — no named export. The barrel must use
  `export { default as MapTooltip }` or the bundle symbol is `undefined` ("Element type is
  invalid" at render).
- **TopBar excluded** — it renders `DatasetVersionBadge`, which calls `useData()` and throws
  outside a `DataProvider`. Not cleanly decoupled; dropped from the curated set.
- **Overlay/full-screen components need a positioned frame in their preview.**
  `LoadingState`/`DataUnavailable` (`absolute inset-0`) and `MapLayerLegend`
  (`absolute bottom-8 left-3`) render inside a `position: relative` div with a height;
  `WelcomeModal`/`MenuDrawer` (`fixed`) render inside a `transform: translateZ(0)` frame, which
  becomes the containing block for fixed children. Config also sets `cardMode: single` for
  those two and `column` for `SelectionPanel` (`[GRID_OVERFLOW]` fixes).
- `WelcomeModal` preview clears localStorage `glowdex_welcome_dismissed` before rendering, or it
  renders null after a dismissal in the same browser.
- `QuantileSlider` range is 0–0.5 (`QUANTILE_CONFIG`); values above 0.5 pin to the max.
- `TileCapsule`'s `source` prop only tags analytics; the preview varies `currentScale` instead.
- **StatisticalDetailToggle previews collapsed** — it holds `isOpen` in internal state with
  no prop to force-open, so the preview shows the "Show statistical detail" toggle. The
  section headers + indicator rows (`Section`/`StatRow`) live inside the bundled source and
  render on expand; the `statistics` fixture in its preview covers all three groups.

## Known render warns

- `[RENDER_THIN]` "mounts have no text and paint nothing" on `CrabIcon`, `LocalSiteMarkerIcon`,
  `MangroveExtentIcon`, `PartnerMarkerIcon`, `SearchMarkerIcon`, `SpeciesMarkerIcon` — pure SVG
  glyphs with no text nodes; review sheets show them painting correctly. Benign.

## Converter fork

- `.design-sync/overrides/bundle.mjs` (declared in `cfg.libOverrides`) adds a directory
  index-import fix (isFile check) and `.jpg/.jpeg/.gif/.webp` dataurl loaders. It imports
  `../../.ds-sync/lib/common.mjs` and needs `ln -sfn ../.ds-sync/node_modules .design-sync/node_modules`
  on each fresh clone. On re-sync, diff it against the bundled `lib/bundle.mjs` and re-apply the
  two small patches onto the newer version.
- Staged scripts live in `.ds-sync/` (gitignored) — never at the repo root (a root `lib/`
  collides with `findTypesRoot`).

## Re-sync risks

- `dtsPropsFor` is unset: `@/`-aliased domain types (`TypologyMap`, `RichGridCell`) appear as
  unresolved names or `any` in `<Name>.d.ts`. Prop names are right; shapes live in previews.
- Preview fixtures inline domain data (cells, typology colours). If typology colours or
  `EnrichedGridCell` fields change upstream, the fixtures go stale silently — re-check
  `TileCapsule`, `TypologyLegend`, `FilterControls`, `SelectionPanel`, `MapTooltip` previews.
- The design-context doc in `guidelines/` is hand-maintained; it drifts from the code unless
  someone updates it.
- `StatisticalDetailToggle` preview only shows the collapsed toggle (no prop to force open) —
  the coloured indicator bars are never visually verified.
- Chromium for the render check comes from the repo's `playwright` (pinned build 1234 in
  `~/Library/Caches/ms-playwright`); a playwright bump needs a matching browser install.

## Prop-driven previews to watch in the verify loop

These take domain data via props (not live fetches) and will need `cfg.previewArgs` or a
hand-edited `.design-sync/previews/<Name>.tsx` fixture to render meaningfully rather than
their empty state:

- `SelectionPanel` (needs a `selectedCell` + `typologies`), `MapTooltip` (`RichGridCell`),
  `StatisticalDetailToggle` (`statistics: AIStatisticalContextV1` — the section headers +
  indicator rows), `FilterControls`, `DownloadSummaryButton`.
