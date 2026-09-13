/**
 * Shape of the canonical data store's root `manifest.json` (GLO-174), mirrored
 * from the backend's `DatasetManifest`. `path` is the only field a client needs
 * to locate the active bundle; the rest are for binding/display (GLO-177).
 */
export interface Manifest {
  dataset_version: string;
  /** Bundle prefix relative to the store root, e.g. `datasets/2026.09.0/`. */
  path: string;
  schema_version?: string;
  typology_scheme?: string;
  nclust?: number;
  habitat_scope?: string;
  built?: string;
}
