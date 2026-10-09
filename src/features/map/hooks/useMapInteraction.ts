import { useCallback, useState } from 'react';
import type { MapMouseEvent } from 'react-map-gl';

interface UseMapInteractionProps {
  onCellSelect?: (id: number | null) => void;
  /**
   * False while the grid isn't interactive (Local mode). Hover then reads as
   * none, and turning it off or on clears any hover left over from before,
   * so no stale pointer cursor or tooltip survives a mode switch.
   */
  enabled?: boolean;
}

/**
 * Normalizes cell ID from feature properties
 * Handles both string and number IDs, prioritizing 'ID' over 'id'
 */
function normalizeCellId(
  properties: Record<string, unknown> | null | undefined,
): number | null {
  if (!properties) return null;

  const rawId = properties.ID !== undefined ? properties.ID : properties.id;
  if (rawId === undefined) return null;

  return typeof rawId === 'string' ? parseInt(rawId, 10) : (rawId as number);
}

/**
 * Hook for managing map hover and click interactions
 * Tracks hovered cell, hover position, and handles cell selection
 */
export function useMapInteraction({
  onCellSelect,
  enabled = true,
}: UseMapInteractionProps = {}) {
  const [hoveredCellId, setHoveredCellId] = useState<number | null>(null);
  const [hoverInfo, setHoverInfo] = useState<{ x: number; y: number } | null>(
    null,
  );

  // Reset hover when `enabled` flips. Adjusting state during render (rather
  // than in an effect) means no frame ever renders the stale hover.
  const [wasEnabled, setWasEnabled] = useState(enabled);
  if (wasEnabled !== enabled) {
    setWasEnabled(enabled);
    setHoveredCellId(null);
    setHoverInfo(null);
  }

  const onHover = useCallback((event: MapMouseEvent) => {
    const { features, point } = event;
    const hoveredFeature = features && features[0];

    if (hoveredFeature && hoveredFeature.properties?.ID) {
      setHoveredCellId(hoveredFeature.properties.ID);
      setHoverInfo({ x: point.x, y: point.y });
    } else {
      setHoveredCellId(null);
      setHoverInfo(null);
    }
  }, []);

  const onClick = useCallback(
    (event: MapMouseEvent) => {
      const { features } = event;
      const clickedFeature = features && features[0];

      const cellId = normalizeCellId(clickedFeature?.properties);

      if (cellId !== null) {
        onCellSelect?.(cellId);
      } else {
        // Clicked background - deselect
        onCellSelect?.(null);
      }
    },
    [onCellSelect],
  );

  return {
    hoveredCellId: enabled ? hoveredCellId : null,
    hoverInfo: enabled ? hoverInfo : null,
    onHover,
    onClick,
  };
}
