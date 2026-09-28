import { TypologyLegend } from 'glowdex';
import { TYPOLOGIES } from './_fixtures';

export const Scale5 = () => (
  <div style={{ maxWidth: 320 }}>
    <TypologyLegend
      typologies={TYPOLOGIES}
      currentScale="scale5"
      activeClusterId={5}
    />
  </div>
);

export const Scale18 = () => (
  <div style={{ maxWidth: 320 }}>
    <TypologyLegend typologies={TYPOLOGIES} currentScale="scale18" />
  </div>
);
