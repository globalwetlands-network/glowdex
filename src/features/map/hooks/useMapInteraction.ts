import { useState, useCallback } from 'react';
import type { MapMouseEvent } from 'react-map-gl';


interface UseMapInteractionProps {
  onCellSelect?: (id: number | null) => void;
}

export function useMapInteraction({ onCellSelect }: UseMapInteractionProps = {}) {
  const [hoveredCellId, setHoveredCellId] = useState<number | null>(null);
  const [hoverInfo, setHoverInfo] = useState<{ x: number; y: number } | null>(null);

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

  const onClick = useCallback((event: MapMouseEvent) => {
    const { features } = event;
    const clickedFeature = features && features[0];

    console.log('[MapDebug] Clicked:', clickedFeature);

    // Normalize ID retrieval
    const properties = clickedFeature?.properties;
    if (properties && (properties.ID !== undefined || properties.id !== undefined)) {
      const rawId = properties.ID !== undefined ? properties.ID : properties.id;
      const id = typeof rawId === 'string' ? parseInt(rawId, 10) : rawId;

      console.log(`[MapDebug] Selecting Cell ID: ${id}`);
      onCellSelect?.(id);
    } else {
      // Only deselect if we clicked explicitly on the map but NOT on a feature
      // But event.features is filtered by interactiveLayerIds. 
      // If we clicked map background, features is empty.

      // BUT: We need to distinguish "clicking background" from "clicking nothing".
      // If features is undefined/empty, we clicked background.
      console.log('[MapDebug] Deselecting (background click)');
      onCellSelect?.(null);
    }
  }, [onCellSelect]);

  return {
    hoveredCellId,
    hoverInfo,
    onHover,
    onClick,
  };
}
