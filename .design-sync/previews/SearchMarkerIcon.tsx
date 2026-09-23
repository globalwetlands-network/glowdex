import { SearchMarkerIcon } from 'glowdex';

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
    <SearchMarkerIcon size={24} />
    <SearchMarkerIcon size={32} />
    <SearchMarkerIcon size={48} />
  </div>
);
