import type { ReactNode } from 'react';
import type { MobileTab } from '../types/app.types';
import { MobileTabNavigation } from './MobileTabNavigation';

interface AppLayoutProps {
  topBar: ReactNode;
  mapArea: ReactNode;
  sidePanel: ReactNode;
  mobileActiveTab: MobileTab;
  onMobileTabChange: (tab: MobileTab) => void;
}

/**
 * Responsive application layout
 * Desktop: Side panel (left) + Map (right)
 * Mobile: Tab navigation + Content area (panel OR map)
 */
export function AppLayout({
  topBar,
  mapArea,
  sidePanel,
  mobileActiveTab,
  onMobileTabChange,
}: AppLayoutProps) {
  return (
    <div className="h-dvh w-screen flex flex-col overflow-hidden bg-gray-100">
      {/* Top Bar - Visible on all screen sizes */}
      {topBar}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Desktop: Side Panel (Left) */}
        <div className="hidden md:flex md:flex-[0.75] md:order-1 h-full min-w-0">
          {sidePanel}
        </div>

        {/* Mobile: Conditional Content (Panel OR Map) */}
        <div className="flex-1 md:hidden overflow-hidden">
          {mobileActiveTab === 'biodiversity' || mobileActiveTab === 'analysis'
            ? sidePanel
            : mapArea}
        </div>

        {/* Desktop: Map Area (Right) */}
        <div className="hidden md:flex md:flex-[1.25] md:order-2 md:relative h-full min-w-0">
          {mapArea}
        </div>
      </div>

      {/* Mobile Tab Navigation (only visible on mobile) */}
      <div className="md:hidden">
        <MobileTabNavigation
          activeTab={mobileActiveTab}
          onTabChange={onMobileTabChange}
        />
      </div>
    </div>
  );
}
