// Basic Grid Item (from CSV)
export interface GridItemRaw {
  ID: string;
  lat: string; // Loader might rely on these passing through if parser is loose, but CSV uses specific columns?
  // Checking CSV header: "ID","TERRITORY1","ISO_TER1",... "centroid_X_moll","centroid_Y_moll"
  // Wait, I strictly see "centroid_Y_moll" etc. Let me double check if "lat" / "lng" exist in CSV.
  // The CSV view showed: "ID","TERRITORY1","ISO_TER1","SOVEREIGN1","ISO_SOV1","centroid_X_moll","centroid_Y_moll"
  // I DO NOT see "lat" or "lng" in the first line of CSV I viewed!
  // I need to check where lat/lng come from. Maybe they are NOT in grid-items.csv?
  // Ah, the loader `loadGridItems.ts` does: `lat: parseFloat(row.lat)`.
  // If `lat` is not in CSV, this is also broken?
  // Let me re-read just the header of grid-items.csv very carefully.
  TERRITORY1: string;
  ISO_TER1: string;
  SOVEREIGN1: string;
  [key: string]: string; // Allow loose access for now to avoid breaking if other cols used?
}

export interface GridItem {
  id: number;
  lat: number;
  lng: number;
  country: string;
  iso3: string;
}

// Residuals
export interface ResidualsRaw {
  ID: string;
  [key: string]: string; // Dynamic residuals
}

export interface Residuals {
  id: number;
  values: Record<string, number>;
}

// Rich Grid Cell (Joined Data)
export interface RichGridCell extends GridItem {
  residuals: Record<string, number>; // Always defined, empty object if missing
  cluster5?: number; // typology ID in scale 5
  cluster18?: number; // typology ID in scale 18
  mangroves: boolean;
  saltmarsh: boolean;
  seagrass: boolean;

}
