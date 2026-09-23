# MBCAM (GLOWdex) — how to build with this design system

MBCAM is a mangrove-mapping web app. These components are its real UI pieces; the look is
**stock Tailwind v4 utilities + two brand colours**, on the system sans-serif font. There is no
provider or theme wrapper — every component renders standalone once `styles.css` is linked.

## The styling idiom: Tailwind utilities, but only compiled ones

`styles.css` → `_ds_bundle.css` is the app's **compiled** Tailwind output. Only classes the app
itself uses exist — an unused utility (e.g. `text-glowdex-green`, `bg-emerald-600`) silently
does nothing. Before using a class you haven't seen below, grep `_ds_bundle.css` for it; if it's
absent, use an inline `style={{…}}` with the hex value instead.

| Role                                         | Classes that exist                                                                                                                |
| -------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| Brand fills                                  | `bg-glowdex-green` (#0a5c47, headers/primary), `bg-glowdex-teal` (#1d9e75), `hover:bg-glowdex-teal`                               |
| Interactive green (links, active tabs, CTAs) | `bg-[#0f6e56]`, `text-[#0f6e56]`, `hover:bg-[#085041]`                                                                            |
| Status bars                                  | `bg-glowdex-green` (good), `bg-amber-500` (mid), `bg-red-500` (poor)                                                              |
| Surfaces                                     | `bg-white`, `bg-gray-50`, `bg-gray-100`, `bg-teal-50` + `border-teal-200` + `text-teal-800` (chip)                                |
| Borders                                      | `border-gray-100`, `border-gray-200`                                                                                              |
| Text colour                                  | `text-gray-900` headings → `text-gray-700/600` body → `text-gray-500/400` meta                                                    |
| Type scale                                   | `text-2xl` title, `text-base`, `text-sm` body, `text-xs` labels, `text-[10px]` micro                                              |
| Section labels                               | `text-xs font-semibold text-gray-400 uppercase tracking-wider` (or `tracking-widest`)                                             |
| Weight / leading                             | `font-medium`, `font-semibold`, `font-bold`, `leading-relaxed`                                                                    |
| Radius / shadow                              | `rounded-md` (buttons, chips), `rounded-lg`, `rounded-xl` (cards), `rounded-2xl` (modals); `shadow-sm`, `shadow-md`, `shadow-2xl` |
| Layout                                       | `flex`, `grid grid-cols-2`, `gap-2`, `gap-3`, `space-y-2`, `space-y-4`, `p-4`, `p-5`, `px-3 py-2`                                 |

Cards are `rounded-xl border border-gray-100 bg-white p-5 shadow-sm`. Primary buttons are
`rounded-md bg-glowdex-green text-white text-sm font-medium hover:bg-glowdex-teal`.

## Placement gotchas (these cost real debugging)

- `LoadingState` and `DataUnavailable` are **full-screen** (`absolute inset-0`): put them in a
  `position: relative` parent with a height, or they collapse.
- `MapLayerLegend` is a **map overlay** (`absolute bottom-8 left-3`): its parent must be the
  positioned map container. It returns `null` when no layer is enabled.
- `WelcomeModal` and `MenuDrawer` are **fixed** overlays with their own backdrop. `WelcomeModal`
  hides itself once dismissed (localStorage key `glowdex_welcome_dismissed`).
- `QuantileSlider` range is 0–0.5 (default 0.25).
- Domain props (`selectedCell`, `typologies`) are plain objects — see each `<Name>.prompt.md`
  and the preview examples for the exact shape (`typologies.scale5[id].color`, etc.).

## Where the truth lives

- `_ds_bundle.css` — the full class vocabulary. Grep it.
- `components/<group>/<Name>/<Name>.prompt.md` + `<Name>.d.ts` — props and working examples.
- `guidelines/` — the MBCAM design-context doc: palette roles, typology colours, verbatim copy,
  layout (side panel, mobile tabs) and user flows.

## Example

```jsx
const { SelectionPanel, TileCapsule, DownloadSummaryButton } = window.Glowdex;

<aside className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm space-y-4">
  <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
    Selected tile
  </h2>
  <SelectionPanel
    selectedCell={cell}
    typologies={typologies}
    currentScale="scale5"
  />
  <div className="flex gap-2">
    <TileCapsule
      selectedCell={cell}
      typologies={typologies}
      currentScale="scale5"
      source="partner"
      onNavigateToAnalysis={() => {}}
    />
  </div>
  <button className="rounded-md bg-glowdex-green text-white text-sm font-medium px-3 py-2 hover:bg-glowdex-teal">
    View analysis
  </button>
</aside>;
```
