import { QUANTILE_CONFIG } from '../constants/app.constants';

interface QuantileSliderProps {
  value: number;
  onChange: (value: number) => void;
}

/**
 * Quantile slider control for filtering typology violin plots
 */
export function QuantileSlider({ value, onChange }: QuantileSliderProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
          Quantile for Typology Violin Plot:
          <span className="ml-1 text-gray-700 bg-gray-100 px-1 rounded">
            {value.toFixed(2)}
          </span>
        </h2>
      </div>
      <div className="flex items-center space-x-2">
        <input
          type="range"
          min={QUANTILE_CONFIG.MIN}
          max={QUANTILE_CONFIG.MAX}
          step={QUANTILE_CONFIG.STEP}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-gray-900"
        />
      </div>
    </div>
  );
}
