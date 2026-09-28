import { SpeciesMarkerIcon } from 'glowdex';

export const Sizes = () => (
  <div
    style={{
      display: 'flex',
      gap: 16,
      alignItems: 'center',
      color: '#0a5c47',
      padding: 8,
    }}
  >
    <SpeciesMarkerIcon size={24} />
    <SpeciesMarkerIcon size={32} />
    <SpeciesMarkerIcon size={48} />
  </div>
);
