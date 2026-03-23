import { useCallback, useState } from 'react';
import type { MapMouseEvent } from 'react-map-gl';

interface UseMapInteractionProps {
  onCellSelect?: (id: number | null) => void;
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
}: UseMapInteractionProps = {}) {
  const [hoveredCellId, setHoveredCellId] = useState<number | null>(null);
  const [hoverInfo, setHoverInfo] = useState<{ x: number; y: number } | null>(
    null,
  );

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
    hoveredCellId,
    hoverInfo,
    onHover,
    onClick,
  };
}
