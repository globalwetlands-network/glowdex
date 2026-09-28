# GLOWdex / MBCAM — Design Context

**Mangrove Biodiversity & Condition Action Map (MBCAM)** — an interactive Mapbox map of
mangrove grid cells with typology colouring, statistical widgets, and an AI insight assistant.
Frontend repo: `~/Code/glowdex` (React 19 + TypeScript + Vite + Tailwind v4). Backend repo:
`~/Code/glowdex-api` (NestJS).

This document was assembled by reading source. Every value below is cited to a file path
(with line numbers where useful). Where a value is inferred rather than read, it is marked
**(inferred)**. Where something does not exist, that is stated rather than filled in.

> Scope note for the redesign: the two artefacts in focus are the **landing/first-load
> experience** and the **side panel** (desktop + mobile). Everything else (map, menu drawer,
> modals) is documented for context.

---

## Contents

1. [Visual system](#1-visual-system) — colours, typology colours, typography, spacing, radius, shadow, breakpoints, logos, icons
2. [Layout](#2-layout) — app shell, mobile tabs, side panel width & scroll
3. [Component inventory](#3-component-inventory) — shared UI + every named widget
4. [User flows & states](#4-user-flows--states) — first load, welcome, search, selection, panel states
5. [Content, verbatim](#5-content-verbatim) — welcome, typologies explainer, menu, typologies, indicators, empty/error copy, legend, assistant text
6. [What the data can show](#6-what-the-data-can-show) — cell / local / species / partner fields, download summary
7. [A real example](#7-a-real-example) — real AI insight (does one exist?)

---

## 1. Visual system

### 1.1 Colour palette

There are **only two defined design tokens.** Everything else is a stock Tailwind utility or a
**raw hex literal hardcoded in components.** This is the single biggest gap for a designer:
there is no real colour system, and the green used for interactive elements everywhere
(`#0f6e56`) is **not** the same as the official brand green (`#0a5c47`).

**Defined tokens** — the `@theme` block in `src/styles/globals.css` (Tailwind v4 CSS-first config;
there is no `tailwind.config.js`):

| Token           | Hex       | Where used                                                                                                                           |
| --------------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `glowdex-green` | `#0a5c47` | Official brand green. Top bar background, menu-drawer header, PDF headers, `theme-color` meta. `globals.css` `--color-glowdex-green` |
| `glowdex-teal`  | `#1d9e75` | Brand teal. Partner/mangrove markers, biodiversity-panel accents. `globals.css` `--color-glowdex-teal`                               |

**Statistical-bar colours:** `bg-glowdex-green`, `bg-glowdex-teal`, `bg-amber-500` (warning/mid),
`bg-red-500` (low/high-stress), `bg-gray-50` (section shade). These compile only because each
class name is written out in full in `StatisticalDetailToggle.tsx`. Tailwind v4 has no safelist:
a class built at runtime (e.g. `` `bg-${color}` ``) is dropped unless listed with
`@source inline(...)` in `globals.css`.

**Raw hex literals actually used across the UI** (not tokenised):

| Hex       | Role                                                                                           | Representative citation                                                                                      |
| --------- | ---------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| `#0a5c47` | Official brand green — top bar, drawer header, PDF                                             | `TopBar.tsx:71`, `MenuDrawer.tsx:200`, `index.html:13`                                                       |
| `#0f6e56` | **Interactive green** — links, active tabs, toggles, icons (hardcoded everywhere, NOT a token) | `SidePanel.tsx:131,142`, `WelcomeModal.tsx:80,129`, `MobileTabNavigation.tsx:40,44`, `FilterControls.tsx:72` |
| `#085041` | Darker-green hover, paired with `#0f6e56`                                                      | `WelcomeModal.tsx:129`, `TypologyLegend.tsx:23`                                                              |
| `#1d9e75` | Brand teal — markers, biodiversity toggles/borders                                             | `map-colours.ts`, `BiodiversityPanel.tsx:146,173`                                                            |
| `#3b82f6` | Monitoring / local-site blue (Tailwind blue-500); also violin fill                             | `map-colours.ts` (`MONITORING_COLOUR`), `ViolinPlot.tsx:85`                                                  |
| `#1d4ed8` | Local-site marker stroke (blue-700)                                                            | `LocalSiteMarkerIcon.tsx:15`                                                                                 |
| `#4CAF82` | "Tile" colour — SelectTilePrompt swatch, Welcome tile icon                                     | `map-colours.ts` (`TILE_COLOUR`)                                                                             |
| `#00827F` | Species marker/distribution teal                                                               | `SpeciesMarkerIcon.tsx:20`                                                                                   |
| `#000000` | Selected grid-cell outline                                                                     | `GridLayer.tsx:84`                                                                                           |

Source: `src/constants/map-colours.ts`, plus inline literals throughout `src/`.

**Local-monitoring "site condition" palette** — `src/data/constants/localWetlands.constants.ts:29–38`.
Used by the crab chart and map hover badge:

| Condition          | Hex                          |
| ------------------ | ---------------------------- |
| Reference          | `#4a7c59` (deep sage green)  |
| Degraded           | `#b85c4a` (muted terracotta) |
| Rehabilitated      | `#c49a3c` (warm amber)       |
| Unknown (fallback) | `#6b7280` (gray-500)         |

**Crab-species palette** (viridis "H") — `src/data/constants/speciesPalette.ts:15–21`:
`#440154` Austruca occidentalis · `#31688e` Paraleptuca chlorophthalmus · `#35b779` Perisesarma
guttatum · `#fde725` Neosarmatium africanum · `#f97316` Tubuca urvillei.

**PDF export brand green** — `generateCellSummaryPdf.ts:4`: `[10, 92, 71]` = `#0a5c47`; alt row
fill `[244, 248, 246]`.

**PWA / meta** — `theme_color` `#0a5c47`, `background_color` `#ffffff` (`public/manifest.json`,
`index.html:13`). Title bar text: `MBCAM`.

### 1.2 Typology colours (data-driven — expected to change)

Typology fill colours are **not defined in code.** They come from the dataset CSV columns
`hex_5` (5-scale) and `hex_18` (18-scale), read in `deriveTypologies.ts:53–82`:

- Border/stroke = `row.hex_5`; map fill = same hex at **30% opacity** (`FILL_OPACITY = 0.3`,
  `deriveTypologies.ts:4`).
- Rendered as a Mapbox `match` expression in `GridLayer.tsx:22–37`.

**Because these live in the loaded dataset, they will change after the model rerun.** Current
values read from `public/data/all-clusters.csv` (backend):

Scale of 5 (`cluster_5` → `hex_5`, with the `label5` name from `ai-context-v1.csv`):

| #   | label5 (data) | Hex                |
| --- | ------------- | ------------------ |
| 1   | Urban         | `#cd2626` (red)    |
| 2   | Subtropical   | `#eead0e` (gold)   |
| 3   | Tropical      | `#43cd80` (green)  |
| 4   | Arid          | `#6ca6cd` (blue)   |
| 5   | Temperate     | `#b452cd` (purple) |

Scale of 18 (`hex_18`, `Typology_1…18`): `#FF3030 #CD2626 #EE7600 #EEC900 #EEAD0E #EEDC82
#98FB98 #43CD80 #AEEEEE #6CA6CD #4876FF #6959CD #EEAEEE #9F79EE #B452CD #FF3E96 #EE799F #FF6A6A`.

> **Naming mismatch to flag:** the _frontend_ 5-typology explainer names typologies
> "The Catchall", "High Land and Marine Impacts", etc. (see §5.5), while the _dataset_ `label5`
> values are "Urban / Subtropical / Tropical / Arid / Temperate". These two naming schemes do
> not line up. The AI prompt is instructed never to show raw `Typology_6`-style labels to users
> (`system-instruction.ts:73–75`).

### 1.3 Typography

**There is no typography system.** No web fonts are loaded, no font packages in `package.json`,
no `@font-face`, no Google Fonts link in `index.html`, and `src/styles/globals.css` contains
only `@import 'tailwindcss';` plus the two colour tokens in `@theme`. Type therefore falls back to the **Tailwind v4 default sans
stack** (`ui-sans-serif, system-ui, …`) **(inferred)**.

Sizes/weights are ad-hoc Tailwind utilities (no custom scale). Observed patterns:

- Sizes used: `text-[10px]`, `text-xs`, `text-sm`, `text-base`, `text-2xl`.
- Weights: `font-medium`, `font-semibold`, `font-bold`.
- Recurring **section-header style**: `text-xs font-semibold text-gray-400 uppercase
tracking-wider` (e.g. `CollapsibleSection.tsx:31`, `FilterControls.tsx:35`).
- `font-mono` used once — reference index numbers in the menu drawer (`MenuDrawer.tsx:120`).

Actual pixel sizes are Tailwind defaults **(inferred)**: `text-xs` ≈ 12px, `text-sm` ≈ 14px,
`text-base` ≈ 16px, `text-2xl` ≈ 24px.

### 1.4 Spacing, border radius, shadow

**No custom tokens** — `@theme` in `globals.css` defines only the two brand colours. All spacing/radius/shadow
are Tailwind defaults **(inferred)**. Observed conventions:

- **Radius:** `rounded-lg` and `rounded-md` dominate; `rounded-full` for pills/toggles;
  `rounded-xl` for cards; `rounded-2xl` for the welcome modal; `rounded-sm` for colour swatches.
- **Shadow:** `shadow-sm` for cards, `shadow-lg`/`shadow-xl` for popovers/panels, `shadow-2xl`
  for the modal and menu drawer, `shadow-inner` for empty states.
- **Card pattern (repeated inline, not a component):** `rounded-xl border border-gray-100
bg-white p-4 shadow-sm`.

### 1.5 Breakpoints

No custom `screens` defined → Tailwind v4 defaults apply **(inferred)**: `sm` 640 · `md` 768 ·
`lg` 1024 · `xl` 1280 · `2xl` 1536. **Only `sm:` and `md:` are actually used** in the codebase.
The single breakpoint that flips desktop ↔ mobile is **`md` = 768px**, also hardcoded as
`MOBILE_BREAKPOINT = 768` in `src/app/constants/app.constants.ts:6`. `darkMode: 'class'` is set
but no dark styles exist.

### 1.6 Logos, icons, icon library

**Icon library:** `lucide-react` `^0.563.0` (`package.json:32`) — imported as React components
(Search, Building2, MapPin, Leaf, BarChart2, Download, RotateCw, etc.).

**Logo / brand image:**

- `src/assets/globalwetlands.png` — the MBCAM/Global Wetlands logo (PNG). Used in the top bar,
  welcome modal, loading and data-unavailable screens.
- `src/assets/react.svg`, `public/vite.svg` — boilerplate, likely unused.

**Custom SVG marker components** — `src/components/map/markers/`: `PartnerMarkerIcon`,
`LocalSiteMarkerIcon`, `MangroveExtentIcon`, `SearchMarkerIcon`, `SpeciesMarkerIcon`. Plus
`src/components/icons/MapMarkers.tsx` (`TileMarkerIcon`, `PartnerMarkerIcon`,
`MonitoringLocationIcon`) used in the welcome modal, and `src/components/icons/CrabIcon.tsx`
(the assistant's mascot).

**Favicons / app icons** (`public/`): `favicon.ico`, `favicon-32x32.png`, `favicon-16x16.png`,
`apple-touch-icon.png`, `android-chrome-192x192.png`, `android-chrome-512x512.png`.

**Species photos** (`src/assets/species/`, JPG): `estuary-stingray.jpg`, `fiddler-crab.jpg`,
`fiddler-crab-second.jpg`, `katala.jpg`, `katala-on-branch.jpg`.

---

## 2. Layout

### 2.1 Desktop app shell — `AppLayout.tsx:27–61`

Full viewport, no page scroll (`h-dvh w-screen flex flex-col overflow-hidden`).

- **Top bar** — full width, all breakpoints.
- **Main row** — `flex md:flex-row`:
  - **Side panel = LEFT**, flex weight `md:flex-[0.75]` (`AppLayout.tsx:35`).
  - **Map = RIGHT**, flex weight `md:flex-[1.25]` (`AppLayout.tsx:47`).
  - So the desktop split is roughly **panel ≈ 37.5% / map ≈ 62.5%**. The panel is **fluid, not a
    fixed pixel width.**

### 2.2 Mobile layout — `AppLayout.tsx:39–59`, `MobileTabNavigation.tsx`

Below `md` (768px): a **single content area** shows **either the side panel or the map**, never
both. A **bottom tab bar** (`bg-white border-t`, `pb-[env(safe-area-inset-bottom)]`) has three
tabs, each `flex-1`, icon size 20, label `text-[10px]`:

1. **Biodiversity** (Leaf icon) → side panel, Biodiversity content
2. **Analysis** (BarChart2 icon) → side panel, Analysis content; shows a pulsing badge dot until
   visited (`MobileTabNavigation.tsx:48–53`)
3. **Map** (Map icon) → the map

Active tab colour `#0f6e56` + a thin top accent bar; inactive `text-gray-500`.

**What changes desktop → mobile:** on desktop the Biodiversity/Analysis tabs live _inside_ the
panel (top tab strip) and the map is always co-visible; on mobile those two tabs move to the
bottom nav, a third **Map** tab is added, and panel/map become mutually exclusive.

### 2.3 Side panel — width & scroll — `SidePanel.tsx:123–325`

- Container: `bg-white shadow-xl flex flex-col w-full h-full md:border-r`. Width = 100% of its
  flex column (the 0.75 weight above); full-screen on mobile.
- **Desktop-only top tab strip** (`hidden md:flex`): two tabs **Biodiversity** (Leaf) /
  **Analysis** (BarChart2), each `flex-1 px-4 py-3 text-sm`. Active = `text-[#0f6e56]
border-b-2 border-[#0f6e56] font-medium`. Analysis tab can show a pulsing dot.
- **Scroll:** only the tab-content area scrolls (`flex-1 overflow-y-auto p-4 space-y-4`). Header
  strip and footer are `shrink-0`. Inactive tab content is `hidden`.
- **Footer** (always visible): `p-3 border-t bg-gray-50 text-xs text-center text-gray-400` →
  "{n} Mangrove Tiles".
- Auto-scroll behaviour (scroll-to-top on cell change vs scroll-to-local-data on site select)
  is handled by `useAnalysisScroll.ts`.

---

## 3. Component inventory

All shared/reusable UI. Note: many of these are **inline patterns, not extracted components** —
flagged where so.

### 3.1 Shared UI

| Element                             | Where                                                                  | Notes / variants                                                                                                                                                                                                                      |
| ----------------------------------- | ---------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **CollapsibleSection**              | `src/app/components/CollapsibleSection.tsx`                            | Icon + uppercase gray title + optional header-action slot + chevron. `defaultOpen` prop. Used for Location, Assistant, Filters, Global Wetlands Analysis.                                                                             |
| **Card** (pattern, not a component) | inline everywhere                                                      | `rounded-xl border border-gray-100 bg-white p-4 shadow-sm`; gray-50 variant for the Filters card.                                                                                                                                     |
| **Toggle switch** (pattern)         | `BiodiversityPanel.tsx:172,223`, `LocalWetlandsAnalysisWidget.tsx:128` | Two sizes: large `h-5 w-9` (on = `#1d9e75`), small `h-4 w-7` (on = `#0f6e56`). `role="switch"`.                                                                                                                                       |
| **Segmented / pill control**        | `FilterControls.tsx:40–63`                                             | Typology scale 5/18: `flex bg-gray-100 p-1 rounded-md`, active `bg-white shadow`.                                                                                                                                                     |
| **Suggestion chips**                | `ChatInterface.tsx:317–326`                                            | `rounded-full border-teal-200 bg-teal-50 text-teal-700`.                                                                                                                                                                              |
| **Colour swatch badge**             | SelectionPanel, TileCapsule, TypologyLegend, FilterControls            | `w-2.5 h-2.5 rounded-sm border border-black/10` with runtime `backgroundColor`.                                                                                                                                                       |
| **IUCN status badge**               | `SpeciesSpotlightWidget.tsx:452`, `SpeciesInfoPanel.tsx:46`            | `px-1 py-px rounded text-[9px] font-bold border`, colour from `CONSERVATION_STATUS_INFO`.                                                                                                                                             |
| **Insight badge**                   | `ChartAIInsights.tsx:53–69`                                            | warning (amber) vs insight (blue) variants.                                                                                                                                                                                           |
| **Hover tooltip** (pattern)         | SelectionPanel, TypologyLegend, ViolinPlot, etc.                       | Dark: `bg-gray-900 text-white text-[10px] rounded shadow-lg opacity-0 group-hover:opacity-100`.                                                                                                                                       |
| **Map tooltip**                     | `MapTooltip.tsx`                                                       | White card, shows Tile ID / country / typology, positioned by x/y.                                                                                                                                                                    |
| **Dropdown menu**                   | `TopBar.tsx:109–135`                                                   | `absolute w-56 bg-white rounded-lg shadow-lg`, closes on outside click. Also the Ask-AI preset dropdown (`ChartAIInsights.tsx`).                                                                                                      |
| **Native `<select>`**               | `LocalWetlandsAnalysisWidget.tsx`                                      | Country / monitoring-location pickers.                                                                                                                                                                                                |
| **Legend (typology)**               | `TypologyLegend.tsx`                                                   | scale5 = swatch+name rows w/ tooltip; scale18 = single italic paragraph linking to the paper.                                                                                                                                         |
| **Legend (map layers)**             | `MapLayerLegend.tsx`                                                   | Floating `absolute bottom-8 left-3 bg-white/90 backdrop-blur rounded-lg`; conditional rows per active layer.                                                                                                                          |
| **Buttons**                         | various                                                                | Primary green CTA `bg-[#0f6e56] text-white rounded-lg` (Welcome) / `bg-glowdex-green hover:bg-glowdex-teal` (Retry). Secondary teal chip `bg-teal-50 border-teal-200 text-teal-800`. Text link `text-[#0f6e56] hover:text-[#085041]`. |

### 3.2 Named widgets

**Typology badge** — two forms:

- **TileCapsule** (`src/components/shared/TileCapsule.tsx`) — the prominent teal capsule
  "Tile {id} · {country} · [swatch] {clusterId} [chart icon]" button that jumps to the Analysis
  tab. Dark hover tooltip with typology name/description. `source` prop (`'partner' | 'species'`)
  for analytics only. Renders `null` if no cluster. Used in the Species Spotlight and Partner
  card headers.
- **Inline typology pill** in **SelectionPanel** (`SelectionPanel.tsx:94–131`) — swatch +
  clusterId in a gray pill with hover tooltip.

**Violin plots** — `ViolinPlot.tsx`. `GroupedViolinPlot` groups indicator distributions by
dimension (bold section headers). Each row = a horizontal Plotly violin (blue `#3b82f6`, ~80px
tall) with a dotted line + pink diamond marking the selected cell's value; label + unit + info
tooltip; the value shown as a `text-pink-600 bg-pink-50` chip. States: loading skeleton
(`animate-pulse`), empty ("No data available…"). Wrapped by **GlobalWetlandsAnalysisWidget.tsx**,
which adds an amber "no mangrove habitat" empty state.

**Species spotlight card** — `src/components/widgets/SpeciesSpotlight/`:

- `SpeciesSpotlightWidget.tsx` — TileCapsule + "Species Spotlight" header + info toggle +
  rounded-full species tabs (with IUCN badge, "soon" for stubs) + `SpeciesTab` body + empty
  state.
- `SpeciesTab.tsx` — species image (`h-48 object-contain` + credit), bold/italic-parsed summary,
  source link, expandable `SpeciesInfoPanel`, three teal `StatCard`s (Observations 10yr / Last
  sighting / Primary range), GBIF total, map-tip toggle, applicability footer. States: stub
  ("Data coming soon"), loading, error.
- `SpeciesDonutChart.tsx` — Plotly pie (`hole:0.65`, 200×200, centre total). **Appears not wired
  into the current render path (inferred).**

**Assistant chat** — `AnalysisAssistantWidget.tsx` (wrapper: handles initial-insight query;
states = data-skewed "Catching up", loading animated CrabIcon, or the chat) → **ChatInterface.tsx**
(fixed `h-[400px]` card). See §5.9 for its verbatim strings.

**Local data widget + crab chart** — `src/components/widgets/LocalData/`:

- `LocalWetlandsAnalysisWidget.tsx` — always visible in the Analysis tab. Section header + small
  toggle + "Updated {Mon YYYY}" caption, Country/Location `<select>`s, site name + partner link,
  an **inactive year slider ("Time series coming soon")**, the crab chart, and the inactive
  "Crab species composition — Coming soon" trigger. Three states (see §4.5).
- `SiteConditionChart.tsx` — the **crab chart**: Plotly grouped **bar chart**, crab density per
  condition (Reference/Degraded/Rehabilitated), ±SE error bars, `n=` annotations, height 220.
- `SpeciesCompositionTrigger.tsx` — inactive row of crab-species colour swatches + "Crab species
  composition" + "Coming soon" (`pointer-events-none cursor-not-allowed`).

**Download button** — `DownloadSummaryButton.tsx` — teal chip "Download summary" with Download
icon. States: generating (spinner + "Preparing…", disabled), error ("Couldn't generate the
summary…"). Lives in the Location card header.

**Version badge** — `DatasetVersionBadge.tsx` — `px-2 py-1 text-white/60 text-[11px] rounded
bg-white/5`, shows `v{datasetVersion}`; renders `null` until the manifest resolves. Sits in the
top bar (`TopBar.tsx:96`).

**Menu drawer** — `MenuDrawer.tsx` — right slide-in, `fixed inset-y-0 right-0 w-full
sm:w-[480px] bg-white shadow-2xl` + `bg-black/50` backdrop. Green header (`#0a5c47`) with title +
X. Four content variants (About / Help / Methods & Data Sources / Contact). Opened from the top
bar Menu dropdown. Content is verbatim in §5.6.

**Data-unavailable screen** — `DataUnavailable.tsx` — full-screen centred: logo, headline, copy,
green Retry button, small error detail. Sibling `LoadingState.tsx` = pulsing logo + "Loading
MBCAM…". Copy verbatim in §5.8.

---

## 4. User flows & states

### 4.1 First load — `App.tsx:54–756`

1. Providers mount. **Critical data** (scientific data + indicators) loads; **background data**
   (local wetlands, partners, species config) loads without blocking.
2. Top-level three-way render (`App.tsx:734–755`): `isLoading` → `<LoadingState />`; else `error`
   → `<DataUnavailable onRetry={retry} />`; else the app. **Only critical-data failure triggers
   the error screen** — a local-data outage never blocks or errors the app.
3. On success: `<WelcomeModal />` + `AppLayout` render. **Default desktop panel tab =
   Biodiversity; default mobile tab = Map** (`App.tsx:75–78`).
4. Default map layers: mangrove overlay **on**, partner layer **on**, local-site layer **on**.

### 4.2 Welcome message — `WelcomeModal.tsx`

- **When:** on load if `localStorage['glowdex_welcome_dismissed']` is unset. First visit only —
  once dismissed it never returns.
- **Dismissable:** yes — X button, "Get started" button, Escape key, or backdrop click.
- Full text in §5.1.

### 4.3 Search — `Map.tsx:654–677`, `581–620`

Mapbox `SearchBox` (`@mapbox/search-js-react`) overlaid top-left of the map, placeholder
"Search a location...". Suggestions are proximity-biased to the current map centre and rendered
by Mapbox itself — **the app has no custom results list.** On selecting a result: fly to it at
**zoom 5** (shows ~3–5 grid cells), drop a temporary teardrop search marker; it does **not**
auto-select a cell. On clear: fly back to the global view, remove the marker, and clear any cell
selection.

### 4.4 Selecting a grid cell / a local site

- **Grid cell:** map click → `useMapInteraction.onClick` normalises the feature ID → `onCellSelect`.
  Clicking the background deselects. Selecting sets `selectedCellId`, clears any clicked
  partner/site, and (on mobile) switches to the Biodiversity tab. Backend statistics are then
  fetched (suppressed during dataset-version skew). A pulsing badge shows on the Analysis tab
  until it is visited.
- **Local monitoring site:** click a map pin or use the Country/Location dropdowns →
  `handleSiteSelect` sets `selectedSiteId`, switches the panel to the **Analysis** tab, scrolls
  to the local-data card, flies to the site, and **auto-selects the grid cell containing the
  site** (point-in-polygon). A proximity fallback auto-associates the nearest site within
  **157 km** (`MAX_SITE_ASSOCIATION_DISTANCE_KM`) when a cell is selected but no site is chosen;
  this drives the assistant's local-site context.

### 4.5 Side-panel states

**App-level (before the panel renders):** loading → `<LoadingState />`; critical error →
`<DataUnavailable />`. Local-data failure reads to the user as "no monitoring locations", never
an error.

**Analysis tab:**

- **Nothing selected:** `<SelectTilePrompt />` (colour swatch + prompt). The **Local Wetlands
  Analysis card is still shown** below it (always visible).
- **Cell selected:** four cards appear — Location (Clear-selection button, Download-summary
  button, SelectionPanel), Assistant (AI chat), Filters (typology scale + explainer + legend),
  Global Wetlands Analysis (violin plots) — plus the always-visible Local Wetlands card.
- **Cell with no local site nearby:** Local Wetlands widget's no-site branch — header + map
  toggle + "Select a monitoring location to view local field data." + country dropdown.
- **Site associated but not yet analysed:** site name/country + partner link + italic "Data
  still to be analysed".
- **Cell/site with local data:** full widget — header, dropdowns, site name + partner link,
  inactive year slider ("Time series coming soon"), the crab density chart, the inactive "Crab
  species composition — Coming soon" trigger.
- **Assistant degraded:** when frontend/backend dataset versions disagree, the assistant shows
  "Catching up — data just updated" and statistics are suppressed.

**Biodiversity tab:** always renders `<BiodiversityPanel>` regardless of selection — Species
Spotlight, Partner, Local Monitoring Locations (map toggle), Mangrove Habitat Extent (map toggle).

---

## 5. Content, verbatim

All copy below is copied exactly from source.

### 5.1 Welcome message — `WelcomeModal.tsx`

Eyebrow: **"Welcome to"** · Heading: **"MBCAM"**

Body:

> MBCAM is an interactive action map for exploring global coastal wetlands, with a focus on
> mangrove ecosystems. It brings together habitat data, biodiversity information, species
> profiles and involved partner organisations to support conservation, education and monitoring.

Four "how to get started" rows:

> - Select a colored tile on the map to get started
> - Use the search box to navigate to a specific location
> - Dots on the map show partner organisation locations
> - Pins on the map show local monitoring locations

Button: **"Get started"**

### 5.2 "Select a tile" prompt — `SelectTilePrompt.tsx`

> **Select a colored tile on the map to get started**
> Use the search box to navigate to a specific location

### 5.3 "What are typologies?" explainer — `FilterControls.tsx:82–155`

Toggle label: **"What are typologies?"**. Expanded content:

> Typologies group coastal wetland grid cells by shared ecological characteristics — including
> habitat condition, species profiles, and cumulative pressures from land, marine, and climate
> sources. All indicator values in MBCAM are interpreted relative to other cells in the same
> typology, not as global absolutes.
>
> **Two scales are available:**
> · Scale of 5 — broad global patterns
> · Scale of 18 — finer regional distinctions
>
> **5-Typology descriptions (Sievers et al. 2021):** _(each with its colour swatch — see §5.5)_
>
> For the 18-typology scale, full typology descriptions are available in the source paper.
>
> _Note: The current typologies were derived from a model encompassing mangroves, saltmarsh, and
> seagrass ecosystems globally. MBCAM currently displays mangrove indicators only. A
> mangrove-specific typology analysis is planned for a future release._
>
> Source: Sievers et al. (2021) _Ecological Indicators_ 131:108141
> https://doi.org/10.1016/j.ecolind.2021.108141

Scale header label: **"Typology Scale"** (tooltip: "Switch between 5 broad typologies or 18
detailed classifications"). Buttons: **"5 Typologies"** / **"18 Typologies"**. Guide header:
**"Typology Guide"**.

### 5.4 Legend text — `TypologyLegend.tsx`

Scale-5 footer note:

> Colours show typology classification, not ecological condition.

Scale-18 (whole legend body):

> 18-typology descriptions are available in the source paper · Sievers et al. (2021)

Map-layer legend rows are icon + short label per active layer (search / partner / local site /
species / mangrove) — `MapLayerLegend.tsx`.

### 5.5 Typology names & descriptions

**Scale of 5** — the only scale with prose in the frontend. `src/data/constants/typology.constants.ts`
(source: Sievers et al. 2021):

1. **The Catchall** — "No strongly distinctive indicators. Cells vary without consistent
   patterns. Found throughout much of the world (34% of cells)."
2. **High Land and Marine Impacts** — "High land and marine-based threats across habitats, with a
   high number of threatened saltmarsh and seagrass species. Predominantly Europe, central-west
   Africa, and Asia."
3. **High Climate Impacts** — "High climate-based impacts (ocean acidification, sea level rise,
   warming) across habitats. Southeast Asia, Madagascar, parts of central Europe and northeast
   USA."
4. **Low Climate Impact Increase, High Species Threat** — "Low rate of increase in climate-based
   impacts, low mangrove above-ground biomass, high proportion of threatened mangrove species.
   West coast USA/Canada and the Caribbean."
5. **The High-Functioning Refuge** — "Low marine and land-based impacts, high mangrove biomass,
   fish and invertebrate density, few threatened species. Australia, Papua New Guinea, and
   Colombia."

> The backend AI-prompt version (`build-typology-framework.ts`) uses slightly different wording
> ("Typology 1 — No strongly distinctive indicators… (34% of cells globally)", etc.) but the
> same five groups.

**Scale of 18** — **no prose descriptions exist anywhere** in either repo. Raw labels are
`Typology_1`…`Typology_18`, shown only as colours + numbers; the UI directs users to the source
paper. (The AI is instructed never to expose these raw labels.)

> The dataset's `label5` names ("Urban / Subtropical / Tropical / Arid / Temperate") differ from
> the five prose names above — see the naming-mismatch note in §1.2.

### 5.6 Menu content — `src/app/content/menuContent.ts`

The top-bar Menu opens: **About**, **Help**, **Methods & Data Sources**, **Contact**. There is
**no "Licence" menu item.** The only licence in either repo is the backend `MIT License`
(`~/Code/glowdex-api/LICENSE`, "Copyright (c) 2026 The Global Wetlands Project - Network"); the
frontend has no LICENSE file.

**About** — title "About MBCAM"

Lead: _"Global status of coastal wetlands to inform conservation and management."_

Body (4 paragraphs):

> Researchers from around the world have been recording data on the world's coastal wetlands for
> decades. For the first time, these global datasets have been brought together into a single
> platform.
>
> The Global Coastal Wetlands Index uses 34 indicators to provide a full picture of the health of
> coastal wetlands worldwide. It quantifies relationships among these indicators to better
> understand ecosystem health and identify areas that may be under threat.
>
> When looking across the globe, similarities emerge between coastal wetlands in different
> regions. Sites sharing similar characteristics are grouped into a typology. This app lets you
> explore outputs at two scales — using either 5 or 18 typologies — to characterise the world's
> coastal wetlands.
>
> Sites within the same typology facing similar pressures could benefit from knowledge exchange.
> This Index can inform globally and regionally coordinated conservation and management.

Then a **"Research Partners"** grid (name + region) of 18 entries: Griffith University
(Australia), University of Tasmania (Australia), University of the Western Cape (South Africa),
Nelson Mandela University (South Africa), Universidad de Costa Rica (Costa Rica), University of
Aveiro (Portugal), Indian Institute of Science Education and Research (India), Katala Foundation
(Philippines), World Academy of Sustainable Development (International), Universidade Eduardo
Mondlane (Mozambique), Western Indian Ocean Mangrove Network (Indian Ocean Region), Bôndy
International (International), University of Warwick (United Kingdom), Universidade do Estado do
Rio de Janeiro (Brazil), Universitas Gadjah Mada (Indonesia), WWF (International), University of
Southern Denmark (Denmark), National Environment Management Council (Tanzania).

**Help** — title "How to Use MBCAM". Sections:

> _(intro)_ MBCAM maps the ecological health of mangrove ecosystems across thousands of
> 100 × 100 km grid cells worldwide. Click any cell on the map to explore its data.
>
> **Search** — Use the search box in the top-left of the map to find a specific location by name,
> country, or region. The map will pan and zoom to your search result automatically.
>
> **Biodiversity Tab** — Your starting point. Highlights threatened species with known
> associations to mangrove ecosystems near your selected region, drawing on observation data from
> the Global Biodiversity Information Facility (GBIF). Each species card shows recent observation
> counts, last recorded sighting, and primary range. Toggle species observation points directly
> onto the map to see where sightings have been recorded. A Partner Organisation widget shows the
> nearest research or conservation partner organisation to your selected cell, with a direct link
> to contact them.
>
> **Analysis Tab** — Gives you a statistical picture of the selected cell. Each indicator is
> explained in plain language so you can understand what is being measured and what the value
> means ecologically. Indicators are shown in context — compared against other mangrove cells in
> the same typology globally — so you can see whether a value is typical, unusually high, or
> unusually low for that type of ecosystem.
>
> **Analysis Assistant** — Answers questions about the selected cell in depth. It draws on the
> ecological data for that location and can explain indicator values, describe environmental
> pressures, and help you interpret what the data means for conservation. You can ask it questions
> in any language supported by the Gemini SDK. To get started, select a cell and try asking:
> "What are the main pressures on this mangrove?" or "How does the biodiversity here compare to
> similar ecosystems?"
>
> **Global Filters** — Adjust the typology scale between 5 and 18 groupings, giving you either a
> broad or more granular classification of the world's mangrove ecosystems.

**Methods & Data Sources** — title "Methods & Data Sources". Renders a **Terminology** list
(`MenuDrawer.tsx:85–104`) then a **References** list (22 citations, `menuContent.ts:28–143`) with
the intro _"Please cite Sievers et al. (in review) Ecological Indicators if you use outputs from
this app."_

Terminology (verbatim, `menuContent.ts:145–171`):

> - **Indicator** — A measure or metric based on verifiable data that conveys information about
>   more than itself. 34 indicators are used in this Index.
> - **Habitat** — The three coastal wetland ecosystem types in this Index: mangroves, saltmarsh,
>   and seagrass.
> - **Typology** — A group of coastal wetland sites that share similar indicator values across
>   habitat extent change, ecological structure and function, and cumulative impacts.
> - **Violin plot** — Shows the distribution of indicator values across all grid cells within the
>   selected typology. Thicker sections indicate more grid cells with that value.
> - **ID** — The unique grid cell ID number. Each of the 2,845 grid cells has a unique identifier.

**Contact** — title "Contact":

> For enquiries about MBCAM or the Global Wetlands project, please contact the team at Griffith
> University.

Placeholder card (`MenuDrawer.tsx:152–158`): **"Contact details coming soon"** — "This section
will be updated with direct contact information for the MBCAM team."

### 5.7 Indicators — labels, units, descriptions, tooltips

The plain-language display labels + science-team notes (acting as tooltips) —
`build-interpreted-context.v1.ts:18–38` (backend):

| CSV key                             | Display label            | Note / tooltip                                                                                                                                 |
| ----------------------------------- | ------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| `mang_fish_dens`                    | Fish density             |                                                                                                                                                |
| `mang_invert_dens`                  | Invertebrate density     |                                                                                                                                                |
| `mang_mean_agb_mg_ha`               | Above-ground biomass     |                                                                                                                                                |
| `mang_mean_SOC`                     | Soil organic carbon      |                                                                                                                                                |
| `mang_spec_score`                   | Species threat score     | higher = worse condition (inverted)                                                                                                            |
| `mang_frag_area_mn_rate`            | Consolidation rate       | "Renamed from 'Fragmentation rate' — a positive value means mean patch area is increasing (habitat consolidating/expanding), not fragmenting." |
| `mang_frag_area_mn`                 | Fragment area            |                                                                                                                                                |
| `mang_mean_age`                     | Mean canopy age          |                                                                                                                                                |
| `pressure_mangrove_climate_current` | Current climate pressure | higher = more stress                                                                                                                           |
| `pressure_mangrove_land_current`    | Current land pressure    |                                                                                                                                                |
| `pressure_mangrove_marine_current`  | Current marine pressure  |                                                                                                                                                |
| `pressure_mangrove_climate_rate`    | Climate pressure trend   | sign matters — negative = declining pressure                                                                                                   |
| `pressure_mangrove_land_rate`       | Land pressure trend      |                                                                                                                                                |
| `pressure_mangrove_marine_rate`     | Marine pressure trend    |                                                                                                                                                |

Full definitions + **units** — `build-indicator-definitions.ts` (backend, verbatim):

> **ECOLOGICAL INDICATORS (mangrove):**
> · **Fish density** — Mean mangrove fish density within each grid cell. Units: year of
> young/year.
> · **Invertebrate density** — Mean mangrove invertebrate density within each grid cell. Units:
> year of young/year.
> · **Above-ground biomass (AGB)** — Mean mangrove above-ground biomass. Units: Mg/ha. Temporal
> range: 2000–2009.
> · **Soil organic carbon (SOC)** — Mean mangrove soil organic carbon. Units: Mg/ha. 2000.
> · **Species threat score** — IUCN vulnerability-weighted species score. Least Concern=0, Near
> Threatened=0.2, Vulnerable=0.4, Endangered=0.6, Critically Endangered=0.8. Higher = higher
> threat.
>
> **CUMULATIVE PRESSURE INDICATORS (mangrove, current):**
> · **Climate pressure** — Cumulative impact of ocean acidification, sea surface temperature, and
> sea level rise. Rescaled 0–1. Baseline year: 2013.
> · **Land pressure** — Cumulative impact of organic chemical pollution, nutrient pollution, and
> direct human influence. Rescaled 0–1. 2013.
> · **Marine pressure** — Cumulative impact of artisanal fishing, commercial fishing, shipping,
> and light pollution. Rescaled 0–1. 2013.
>
> **PRESSURE TREND INDICATORS (rate of change):**
> · **Climate/Land/Marine pressure trend** — Instantaneous rate of change from 2003 to 2013:
> log(pressure_2013 / pressure_2003) / 10. Positive = increasing pressure.

The machine labels shown on the violin rows (`indicator-configs.ts:13–86`, backend) differ
slightly: "Mangrove Fish density", "Mangrove Invertebrate density", "Mangrove AGB per ha",
"Mangrove SOC per ha", "Mangrove Spp threat score", "Mangrove Fragment rate (area)", "Mangrove
Fragment (area)", "Mangrove Mean age", "Mangrove Climate impact rate", "Mangrove Land impact
rate", "Mangrove Marine impact rate", "Mangrove Climate current pressure", "Mangrove Land current
pressure", "Mangrove Marine current pressure".

The **statistical-detail toggle** groups indicators under three headers (`StatisticalDetailToggle.tsx:179–181`):
**Ecological**, **Current pressures**, **Pressure trends**; each row shows a label, plain-language
interpretation, ordinal percentile, and a 3px coloured bar (red/amber/green by percentile).

### 5.8 Empty / loading / error copy

- **Loading (whole app)** — `LoadingState.tsx`: "Loading MBCAM..."
- **Data unavailable (whole app)** — `DataUnavailable.tsx`:
  > **We couldn't load the map data**
  > This looks like a connection problem, not missing data. Please check your connection and try
  > again.
  > _[Retry button]_ · _(small gray line: the raw error message)_
- **Assistant, no cell** — `ChatInterface.tsx:130–136`: "No Location Selected" / "Click a grid
  cell to view contextual analysis."
- **Assistant, context load failure** — `ChatInterface.tsx:166`: "Failed to load context for
  this grid cell. Data may be missing."
- **Violin plot, no data** — "No data available…" ; **no mangrove habitat** — amber empty state
  in `GlobalWetlandsAnalysisWidget.tsx`.
- **Local data, no site** — `LocalWetlandsAnalysisWidget.tsx:398–399`: "Select a monitoring
  location to view local field data." Dropdown placeholders: "Select country...", "Select
  location...".
- **Local data, not analysed** — `LocalWetlandsAnalysisWidget.tsx:484`: "Data still to be
  analysed" (italic).
- **Inactive year slider** — `LocalWetlandsAnalysisWidget.tsx:113`: "Time series coming soon".
- **Species composition** — `SpeciesCompositionTrigger.tsx`: "Crab species composition" /
  "Coming soon".
- **Species spotlight, none** — "No spotlight species documented…" ; stub species tab: "Data
  coming soon".
- **Local card caption** — "Updated {Mon YYYY}".

### 5.9 Assistant disclaimer & expert-guidance text

**Frontend footer under the chat input** — `ChatInterface.tsx:352–361` (verbatim):

> AI-generated interpretation · Always verify with an expert · [**Get expert guidance**]
> _(link → https://globalwetlandsproject.org)_

Header: **"Mangrove Analysis Assistant"** + "Cell ID: {id}". Input placeholder: "Ask a follow-up
question..." (max 500 chars). First-message sources block header: "Sources", defaulting to
"Sievers et al. (2021) Ecological Indicators 131:108141".

**Suggested questions** (feature-flagged `VITE_PUBLIC_FEATURE_AI_SUGGESTIONS`,
`ChatInterface.tsx:20–25`): "What are the main ecological signals here?", "How does this compare
to similar systems?", and — only when local data is present — "What does the local field data
show?".

**Backend — the assistant's actual behavioural guardrails** live in the system instruction
(`src/ai/prompts/system-instruction.ts`) and referral block (`build-referral-context.ts`), not as
a single user-facing disclaimer string. Key user-relevant rules (paraphrased for the designer;
full text in the backend file):

- Never gives management/policy/restoration/conservation recommendations itself — instead states
  what MBCAM covers and refers out.
- All values are interpreted **relative to the typology**, never as global absolutes; never
  references raw cluster/typology labels.
- If no mangrove habitat is recorded, says so and points to
  [globalwetlandsproject.org](https://globalwetlandsproject.org).

**Referral resources** surfaced only for action questions (`build-referral-context.ts:44–73`):

- Restoration/management → **Global Mangrove Alliance** (mangrovealliance.org)
- Species status/threat → **IUCN Red List** (iucnredlist.org)
- The local **MBCAM partner** for the cell's country, if one exists.

> There is **no standalone "disclaimer" paragraph** in the backend beyond these rules; the
> user-visible disclaimer is the one-line frontend footer above.

---

## 6. What the data can show

### 6.1 Grid cell fields

Frontend model (`src/data/types/grid.types.ts`, `src/app/types/app.types.ts`):
`id`, `country`, `iso3`, `lat?`, `lng?` (derived from GeoJSON centroids), `residuals`
(indicator residuals), `cluster5?`, `cluster18?` (typology IDs), `mangroves`/`saltmarsh`/
`seagrass` booleans, `centerCoords?`.

**Displayed in the selection panel** (`SelectionPanel.tsx`): country name (headline), formatted
coordinates, **Tile ID** pill (`id`), **Typology** pill (cluster for the active scale, swatch +
hover description; scale-18 shows a "see Sievers et al. (2021)" note). Not surfaced directly:
`iso3`, `residuals`, `saltmarsh`/`seagrass` (used only to gate widgets), raw booleans.

Per-cell **statistics from the backend** (`src/api/types.ts:60–72`) drive the violin plots and
the download: `key`, `indicator`, `groupingLabel`, `cellValue`, `min`, `q1`, `median`, `q3`,
`max`, `percentile`, `sampledDistribution[]`.

Full API context object (`ai-grid-cell-context.v1.ts`, backend) additionally exposes habitat
areas (ha), change rates, all ecological indicators, and pressure current/rate values per
habitat — most of which the UI does not display.

### 6.2 Local monitoring — sites & observations

**Site** (`local-wetlands.types.ts:53–93`): `id`, `name`, `country`, `coordinates [lng,lat]`,
`partnerId | null`, `availableYears[]`, `observations[]`, `points[]` (each with a `condition`).
Displayed: name, country, partner link (https only), active year, the density chart. Hover
tooltip shows name, country, per-condition badges + latest-year density.

**Observation** (`local-wetlands.types.ts:44–51`): `year`, `siteType` (Reference | Degraded |
Rehabilitated), `species`, `density`, `se`, `samplesN`. Aggregated per condition/year into
`totalDensity`, `combinedSE`, `samplesN`; all three conditions are always shown (zero-filled).
Charted: density per condition (Y = "Crab density (individuals/m²)", ±SE, `n=` annotation). The
per-species breakdown is **not yet charted** ("Crab species composition — Coming soon").

### 6.3 Species spotlight fields

Backend config (`src/api/species.ts:78–97`): `id`, `commonName`, `localName?`, `scientificName`,
`conservationStatus` (IUCN code), `iucnUrl`, `summaryText`, `dataApplicability`, `dataSource`,
`learnMoreUrl`, `mapTipText`, `stub?`, `imageCredit?`, `imageCreditUrl?`, `sourceUrl?`,
`sourceLabel?`, `partnerIds[]`, `regionBounds[]`. Observations response adds `totalObservations`,
`recentObservations`, `lastObserved`, `regionSummary[]`, `observations[]`. Three live species:
**Katala / Philippine Cockatoo** (CR), **Estuary Stingray** (NT), **Fiddler Crab** (LC).

### 6.4 Partner fields

`PartnerResponse` (`src/api/partners.ts:3–13`): `id`, `institution`, `city`, `country`,
`coordinates [lng,lat]`, `lead`, `role`, `websiteUrl`. In the local-data widget only
`institution` + `websiteUrl` are surfaced (https only). The backend registry has **19 partners**
(the About page lists 18). Contact emails are intentionally never stored/exposed.

### 6.5 Downloadable site summary — `buildCellSummary.ts` → `generateCellSummaryPdf.ts`

File: `MBCAM-summary-tile-{id}-{date}.pdf`. Sections in order:

1. **Header** — "MBCAM Site Summary — Tile {tileId}", "Generated {date}".
2. **Location** — Country (+ iso3), Coordinates, Tile ID.
3. **Typology** — "{number} — {name}" + description (scale5) or number + Sievers-2021 note
   (scale18).
4. **Indicators** — table (Indicator | Value | Percentile | Reading within typology), preceded by
   the percentile caveat.
5. **Species recorded for the region** — commonName → "{scientificName} — {status label} (IUCN)".
6. **Local monitoring data** — Site, Partner, most recent year, then a table (Condition | Density
   | Std. error | Samples).
7. **Source** — citation (Sievers et al. 2021) + generation date.

---

## 7. A real example

**No verbatim, fully-generated AI insight tied to a real grid cell exists in either repo.**

Checked: `data/evaluation/gold-set.json` (retrieval/boundary eval questions with expected chunk
IDs — no generated prose, no cell IDs), `compliance-set.json` (empty `[]`), `eval-results.json`
(embedding-retrieval scores only), `src/insight/insight.service.spec.ts` (mock strings only —
e.g. "Generated text response", against a synthetic cell `id: 1001` with a made-up `label18:
'Humid'` that does not exist in the real data), and the AI prompt-builder specs (assert on
prompt fragments, not full insights). A repo-wide search for characteristic generated phrasing
("for this typology", "relative to similar systems", "no mangrove habitat is recorded") in
JSON/Markdown returned nothing.

**To include a real example, one must be generated live against the running API** for a chosen
cell.

---

### Appendix — key file paths

- Colours/tokens: `src/styles/globals.css` (`@theme`), `src/constants/map-colours.ts`,
  `src/data/constants/localWetlands.constants.ts`, `src/data/constants/speciesPalette.ts`
- Typologies: `src/data/constants/typology.constants.ts`, `src/data/transforms/deriveTypologies.ts`,
  backend `src/ai/prompt-builders/build-typology-framework.ts`
- Layout/shell: `src/app/components/AppLayout.tsx`, `SidePanel.tsx`, `MobileTabNavigation.tsx`,
  `TopBar.tsx`
- Content: `src/app/content/menuContent.ts`, `src/app/components/WelcomeModal.tsx`,
  `src/features/widgets/components/FilterControls.tsx`,
  `src/features/widgets/components/ChatInterface.tsx`
- Indicators/assistant (backend): `src/statistics/indicator-configs.ts`,
  `src/ai/prompt-builders/build-indicator-definitions.ts`,
  `src/ai/prompt-builders/build-interpreted-context.v1.ts`, `src/ai/prompts/system-instruction.ts`,
  `src/ai/prompt-builders/build-referral-context.ts`
- Data fields: `src/data/types/*.ts`, `src/api/types.ts`,
  `src/features/widgets/utils/buildCellSummary.ts`
  </content>
  </invoke>
