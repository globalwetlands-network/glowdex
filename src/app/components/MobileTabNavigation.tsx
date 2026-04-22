import { BarChart3, Map } from 'lucide-react';
import type { MobileTab } from '../types/app.types';

interface MobileTabNavigationProps {
  activeTab: MobileTab;
  onTabChange: (tab: MobileTab) => void;
}

/**
 * Mobile tab navigation component
 * Allows users to switch between Analysis panel and Map view
 */
export function MobileTabNavigation({
  activeTab,
  onTabChange,
}: MobileTabNavigationProps) {
  return (
    <div className="md:hidden bg-white border-b border-gray-200 flex">
      {/* Analysis Tab */}
      <button
        onClick={() => onTabChange('panel')}
        className={`
          flex-1 flex items-center justify-center gap-2 py-3 px-4 font-medium text-sm
          transition-colors relative
          ${
            activeTab === 'panel'
              ? 'text-blue-600 bg-blue-50'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
          }
        `}
        aria-label="View analysis panel"
        aria-current={activeTab === 'panel' ? 'page' : undefined}
      >
        <BarChart3 size={20} />
        <span>Analysis</span>
        {/* Active indicator */}
        {activeTab === 'panel' && (
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
        )}
      </button>

      {/* Map Tab */}
      <button
        onClick={() => onTabChange('map')}
        className={`
          flex-1 flex items-center justify-center gap-2 py-3 px-4 font-medium text-sm
          transition-colors relative
          ${
            activeTab === 'map'
              ? 'text-blue-600 bg-blue-50'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
          }
        `}
        aria-label="View map"
        aria-current={activeTab === 'map' ? 'page' : undefined}
      >
        <Map size={20} />
        <span>Map</span>
        {/* Active indicator */}
        {activeTab === 'map' && (
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
        )}
      </button>
    </div>
  );
}
