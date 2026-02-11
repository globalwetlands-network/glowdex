import type { RichGridCell } from '@/data/types/grid.types';

/**
 * Extended grid cell with calculated center coordinates
 */
export interface EnrichedGridCell extends RichGridCell {
  centerCoords?: {
    latitude: number;
    longitude: number;
  };
}

/**
 * Mobile panel state and controls
 */
export interface MobilePanelState {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
}
