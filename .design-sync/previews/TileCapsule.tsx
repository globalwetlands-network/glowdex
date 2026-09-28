import { TileCapsule } from 'glowdex';
import { TYPOLOGIES, CELL } from './_fixtures';

// `source` only tags analytics events; the visual axis is the typology scale.
export const Scale5 = () => (
  <TileCapsule
    selectedCell={CELL}
    typologies={TYPOLOGIES}
    currentScale="scale5"
    onNavigateToAnalysis={() => {}}
    source="partner"
  />
);

export const Scale18 = () => (
  <TileCapsule
    selectedCell={CELL}
    typologies={TYPOLOGIES}
    currentScale="scale18"
    onNavigateToAnalysis={() => {}}
    source="species"
  />
);
