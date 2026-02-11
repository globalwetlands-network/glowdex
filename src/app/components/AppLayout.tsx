import { Menu, X } from 'lucide-react';
import type { ReactNode } from 'react';

interface AppLayoutProps {
  mapArea: ReactNode;
  sidePanel: ReactNode;
  isMobilePanelOpen: boolean;
  onToggleMobilePanel: () => void;
}

/**
 * Responsive application layout
 * Desktop: Side panel (left) + Map (right)
 * Mobile: Map (top) + Sliding panel (bottom)
 */
export function AppLayout({
  mapArea,
  sidePanel,
  isMobilePanelOpen,
  onToggleMobilePanel,
}: AppLayoutProps) {
  return (
    <div className="h-screen w-screen flex flex-col md:flex-row overflow-hidden bg-gray-100">
      {/* Map Area (Flex-1, fills remaining space) */}
      <div className="flex-1 relative order-1 md:order-2 h-1/2 md:h-full">
        {mapArea}

        {/* Floating Mobile Header / Toggle */}
        <div className="absolute top-4 left-4 z-10 md:hidden">
          <button
            onClick={onToggleMobilePanel}
            className="bg-white p-2 rounded-md shadow-md text-gray-700 hover:bg-gray-50"
            aria-label={isMobilePanelOpen ? 'Close menu' : 'Open menu'}
          >
            {isMobilePanelOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Side Panel (Left on desktop, Bottom sheet on mobile) */}
      {sidePanel}
    </div>
  );
}
