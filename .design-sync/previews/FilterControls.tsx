import { FilterControls } from 'glowdex';
import { TYPOLOGIES } from './_fixtures';

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
      typologies={TYPOLOGIES}
      activeClusterId={5}
    />
  </div>
);
