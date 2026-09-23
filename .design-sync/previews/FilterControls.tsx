import { FilterControls } from 'glowdex';

const typologies = {
  scale5: {
    1: {
      id: 1,
      name: 'Cluster 1',
      color: '#9ca3af',
      fillColor: '#9ca3af80',
      clusterNumber: 1,
    },
    2: {
      id: 2,
      name: 'Cluster 2',
      color: '#ef4444',
      fillColor: '#ef444480',
      clusterNumber: 2,
    },
    3: {
      id: 3,
      name: 'Cluster 3',
      color: '#f59e0b',
      fillColor: '#f59e0b80',
      clusterNumber: 3,
    },
    4: {
      id: 4,
      name: 'Cluster 4',
      color: '#1d9e75',
      fillColor: '#1d9e7580',
      clusterNumber: 4,
    },
    5: {
      id: 5,
      name: 'Cluster 5',
      color: '#0a5c47',
      fillColor: '#0a5c4780',
      clusterNumber: 5,
    },
  },
  scale18: {},
};

const filterState = {
  habitats: { mangroves: true, saltmarsh: false, seagrass: false },
  typologyScale: 'scale5' as const,
  quantile: 0.5,
};

export const Default = () => (
  <div style={{ maxWidth: 340 }}>
    <FilterControls
      filterState={filterState}
      onFilterChange={() => {}}
      typologies={typologies}
      activeClusterId={5}
    />
  </div>
);
