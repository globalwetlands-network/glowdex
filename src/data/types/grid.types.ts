// Basic Grid Item (from CSV)
export interface GridItemRaw {
  ID: string;
  lat: string;
  lng: string;
  country: string;
  iso3: string;
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
