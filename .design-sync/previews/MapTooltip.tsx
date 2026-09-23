import { MapTooltip } from 'glowdex';

const cell = {
  id: 1234,
  country: 'Australia',
  iso3: 'AUS',
  lat: -12.46,
  lng: 130.84,
  cluster5: 5,
  cluster18: 12,
  residuals: {},
  mangroves: true,
  saltmarsh: false,
  seagrass: true,
};

export const Default = () => (
  <div style={{ position: 'relative', height: 120, width: 240 }}>
    <MapTooltip x={120} y={90} cell={cell} typologyScale="scale5" />
  </div>
);
