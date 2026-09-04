/**
 * Feature flags for behaviour that is built but not yet enabled.
 */

/**
 * Whether the version-skew UI degradation is active (GLO-177).
 *
 * Skew *detection* always runs (see useDatasetSkew), but the user-facing
 * degradation — showing the assistant a "catching up, data just updated" state
 * and suppressing insight/statistics calls until versions agree — is gated here
 * because its exact behaviour and copy need product sign-off before shipping.
 *
 * Flip to `true` once signed off. This is a reviewed one-line change rather than
 * a `VITE_` env var to avoid the build-time env plumbing.
 */
export const DATASET_SKEW_UI_ENABLED = false;
