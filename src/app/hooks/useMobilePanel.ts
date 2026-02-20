import { useState, useCallback } from 'react';

import type { MobilePanelState } from '../types/app.types';

/**
 * Manages mobile panel state
 * 
 * @returns Mobile panel state and control functions
 */
export function useMobilePanel(): MobilePanelState {
  const [isOpen, setIsOpen] = useState(false);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen(prev => !prev), []);

  return { isOpen, open, close, toggle };
}
