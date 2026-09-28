import { MapLayerLegend } from 'glowdex';

// Map overlay (absolute bottom-8 left-3): render it inside a map-sized frame.
const mapFrame = {
  position: 'relative' as const,
  height: 220,
  maxWidth: 360,
  borderRadius: 8,
  background: 'linear-gradient(135deg, #cfe8e0 0%, #a7d3c4 55%, #8cc3dd 100%)',
  overflow: 'hidden' as const,
};

export const AllLayers = () => (
  <div style={mapFrame}>
    <MapLayerLegend
      partnerLayerEnabled
      speciesLayerEnabled
      mangroveLayerEnabled
      localSiteLayerEnabled
      localSitesCount={12}
      searchMarkerVisible
      activeSpeciesName="Fiddler crab"
    />
  </div>
);

export const PartnersOnly = () => (
  <div style={mapFrame}>
    <MapLayerLegend
      partnerLayerEnabled
      speciesLayerEnabled={false}
      mangroveLayerEnabled={false}
      localSiteLayerEnabled={false}
      localSitesCount={0}
      searchMarkerVisible={false}
    />
  </div>
);
