# CLAUDE.md — glowdex

Frontend for **GLOWdex / MBCAM** (Mangrove Biodiversity & Condition Action Map): an
interactive Mapbox map of mangrove grid cells with typology coloring, statistical analysis
widgets, and an AI insight assistant. Talks to the `glowdex-api` backend.

For deeper internals (data flow, map rendering, state), see
[`docs/architecture.md`](docs/architecture.md). Read this file first; reach for the
architecture doc when you need detail.

## Stack

- **React 19** + **TypeScript** (strict), built with **Vite**. Deployed to **GitHub Pages**.
- **Tailwind CSS v4** (via `@tailwindcss/postcss`) — utility-first, this is the ONLY styling mechanism.
- **Mapbox GL** via **react-map-gl v7** for the map; **@turf/\*** for geo math.
- **@tanstack/react-query** for all server state; **plotly.js** / `react-plotly.js` for charts.
- **papaparse** for CSV data, **react-markdown** for AI responses, **posthog-js** for analytics.
- **Vitest** + **Testing Library** for tests; **ESLint + Prettier + Husky**.

## Path alias

`@` → `src/` (configured in `vite.config.ts` and `tsconfig.app.json`). Always import as
`@/features/...`, `@/api/...`, `@/data/...` — never long relative `../../..` chains.

## Project structure

| Path                                                                                      | Responsibility                                                                                                               |
| ----------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `src/app/`                                                                                | Composition root: `App.tsx`, `AppProviders.tsx`, top-level layout, panels, and app-level hooks                               |
| `src/features/map/`                                                                       | Map shell (`Map.tsx`), layers (`GridLayer.tsx`), map hooks (interaction, view state)                                         |
| `src/features/widgets/`                                                                   | Analysis widgets (selection panel, filters, violin plot, chat/AI insights) + their hooks/types/config                        |
| `src/features/analytics/`                                                                 | PostHog wiring                                                                                                               |
| `src/api/`                                                                                | Backend access: `client.ts` (fetch wrapper), per-resource modules, `hooks/` (React Query), `config.ts`, `types.ts`           |
| `src/data/`                                                                               | Dataset loading, transforms, and types (grid cells, typologies, GeoJSON)                                                     |
| `src/components/`                                                                         | Shared / legacy UI: `widgets/` (SpeciesSpotlight, Partner, LocalData), `icons/`, `map/markers`, `shared/`, `TypologyLegend/` |
| `src/context/`, `src/hooks/`, `src/utils/`, `src/constants/`, `src/types/`, `src/styles/` | Cross-cutting helpers                                                                                                        |

Newer code lives under `src/features/` and `src/app/`; `src/components/` holds shared and
some legacy widgets still in use. Prefer `features/` for new feature work.

## Conventions & patterns

- **Styling — Tailwind only.** Style with Tailwind utility classes in `className`. No CSS
  modules, styled-components, or inline `style` objects — except for genuinely dynamic values
  that can't be expressed as utilities (e.g. a typology fill color computed at runtime).
  Global CSS lives in `src/styles/`. Brand colors are the custom tokens `glowdex-green`
  (`#0a5c47`) and `glowdex-teal` (`#1d9e75`), defined in `tailwind.config.js`. **Gotcha:** any
  class name built dynamically (e.g. `` `bg-${color}` ``) is purged at build unless added to
  the `safelist` in `tailwind.config.js` — prefer static, fully-spelled class names.
- **API calls — never `fetch` directly.** Call `apiClient<T>(endpoint, options)` from
  `@/api/client` inside a per-resource function in `src/api/*.ts` (e.g. `fetchPartners`,
  `fetchInsight`). `apiClient` injects the `x-api-key` header and base URL, applies a timeout,
  and throws a typed `ApiError`. Then wrap that function in a **TanStack Query** hook
  (`useQuery`/`useMutation`) under `src/api/hooks/` or a feature `hooks/` folder. Components
  consume the hook, not `apiClient`. See `src/api/hooks/usePartners.ts`.
- **Map layers — declarative `<Source>` + `<Layer>`.** Add map layers as react-map-gl
  `<Source>`/`<Layer>` components (see `features/map/components/GridLayer.tsx`). Drive
  coloring/filtering with **Mapbox expressions** built in `useMemo` from data — e.g. a `match`
  expression mapping cluster IDs → fill colors, an `in`/`==` filter for hover/selection
  highlight. Don't imperatively mutate the map; keep layer state in React props.
- **Widgets — self-contained feature components.** A widget lives in
  `features/widgets/components/`, pairs with hooks in `features/widgets/hooks/` and types in
  `features/widgets/types/`, receives the selected cell / data via props, and renders analysis
  (Plotly charts, chat). Widgets are composed into panels in `src/app/components/`.
- **Components.** Function components with **named exports** (`export function Foo`), a
  `FooProps` interface declared above the component, `@/` imports, `lucide-react` for icons.
  Colocate tests as `*.spec.tsx` next to the component (Vitest + Testing Library).

## Key commands

```bash
npm run dev          # Vite dev server (proxies /api → http://localhost:8080)
npm run build        # tsc -b && vite build → dist/
npm run preview      # preview the production build
npm run lint         # eslint (npm run lint:fix to auto-fix)
npm run format       # prettier --write (format:check to verify)
npm run type-check   # tsc --noEmit
npm run test         # vitest run (test:watch, test:ui for interactive)
```

## Environment variables

All frontend vars are prefixed **`VITE_`** and defined in `.env.example` (the source of
truth). Copy it to `.env` for local dev. **⚠️ `VITE_` vars are bundled into client-side JS and
visible in the browser** — never put a real secret in one; `VITE_API_KEY` only deters casual
abuse. In dev, `VITE_API_BASE_URL=/api` is proxied to the backend by Vite.

### Adding a new environment variable (do all four, or prod breaks)

Env vars are injected at **build time** from GitHub Actions — they are NOT read at runtime.
When you add a `VITE_` var:

1. Add it to **`.env.example`** (documented default).
2. Read it via `import.meta.env.VITE_FOO` (centralize in `src/api/config.ts` or a constants file).
3. Add it to the **GitHub Actions** env blocks in **both** `.github/workflows/deploy-pages.yml`
   **and** `.github/workflows/ci.yml` — as `${{ secrets.VITE_FOO }}` for sensitive values or
   `${{ vars.VITE_FOO }}` for non-sensitive config.
4. Create the secret/variable in the repo: **Settings → Secrets and variables → Actions**
   (Secrets for tokens/keys, Variables for config like hosts and feature flags).

Miss step 3 or 4 and the build ships with the var empty/undefined.

## Claude Code skills

Repo skills live in `.claude/skills/`. Three are available: **issue-spec** (draft a Linear
issue from a rough idea), **pr-review** (check a diff against a Linear issue's Definition
of Done), and **ship-pr** (review a pushed feature branch, open a PR against `develop` with the
template filled in, and request a Copilot review). Type `/` in a Claude Code session to see and
run them.

## Git / branch naming

- Branch from Linear issues: `feature/glo-<number>-<kebab-slug>` (or `chore/<slug>`).
- PRs target `develop` (though `main` remains the repo's default branch). Fill out
  `.github/pull_request_template.md`.
- **Never run git commit/push here** — the maintainer commits and pushes manually.
