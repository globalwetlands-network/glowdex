import { useState, useEffect, useRef } from 'react';
import { Layers, Menu, Database, Mail, FileText } from 'lucide-react';

export function TopBar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
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
    { label: 'Methods & Data Sources', icon: Database },
    { label: 'Contact', icon: Mail },
    { label: 'Licence', icon: FileText },
  ];

  return (
    <div className="w-full h-[44px] px-4 flex items-center justify-between bg-glowdex-green">
      {/* Left side: Logo and branding */}
      <div className="flex items-center gap-3">
        {/* Logo tile */}
        <div className="w-7 h-7 rounded-md flex items-center justify-center bg-glowdex-teal">
          <Layers size={16} className="text-white" />
        </div>

        {/* Branding text */}
        <div className="flex flex-col gap-0.5">
          <div className="text-white text-[15px] font-medium leading-none">
            GLOWdex
          </div>
          <div className="text-white/60 text-[10px] uppercase tracking-wider leading-none">
            Mangrove Ecosystem Analysis
          </div>
        </div>
      </div>

      {/* Right side: Action buttons */}
      <div className="flex items-center gap-2">
        <button className="px-3 py-1.5 text-white/75 text-[13px] rounded hover:bg-white/10 hover:text-white transition-colors">
          Help
        </button>
        <button className="px-3 py-1.5 text-white/75 text-[13px] rounded hover:bg-white/10 hover:text-white transition-colors">
          About
        </button>

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
              {menuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.label}
                    className="w-full px-4 py-2.5 flex items-center gap-3 text-gray-700 text-sm hover:bg-gray-50 transition-colors text-left"
                    onClick={() => {
                      setIsMenuOpen(false);
                      // Navigation will be wired up later
                    }}
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
    </div>
  );
}
