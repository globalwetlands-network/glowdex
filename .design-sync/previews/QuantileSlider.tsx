import { QuantileSlider } from 'glowdex';

// Slider range is 0–0.5 (QUANTILE_CONFIG), default 0.25.
export const Default = () => (
  <div style={{ maxWidth: 320 }}>
    <QuantileSlider value={0.25} onChange={() => {}} />
  </div>
);

export const Median = () => (
  <div style={{ maxWidth: 320 }}>
    <QuantileSlider value={0.5} onChange={() => {}} />
  </div>
);
