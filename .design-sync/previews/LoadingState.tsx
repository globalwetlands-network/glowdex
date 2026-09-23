import { LoadingState } from 'glowdex';

// Full-screen state (absolute inset-0): give it a positioned frame to fill.
export const Default = () => (
  <div style={{ position: 'relative', height: 320 }}>
    <LoadingState />
  </div>
);
