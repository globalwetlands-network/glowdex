import { PartnerMarkerIcon } from 'glowdex';

export const Default = () => (
  <div style={{ display: 'flex', gap: 16, alignItems: 'center', padding: 8 }}>
    <PartnerMarkerIcon size={32} />
    <PartnerMarkerIcon size={40} isNearest />
  </div>
);
