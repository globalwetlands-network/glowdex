import type { FeatureCollection, Feature, MultiPolygon } from 'geojson';

export interface GridFeatureProperties {
  ID: number;
}

export type GridFeature = Feature<MultiPolygon, GridFeatureProperties>;
export type GridGeoJSON = FeatureCollection<MultiPolygon, GridFeatureProperties>;
