import { useState, useEffect, useRef } from 'react';
import { Layers, Menu, Info, HelpCircle, Database, Mail } from 'lucide-react';
import { MenuDrawer } from './MenuDrawer';
import type { MenuItemKey } from '@/app/content/menuContent';

export function TopBar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [drawerItem, setDrawerItem] = useState<MenuItemKey | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }

    if (isMenuOpen) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [isMenuOpen]);

  const menuItems = [
    {
      label: 'About',
      icon: Info,
      onClick: () => {
        setDrawerItem('about');
        setIsMenuOpen(false);
      },
    },
    {
      label: 'Help',
      icon: HelpCircle,
      onClick: () => {
        setDrawerItem('help');
        setIsMenuOpen(false);
      },
    },
    { divider: true },
    {
      label: 'Methods & Data Sources',
      icon: Database,
      onClick: () => {
        setDrawerItem('methods');
        setIsMenuOpen(false);
      },
    },
    { divider: true },
    {
      label: 'Contact',
      icon: Mail,
      onClick: () => {
        setDrawerItem('contact');
        setIsMenuOpen(false);
      },
    },
  ];

  return (
    <div
      className="w-full min-h-[56px] px-4 py-2 flex items-center justify-between"
      style={{ backgroundColor: '#0a5c47' }}
    >
      {/* Left side: Logo and branding */}
      <div className="flex items-center gap-3">
        {/* Logo tile */}
        <div
          className="w-7 h-7 rounded-md flex items-center justify-center"
          style={{ backgroundColor: '#1d9e75' }}
        >
          <Layers size={16} className="text-white" />
        </div>

        {/* Branding text */}
        <div className="flex flex-col gap-0.5">
          <div className="text-white text-[15px] font-medium leading-tight">
            GLOWdex
          </div>
          <div className="text-white/60 text-[10px] uppercase tracking-wider leading-tight">
            Mangrove Ecosystem Analysis
          </div>
        </div>
      </div>

      {/* Right side: Action buttons */}
      <div className="flex items-center gap-2">
        {/* Menu button with dropdown */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="px-3 py-1.5 text-white/75 text-[13px] rounded hover:bg-white/10 hover:text-white transition-colors flex items-center gap-1.5"
          >
            <Menu size={16} />
            Menu
          </button>

          {/* Dropdown menu */}
          {isMenuOpen && (
            <div className="absolute right-0 top-full mt-1 w-56 bg-white rounded-lg shadow-lg overflow-hidden z-50">
              {menuItems.map((item, index) => {
                if ('divider' in item) {
                  return (
                    <div
                      key={`divider-${index}`}
                      className="border-t border-gray-200 my-1"
                    />
                  );
                }

                const Icon = item.icon;
                return (
                  <button
                    key={item.label}
                    className="w-full px-4 py-2.5 flex items-center gap-3 text-gray-700 text-sm hover:bg-gray-50 transition-colors text-left"
                    onClick={item.onClick}
                  >
                    <Icon size={16} className="text-gray-500" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <MenuDrawer
        isOpen={drawerItem !== null}
        onClose={() => setDrawerItem(null)}
        activeItem={drawerItem}
      />
    </div>
  );
}
