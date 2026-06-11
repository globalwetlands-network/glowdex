import { useState, useEffect, useCallback } from 'react';
import { X } from 'lucide-react';

const STORAGE_KEY = 'glowdex_welcome_dismissed';

export function WelcomeModal() {
  const [visible, setVisible] = useState(
    () => !localStorage.getItem(STORAGE_KEY),
  );

  const handleDismiss = useCallback(() => {
    localStorage.setItem(STORAGE_KEY, 'true');
    setVisible(false);
  }, []);

  useEffect(() => {
    if (!visible) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleDismiss();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [visible, handleDismiss]);

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="welcome-title"
    >
      <button
        type="button"
        aria-label="Close welcome message"
        onClick={handleDismiss}
        className="absolute inset-0 w-full h-full bg-black/40 backdrop-blur-sm cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500/50"
      />
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 space-y-4">
        {/* Close button */}
        <button
          type="button"
          onClick={handleDismiss}
          aria-label="Close welcome message"
          className="absolute top-4 right-4 p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500/50"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Heading */}
        <div className="space-y-1">
          <p className="text-xs font-semibold text-[#0f6e56] uppercase tracking-wider">
            Welcome to
          </p>
          <h2 id="welcome-title" className="text-2xl font-bold text-gray-900">
            GLOWdex
          </h2>
        </div>

        {/* Body */}
        <p className="text-sm text-gray-600 leading-relaxed">
          GLOWdex is an interactive action map for exploring global coastal
          wetlands, with a focus on mangrove ecosystems. It brings together
          habitat data, biodiversity information, species profiles and involved
          partner organisations to support conservation, education and
          monitoring.
        </p>

        {/* Dismiss button */}
        <button
          type="button"
          onClick={handleDismiss}
          className="w-full py-2.5 px-4 bg-[#0f6e56] text-white text-sm font-medium rounded-lg hover:bg-[#085041] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0f6e56]/50"
        >
          Explore the map
        </button>
      </div>
    </div>
  );
}
