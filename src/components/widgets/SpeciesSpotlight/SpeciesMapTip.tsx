import { Map } from 'lucide-react';

interface SpeciesMapTipProps {
  text: string;
  enabled: boolean;
  onToggle: () => void;
}

export function SpeciesMapTip({ text, enabled, onToggle }: SpeciesMapTipProps) {
  return (
    <div className="bg-teal-50 border border-teal-200 rounded-lg p-3 flex items-center justify-between gap-3">
      <div className="flex items-center gap-2 min-w-0">
        <Map className="w-4 h-4 text-teal-600 shrink-0" />
        <div className="min-w-0">
          <span className="text-[10px] font-bold text-teal-700 uppercase tracking-wider">
            MAP TIP
          </span>
          <p className="text-xs text-teal-800 leading-snug">{text}</p>
        </div>
      </div>
      <button
        onClick={onToggle}
        className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-1 ${
          enabled ? 'bg-teal-600' : 'bg-gray-300'
        }`}
        role="switch"
        aria-checked={enabled}
        aria-label="Toggle species distribution layer"
      >
        <span
          className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
            enabled ? 'translate-x-4' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  );
}
