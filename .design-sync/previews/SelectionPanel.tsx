import { SelectionPanel } from 'glowdex';
import { TYPOLOGIES, CELL } from './_fixtures';

export const Selected = () => (
  <div style={{ maxWidth: 320 }}>
    <SelectionPanel
      selectedCell={CELL}
      typologies={TYPOLOGIES}
      currentScale="scale5"
    />
  </div>
);

export const Empty = () => (
  <div style={{ maxWidth: 320 }}>
    <SelectionPanel
      selectedCell={null}
      typologies={TYPOLOGIES}
      currentScale="scale5"
    />
  </div>
);
