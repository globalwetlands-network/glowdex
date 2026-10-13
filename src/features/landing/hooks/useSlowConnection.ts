import { useState } from 'react';

interface NetworkInformationLike {
  saveData?: boolean;
  effectiveType?: string;
}

const SLOW_EFFECTIVE_TYPES = new Set(['slow-2g', '2g', '3g']);

/**
 * True when the browser reports Data Saver or a slow connection. The Network
 * Information API is Chromium-only; elsewhere this returns false.
 */
export function useSlowConnection(): boolean {
  const [isSlow] = useState(() => {
    if (typeof navigator === 'undefined') return false;
    const connection = (
      navigator as Navigator & { connection?: NetworkInformationLike }
    ).connection;
    if (!connection) return false;
    return (
      connection.saveData === true ||
      SLOW_EFFECTIVE_TYPES.has(connection.effectiveType ?? '')
    );
  });
  return isSlow;
}
