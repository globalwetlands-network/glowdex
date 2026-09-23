import { LocalSiteMarkerIcon } from 'glowdex';

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
    <LocalSiteMarkerIcon size={24} />
    <LocalSiteMarkerIcon size={32} />
    <LocalSiteMarkerIcon size={48} />
  </div>
);
