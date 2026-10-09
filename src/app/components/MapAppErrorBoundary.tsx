import { Component, type ReactNode } from 'react';
import { RotateCw } from 'lucide-react';
import logo from '@/assets/globalwetlands.png';

interface MapAppErrorBoundaryProps {
  children: ReactNode;
  /** Recovers from the failure. Defaults to a full page reload. */
  onReload?: () => void;
}

interface MapAppErrorBoundaryState {
  hasError: boolean;
}

/**
 * Catches a failure to load the lazy map app (e.g. its chunk was removed by a
 * redeploy while the landing page was open, or a network blip) so `/map`
 * shows a recoverable screen instead of unmounting the whole React root.
 *
 * Recovery is a full reload: `React.lazy` caches the rejected import, and
 * after a redeploy only fresh HTML points at the new chunk names.
 */
export class MapAppErrorBoundary extends Component<
  MapAppErrorBoundaryProps,
  MapAppErrorBoundaryState
> {
  state: MapAppErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): MapAppErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    console.error('Map app failed to load:', error);
  }

  private handleReload = () => {
    if (this.props.onReload) this.props.onReload();
    else window.location.reload();
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="absolute inset-0 flex items-center justify-center bg-gray-50 z-50 p-6">
        <div className="text-center max-w-sm">
          <img src={logo} alt="MBCAM" className="w-16 h-16 mx-auto mb-4" />
          <p className="text-gray-700 font-medium text-base">
            We couldn't load the map
          </p>
          <p className="text-gray-500 text-sm mt-2">
            The app may have just been updated, or the connection dropped.
            Reloading the page usually fixes it.
          </p>
          <button
            type="button"
            onClick={this.handleReload}
            className="mt-5 inline-flex items-center gap-2 px-4 py-2 rounded-md bg-glowdex-green text-white text-sm font-medium hover:bg-glowdex-teal transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-glowdex-teal cursor-pointer"
          >
            <RotateCw size={16} />
            Reload
          </button>
        </div>
      </div>
    );
  }
}
