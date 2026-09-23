// Curated design-system entry for /design-sync.
// Re-exports only the provider-free, presentational components of GLOWdex so the
// claude.ai/design bundle (window.Glowdex) is a clean UI kit — not the whole app.
// Live-data widgets (chat, violin plots, local-data charts, map layers) are
// intentionally excluded; static screenshots cover those better than broken previews.

// General UI
export { CollapsibleSection } from '@/app/components/CollapsibleSection';
export { DataUnavailable } from '@/app/components/DataUnavailable';
export { LoadingState } from '@/app/components/LoadingState';
export { QuantileSlider } from '@/app/components/QuantileSlider';
export { SelectTilePrompt } from '@/app/components/SelectTilePrompt';
export { MobileTabNavigation } from '@/app/components/MobileTabNavigation';
export { MenuDrawer } from '@/app/components/MenuDrawer';
export { WelcomeModal } from '@/app/components/WelcomeModal';
export { TileCapsule } from '@/components/shared/TileCapsule';

// Side panel (presentational pieces the side-panel redesign will rework)
export { SelectionPanel } from '@/features/widgets/components/SelectionPanel';
export { StatisticalDetailToggle } from '@/features/widgets/components/StatisticalDetailToggle';
export { FilterControls } from '@/features/widgets/components/FilterControls';
export { DownloadSummaryButton } from '@/features/widgets/components/DownloadSummaryButton';

// Map UI (presentational overlays / legends)
export { TypologyLegend } from '@/components/TypologyLegend/TypologyLegend';
export { MapLayerLegend } from '@/features/map/components/MapLayerLegend';
export { default as MapTooltip } from '@/features/map/components/MapTooltip';

// Icons
export { CrabIcon } from '@/components/icons/CrabIcon';
export {
  MonitoringLocationIcon,
  TileMarkerIcon,
} from '@/components/icons/MapMarkers';
export { LocalSiteMarkerIcon } from '@/components/map/markers/LocalSiteMarkerIcon';
export { MangroveExtentIcon } from '@/components/map/markers/MangroveExtentIcon';
export { PartnerMarkerIcon } from '@/components/map/markers/PartnerMarkerIcon';
export { SearchMarkerIcon } from '@/components/map/markers/SearchMarkerIcon';
export { SpeciesMarkerIcon } from '@/components/map/markers/SpeciesMarkerIcon';
