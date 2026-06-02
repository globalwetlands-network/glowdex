import { Leaf, BarChart2, Map } from 'lucide-react';
import type { MobileTab } from '../types/app.types';

interface MobileTabNavigationProps {
  activeTab: MobileTab;
  onTabChange: (tab: MobileTab) => void;
}

/**
 * Mobile bottom tab navigation component
 * Allows users to switch between Biodiversity, Analysis, and Map views
 */
export function MobileTabNavigation({
  activeTab,
  onTabChange,
}: MobileTabNavigationProps) {
  const tabs: Array<{
    id: 'biodiversity' | 'analysis' | 'map';
    icon: typeof Leaf;
    label: string;
  }> = [
    { id: 'biodiversity', icon: Leaf, label: 'Biodiversity' },
    { id: 'analysis', icon: BarChart2, label: 'Analysis' },
    { id: 'map', icon: Map, label: 'Map' },
  ];

  return (
    <div className="bg-white border-t border-gray-200 flex">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex-1 flex flex-col items-center justify-center py-2 transition-colors relative ${
              isActive ? 'text-[#0f6e56]' : 'text-gray-500'
            }`}
          >
            {isActive && (
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-[#0f6e56]" />
            )}
            <Icon size={20} />
            <span className="text-[10px] mt-1">{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}
