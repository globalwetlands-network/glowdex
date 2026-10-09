import { act, renderHook } from '@testing-library/react';
import type { MapMouseEvent } from 'react-map-gl';
import { describe, expect, it } from 'vitest';
import { useMapInteraction } from './useMapInteraction';

/** A mouse event over the grid cell with the given ID. */
function hoverEvent(id: number): MapMouseEvent {
  return {
    features: [{ properties: { ID: id } }],
    point: { x: 10, y: 20 },
  } as unknown as MapMouseEvent;
}

describe('useMapInteraction', () => {
  it('tracks the hovered cell and its position', () => {
    const { result } = renderHook(() => useMapInteraction());

    act(() => result.current.onHover(hoverEvent(5)));

    expect(result.current.hoveredCellId).toBe(5);
    expect(result.current.hoverInfo).toEqual({ x: 10, y: 20 });
  });

  it('drops hover while disabled and does not bring it back on re-enable', () => {
    const { result, rerender } = renderHook(
      ({ enabled }) => useMapInteraction({ enabled }),
      { initialProps: { enabled: true } },
    );
    act(() => result.current.onHover(hoverEvent(5)));

    // Switching to Local: no hover, so no pointer cursor or tooltip.
    rerender({ enabled: false });
    expect(result.current.hoveredCellId).toBeNull();
    expect(result.current.hoverInfo).toBeNull();

    // Back to Global: the old hover is gone until the mouse moves again.
    rerender({ enabled: true });
    expect(result.current.hoveredCellId).toBeNull();
    expect(result.current.hoverInfo).toBeNull();
  });
});
