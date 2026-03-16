import type { FeatureCollection, Feature, MultiPolygon } from 'geojson';

export interface GridFeatureProperties {
  ID: number;
  cluster?: number; // Added during map rendering
  isFiltered?: boolean; // Whether it matches the active dataset filters
}

export type GridFeature = Feature<MultiPolygon, GridFeatureProperties>;
export type GridGeoJSON = FeatureCollection<
  MultiPolygon,
  GridFeatureProperties
>;
