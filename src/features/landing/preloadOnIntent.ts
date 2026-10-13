import { preloadMapApp } from './preloadMapApp';

/** Start loading the map as soon as the visitor shows intent to open it. */
export const PRELOAD_ON_INTENT = {
  onPointerEnter: preloadMapApp,
  onFocus: preloadMapApp,
  onTouchStart: preloadMapApp,
};
