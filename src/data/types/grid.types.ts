export interface GridItemRaw {
  ID: string;
  TERRITORY1: string;
  ISO_TER1: string;
  SOVEREIGN1: string;
  ISO_SOV1: string;
  centroid_X_moll: string; // Mollweide projection X centroid
  centroid_Y_moll: string; // Mollweide projection Y centroid
  [key: string]: string;
}

export interface GridItem {
  id: number;
  country: string;
  iso3: string;
  /* 
  NOTE: Lat/Lng are NOT in the CSV. They are derived properties (e.g. from GeoJSON centroids).
  Marked optional to reflect they are not available immediately from this loader.
  */
  lat?: number;
  lng?: number;
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
