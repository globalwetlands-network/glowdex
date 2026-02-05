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

export interface ResidualsRaw {
  ID: string;
  [key: string]: string; // Dynamic residuals
}

export interface Residuals {
  id: number;
  values: Record<string, number>;
}
