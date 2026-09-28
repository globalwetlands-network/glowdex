import { MapTooltip } from 'glowdex';
import { CELL } from './_fixtures';

export const Default = () => (
  <div style={{ position: 'relative', height: 120, width: 240 }}>
    <MapTooltip x={120} y={90} cell={CELL} typologyScale="scale5" />
  </div>
);
