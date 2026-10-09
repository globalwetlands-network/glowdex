import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '@/assets/globalwetlands.png';
import { Menu, Home, Info, HelpCircle, Database, Mail } from 'lucide-react';
import { MenuDrawer } from './MenuDrawer';
import { DatasetVersionBadge } from './DatasetVersionBadge';
import type { MenuItemKey } from '@/app/content/menuContent';
import type { EntryMode } from '../hooks/useEntryMode';

/** Same names as the landing page's two map buttons; short forms on phones. */
const MODE_OPTIONS: { mode: EntryMode; label: string; shortLabel: string }[] = [
  { mode: 'local', label: 'Local wildlife data', shortLabel: 'Local' },
  { mode: 'global', label: 'Global assessment', shortLabel: 'Global' },
];

interface TopBarProps {
  onLogoClick?: () => void;
  /** Current workflow. The Local/Global switch shows when this and `onModeChange` are set. */
  mode?: EntryMode;
  onModeChange?: (mode: EntryMode) => void;
}

export function TopBar({ onLogoClick, mode, onModeChange }: TopBarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [drawerItem, setDrawerItem] = useState<MenuItemKey | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

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
      label: 'Home',
      icon: Home,
      onClick: () => {
        setIsMenuOpen(false);
        navigate('/');
      },
    },
    { divider: true },
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
      <button
        type="button"
        onClick={onLogoClick}
        aria-label="Return to home"
        className="flex items-center gap-3 rounded-md px-1 py-0.5 hover:bg-white/10 transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
      >
        {/* Logo */}
        <img src={logo} alt="MBCAM logo" className="w-7 h-7" />

        {/* Branding text */}
        <div className="flex flex-col gap-0.5">
          <div className="text-white text-[15px] font-medium leading-tight">
            MBCAM
          </div>
          {/* Hidden on phones to leave room for the mode switch. */}
          <div className="hidden sm:block text-white/60 text-[10px] uppercase tracking-wider leading-tight">
            Mangrove Biodiversity &amp; Condition Action Map
          </div>
        </div>
      </button>

      {/* Right side: Action buttons */}
      <div className="flex items-center gap-2">
        {mode && onModeChange && (
          <div
            role="group"
            aria-label="Map mode"
            className="flex rounded-md bg-white/10 p-0.5"
          >
            {MODE_OPTIONS.map((option) => {
              const isActive = option.mode === mode;
              return (
                <button
                  key={option.mode}
                  type="button"
                  // Full name even when the phone layout shows the short one.
                  aria-label={option.label}
                  aria-pressed={isActive}
                  onClick={() => {
                    if (!isActive) onModeChange(option.mode);
                  }}
                  className={`rounded px-2.5 py-1 text-[12px] font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50 ${
                    isActive
                      ? 'bg-white text-glowdex-green'
                      : 'cursor-pointer text-white/75 hover:text-white'
                  }`}
                >
                  <span className="sm:hidden">{option.shortLabel}</span>
                  <span className="hidden sm:inline">{option.label}</span>
                </button>
              );
            })}
          </div>
        )}
        <div className="hidden sm:block">
          <DatasetVersionBadge />
        </div>

        {/* Menu button with dropdown */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Menu"
            className="px-2 sm:px-3 py-1.5 text-white/75 text-[13px] rounded hover:bg-white/10 hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Menu size={16} />
            <span className="hidden sm:inline">Menu</span>
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
                    className="w-full px-4 py-2.5 flex items-center gap-3 text-gray-700 text-sm hover:bg-gray-50 transition-colors text-left cursor-pointer"
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
