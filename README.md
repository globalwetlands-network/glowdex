
# GLOWdex – Global Coastal Wetlands Index App


## 1. Project Overview

GLOWdex is an interactive scientific interpretation tool for exploring the **Global Coastal Wetlands Index**.

It allows users to:

- Explore global grid-based coastal wetland data
- View ecological typologies (5 or 18 groups)
- Compare grid cells within typologies
- Interpret indicator distributions visually

### Scientific Context

The Global Coastal Wetlands Index integrates 34 ecological indicators to assess the status of coastal wetlands worldwide.

Sites with similar ecological characteristics are grouped into **typologies**, enabling:

- Identification of shared pressures
- Comparison across regions
- Knowledge exchange between similar systems
- Coordinated conservation planning

This tool is strictly:

- A visualization and interpretation interface
- Not a predictive or decision-making engine

### Data Sources

This web application integrates datasets from:

- Sievers et al. (in review)
- Bunting et al. 2018
- Hamilton and Casey 2016
- Simard et al. 2019
- Sanderman et al.
- Thomas et al. 2017
- UNEP-WCMC and Short 2021
- Dunic et al. 2021
- Waycott et al. 2009
- Halpern et al. 2019
- IUCN Red List (2020-04)
- Additional global data products

If using outputs from this application, please cite:

**Sievers et al. (in review), Ecological Indicators**

---

## 2. Architecture Overview

The application follows a **Thin Provider architecture**.

Providers own state only.  
Derived logic lives in consumers.

| Provider            | Owns                                      | Does NOT Own                         |
|---------------------|--------------------------------------------|--------------------------------------|
| DataProvider        | Raw datasets + loading state               | Filtering or distributions           |
| FilterProvider      | Filter state (habitats, scale, quantile)   | Filtering logic                      |
| SelectionProvider   | Selected grid cell state                   | Enrichment logic                     |
| AppShell            | Derived computation orchestration          | Raw state ownership                  |

### Conceptual Diagram

```
[DataProvider] (Raw Data)
      │
      ▼
[FilterProvider] (Filter Criteria)
      │
      ▼
[SelectionProvider] (User Interaction)
      │
      ▼
[AppShell] (The "Brain")
   ├── Consumes Contexts
   ├── Runs heavy logic (useFilteredGridCells, useIndicatorDistributions)
   │
   ├── [Map Component] (Receives filtered data as props)
   └── [SidePanel] (Receives calculated distributions as props)
```


Heavy computations are intentionally kept out of context to avoid unnecessary global re-renders.


## 3. How the App Works (User-Level)

1. Select typology scale (5 or 18 groups).
2. Select habitat types (mangrove, saltmarsh, seagrass).
3. Click a grid cell (100 × 100 km resolution).
4. View typology characteristics and indicator distributions.

### Violin Plot Interpretation

- Displays the distribution of indicators within a typology.
- The diamond represents the selected grid cell.
- The quantile slider controls inclusion threshold:
  - Higher quantile → fewer indicators displayed
  - Lower quantile → more indicators displayed
- If no indicators appear at high thresholds, the typology lacks strong defining characteristics at that level.

---

## 4. Project Structure
```
src/
│
├── app/                 # Application shell & layout
│   ├── App.tsx
│   ├── AppShell.tsx
│   ├── AppProviders.tsx
│   └── components/
│
├── context/             # Thin state providers
│   ├── DataProvider.tsx
│   ├── FilterProvider.tsx
│   └── SelectionProvider.tsx
│
├── features/            # Feature modules
│   ├── map/
│   ├── widgets/
│   └── …
│
├── data/                # Data loaders, parsing, types
│   ├── hooks/
│   ├── loaders/
│   └── types/
│
├── utils/               # Pure utility functions
│
└── shared/              # Shared UI components

public/
└── data/                # Static CSV & GeoJSON assets
```

### Design Principles

- No raw CSV data bundled into JS.
- Derived datasets are computed in hooks.
- Providers remain thin.
- Feature modules are self-contained.

---

## 5. Data Flow

1. `DataProvider` fetches CSV and GeoJSON files from `/public/data`.
2. Raw data is exposed via context.
3. `AppShell` consumes context and computes:
   - Filtered grid cells
   - Indicator distributions
4. Map and SidePanel render based on derived results.

Data flows downward.  
Derived logic remains local.

---

## 6. State Management Guidelines

### Context Should Contain

- Raw datasets
- Global filter state
- Global selection state

### Context Must Not Contain

- Derived filtered arrays
- Distribution calculations
- Heavy computations

### Local State Examples

- Mobile tab selection
- Form inputs
- Animation state
- Temporary UI state

---

## 7. Development Setup

### Prerequisites

- Node.js 18+
- npm

### Install Dependencies

```bash
npm install
```

### Run Development Server

```bash
npm run dev
```

Default: http://localhost:5173


### Build for Production

```bash
npm run build
```

### Environment & Mapbox Setup

This project uses Mapbox GL JS and requires a valid access token.

1.  **Get a Token**: Create an account at [Mapbox](https://www.mapbox.com/) and generate a public access token.
    -   *Security Note: We strongly recommend restricting this token to your application's URL/origin in the Mapbox dashboard to prevent misuse.*


2.  **Local Setup**: Create a `.env.local` file in the root directory:
    ```bash
    VITE_MAPBOX_TOKEN=pk.your_token_here
    ```
    
3.  **CI/CD (GitHub Actions)**:
    -   Go to **Settings > Secrets and variables > Actions**.
    -   Add a new repository secret named `VITE_MAPBOX_TOKEN`.
    -   Paste your Mapbox token as the value.
    -   *Note: The build process will fail without this token.*

---

## 8. Contributing & Feature Development

### New Features

Create a new directory in `src/features/` with its own:

- `components/`
- `hooks/`
- `types/`

### Context Usage

Always use provided hooks:

- `useData()`
- `useFilter()`
- `useSelection()`

Avoid `useContext(Context)` directly.

### Performance

Memoize heavy hooks with `useMemo`.

Avoid unnecessary re-renders.

### Type Safety

Define types strictly in `types.ts`.

Avoid `any`.

---

## 9. License

[Insert License Here]

---

## 10. Citation

If using outputs from this application, please cite:

**Sievers et al. (in review), Ecological Indicators**

---

*Maintained by the GLOWdex Engineering Team*
