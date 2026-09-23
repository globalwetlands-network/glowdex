import { DataUnavailable } from 'glowdex';

// Full-screen state (absolute inset-0): give it a positioned frame to fill.
export const Default = () => (
  <div style={{ position: 'relative', height: 380 }}>
    <DataUnavailable onRetry={() => {}} />
  </div>
);

export const WithErrorDetail = () => (
  <div style={{ position: 'relative', height: 400 }}>
    <DataUnavailable
      onRetry={() => {}}
      error={new Error('Failed to fetch dataset manifest (timeout after 15s)')}
    />
  </div>
);
