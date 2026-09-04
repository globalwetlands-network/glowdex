import { RotateCw } from 'lucide-react';
import logo from '@/assets/globalwetlands.png';

interface DataUnavailableProps {
  /** The load error, shown as small diagnostic detail. */
  error?: Error | null;
  /** Re-attempts the data load. */
  onRetry: () => void;
}

/**
 * Full-screen state shown when the critical dataset cannot be loaded.
 *
 * Mounted where LoadingState is. Framed as a connection problem, not missing
 * data: on a mangrove platform a blank map would wrongly read as "there is no
 * mangrove data here". Offers a retry that re-resolves the store manifest.
 */
export function DataUnavailable({ error, onRetry }: DataUnavailableProps) {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-gray-50 z-50 p-6">
      <div className="text-center max-w-sm">
        <img src={logo} alt="MBCAM" className="w-16 h-16 mx-auto mb-4" />
        <p className="text-gray-700 font-medium text-base">
          We couldn't load the map data
        </p>
        <p className="text-gray-500 text-sm mt-2">
          This looks like a connection problem, not missing data. Please check
          your connection and try again.
        </p>
        <button
          type="button"
          onClick={onRetry}
          className="mt-5 inline-flex items-center gap-2 px-4 py-2 rounded-md bg-glowdex-green text-white text-sm font-medium hover:bg-glowdex-teal transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-glowdex-teal cursor-pointer"
        >
          <RotateCw size={16} />
          Retry
        </button>
        {error?.message && (
          <p className="text-xs text-gray-400 mt-4 break-words">
            {error.message}
          </p>
        )}
      </div>
    </div>
  );
}
