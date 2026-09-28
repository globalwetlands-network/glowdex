import { CrabIcon } from 'glowdex';

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
    <CrabIcon size={24} />
    <CrabIcon size={32} />
    <CrabIcon size={48} />
  </div>
);
