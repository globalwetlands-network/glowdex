import { TileCapsule } from 'glowdex';

const typologies = {
  scale5: {
    1: {
      id: 1,
      name: 'Cluster 1',
      color: '#9ca3af',
      fillColor: '#9ca3af80',
      clusterNumber: 1,
    },
    5: {
      id: 5,
      name: 'Cluster 5',
      color: '#0a5c47',
      fillColor: '#0a5c4780',
      clusterNumber: 5,
    },
  },
  scale18: {
    12: {
      id: 12,
      name: 'Cluster 12',
      color: '#6366f1',
      fillColor: '#6366f180',
      clusterNumber: 12,
    },
  },
};

const cell = {
  id: 1234,
  country: 'Australia',
  iso3: 'AUS',
  lat: -12.46,
  lng: 130.84,
  cluster5: 5,
  cluster18: 12,
  residuals: {},
  mangroves: true,
  saltmarsh: false,
  seagrass: true,
  centerCoords: { latitude: -12.46, longitude: 130.84 },
};

// `source` only tags analytics events; the visual axis is the typology scale.
export const Scale5 = () => (
  <TileCapsule
    selectedCell={cell}
    typologies={typologies}
    currentScale="scale5"
    onNavigateToAnalysis={() => {}}
    source="partner"
  />
);

export const Scale18 = () => (
  <TileCapsule
    selectedCell={cell}
    typologies={typologies}
    currentScale="scale18"
    onNavigateToAnalysis={() => {}}
    source="species"
  />
);
