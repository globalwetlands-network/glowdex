import { useState, useEffect, useCallback } from 'react';
import logo from '@/assets/globalwetlands.png';
import { X } from 'lucide-react';
import { usePostHog } from 'posthog-js/react';

const STORAGE_KEY = 'glowdex_welcome_dismissed';

export function WelcomeModal() {
  const posthog = usePostHog();
  const [visible, setVisible] = useState(
    () => !localStorage.getItem(STORAGE_KEY),
  );

  const handleDismiss = useCallback(
    (method: 'button' | 'escape_key' | 'backdrop_click') => {
      localStorage.setItem(STORAGE_KEY, 'true');
      setVisible(false);
      try {
        posthog?.capture('welcome_modal_dismissed', { dismiss_method: method });
      } catch (error) {
        console.error(
          'Failed to capture welcome_modal_dismissed event:',
          error,
        );
      }
    },
    [posthog],
  );

  useEffect(() => {
    if (!visible) return;
    try {
      posthog?.capture('welcome_modal_shown', { is_first_visit: true });
    } catch (error) {
      console.error('Failed to capture welcome_modal_shown event:', error);
    }
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleDismiss('escape_key');
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [visible, handleDismiss, posthog]);

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
        onClick={() => handleDismiss('backdrop_click')}
        className="absolute inset-0 w-full h-full bg-black/40 backdrop-blur-sm cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500/50"
      />
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 space-y-4">
        {/* Close button */}
        <button
          type="button"
          onClick={() => handleDismiss('button')}
          aria-label="Close welcome message"
          className="absolute top-4 right-4 p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500/50"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Logo + Heading */}
        <div className="flex flex-col items-center text-center space-y-1">
          <img src={logo} alt="GLOWdex logo" className="w-14 h-14 mb-2" />
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
          onClick={() => handleDismiss('button')}
          className="w-full py-2.5 px-4 bg-[#0f6e56] text-white text-sm font-medium rounded-lg hover:bg-[#085041] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0f6e56]/50"
        >
          Explore the map
        </button>
      </div>
    </div>
  );
}
