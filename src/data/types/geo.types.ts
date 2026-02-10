import type { FeatureCollection, Feature, MultiPolygon } from 'geojson';

export interface GridFeatureProperties {
  ID: number;
  cluster?: number; // Added during map rendering
}

export type GridFeature = Feature<MultiPolygon, GridFeatureProperties>;
export type GridGeoJSON = FeatureCollection<MultiPolygon, GridFeatureProperties>;
