# glowdex — Architecture

Deep-dive companion to [`CLAUDE.md`](../CLAUDE.md). Start there for the fast orientation;
come here for how data flows, how the map renders, and how the app is wired.

---

## 1. The big picture

`glowdex` is a React 19 + Vite single-page app served from GitHub Pages. It renders an
interactive Mapbox map of mangrove **grid cells** colored by ecological **typology**, and lets
the user select a cell to see statistics, species, partners, and an AI-generated insight.

```
Dataset (CSV/GeoJSON in src/data) ─┐
                                   ├─▶ React state (selected cell, scale, filters)
Backend API (glowdex-api) ─────────┘        │
                                            ▼
        Map (react-map-gl layers)  +  Widgets (panels, charts, chat)
```

Two data sources feed the UI:

- **Static dataset** — grid geometry, typology clusters, and per-cell attributes loaded and
  transformed under `src/data/` (loaders → transforms → typed `RichGridCell` / `GridGeoJSON`).
- **Backend API** — statistics, species, partners, and AI insight fetched from `glowdex-api`
  through `src/api/`.

## Layout & composition

`src/app/` is the composition root. `AppProviders.tsx` wraps the tree (React Query client,
PostHog, context). `App.tsx` + `AppLayout.tsx` lay out the map alongside the side/mobile
panels. App-level hooks (`useSelectedCell`, `useTypologyScale`, `useMobilePanel`, …) hold the
top-level interaction state and pass it down to the map and widgets as props.

---

## 2. The map

The map is built declaratively with **react-map-gl** (Mapbox GL under the hood):

- **`features/map/components/Map.tsx`** — the map shell (viewport, base style, sources).
- **`features/map/components/GridLayer.tsx`** — the grid cells as a `<Source>` + fill/line
  `<Layer>`. Coloring and highlighting are **Mapbox expressions** computed in `useMemo`:
  - a `['match', ['get', 'cluster'], …]` expression maps each typology cluster ID to its fill color;
  - an `['in', 'ID', …]` / `['==', 'ID', -1]` filter drives hover + selection highlighting.
- **`features/map/hooks/`** — `useMapInteraction` (hover/click → selected cell) and
  `useMapViewState` (pan/zoom state).

Because layers are React components driven by props, there's no imperative map mutation — to
change what's drawn, change the data/props feeding the expressions. Adding a new layer means
adding another `<Source>`/`<Layer>` pair, not touching a central map-setup function.

The typology scale toggles between `scale5` (5 clusters) and `scale18` (18 clusters); the
selected scale flows from app state into the color expression.

---

## 3. Widgets

Widgets are the analysis surfaces shown for the selected cell. Each is a self-contained
feature component that receives data via props and owns its own hooks:

| Widget                         | Location                                                               | Purpose                                           |
| ------------------------------ | ---------------------------------------------------------------------- | ------------------------------------------------- |
| Selection panel                | `features/widgets/components/SelectionPanel.tsx`                       | Cell identity, typology, coordinates              |
| Filter controls                | `features/widgets/components/FilterControls.tsx`                       | Filter grid cells by indicator                    |
| Violin plot                    | `features/widgets/components/ViolinPlot.tsx`                           | Plotly distribution of an indicator               |
| Chat / AI insights             | `features/widgets/components/ChatInterface.tsx`, `ChartAIInsights.tsx` | AI assistant conversation                         |
| Species / Partner / Local data | `components/widgets/*`                                                 | Species spotlight, partner links, local site data |

Supporting hooks live in `features/widgets/hooks/` (`useAskMutation`, `useChatMessages`,
`useFilteredGridCells`, `useIndicatorDistributions`, …). Widgets are assembled into the
side/mobile panels in `src/app/components/` (`SidePanel`, `BiodiversityPanel`,
`AnalysisAssistantWidget`, etc.).

---

## 4. Server state & the API layer

All server communication goes through `src/api/`, and all server state is managed by
**TanStack Query** — components never call `fetch` or `apiClient` directly.

```
component ──▶ useQuery/useMutation hook ──▶ fetchX() in src/api/*.ts ──▶ apiClient<T>() ──▶ backend
             (src/api/hooks, features/*/hooks)                          (src/api/client.ts)
```

- **`apiClient<T>(endpoint, options)`** (`src/api/client.ts`) — thin `fetch` wrapper: prefixes
  `API_BASE_URL`, injects the `x-api-key` header, adds a JSON content-type on bodies, enforces
  a timeout via `AbortController`, and throws a typed `ApiError` on failure.
- **Per-resource modules** — `insight.ts`, `statistics.ts`, `species.ts`, `partners.ts` expose
  typed `fetchX` functions. `insight.ts` also forwards the PostHog `distinctId`/`sessionId` so
  the backend's `$ai_generation` events attribute to the same person/session.
- **Query hooks** — `src/api/hooks/` and feature `hooks/` wrap the fetchers with `useQuery`
  (reads, with sensible `staleTime`) or `useMutation` (the AI ask flow), giving components
  loading/error/data state for free.
- **Config** — `src/api/config.ts` reads `VITE_API_BASE_URL` (default `/api`, proxied to
  `localhost:8080` in dev), `VITE_API_TIMEOUT_MS`, and `VITE_API_KEY`.

---

## 5. Configuration & deployment

- **Build/deploy:** `npm run build` (`tsc -b && vite build`) → `dist/`, published to GitHub
  Pages by `.github/workflows/deploy-pages.yml` on push to `main`/`develop`. The Vite `base` is
  `/glowdex/` in production.
- **Env vars are build-time only.** All `VITE_` vars are read at build and baked into the
  bundle; there is no runtime config. GitHub Actions injects them from repo **Secrets**
  (sensitive — Mapbox/API/PostHog keys) and **Variables** (config — hosts, feature flags) in the
  `env:` blocks of both `deploy-pages.yml` and `ci.yml`. See CLAUDE.md → _Adding a new
  environment variable_ for the full checklist.
- **Feature flags:** `VITE_PUBLIC_CONFERENCE_MODE`, `VITE_PUBLIC_FEATURE_AI_SUGGESTIONS`, and
  `VITE_GMW_LAYER_ENABLED` gate optional UI/behavior.
- **Analytics:** PostHog (`posthog-js`) initialised in the app providers; disabled unless
  `VITE_PUBLIC_POSTHOG_ENABLED=true`.

`.env.example` is the authoritative list of every variable.
