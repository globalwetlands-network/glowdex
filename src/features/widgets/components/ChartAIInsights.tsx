import { useState } from 'react';
import { AlertTriangle, Lightbulb, ChevronDown, ChevronUp } from 'lucide-react';
import { formatPercentile } from '@/utils/formatters';
import { buildChartPrompt } from '@/utils/buildChartPrompt';

interface ChartAIInsightsProps {
  indicatorName: string;
  value: number;
  percentile: number;
  q1: number;
  q3: number;
  selectedCellId: number;
  onAskAI: (prompt: string) => void;
}

export function ChartAIInsights({
  indicatorName,
  value,
  percentile,
  q1,
  q3,
  onAskAI,
}: ChartAIInsightsProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const presets = [
    buildChartPrompt(indicatorName, 'distribution'),
    buildChartPrompt(indicatorName, 'unusual'),
    buildChartPrompt(indicatorName, 'drivers'),
  ];

  let badgeMsg: string | null = null;
  let badgeType: 'warning' | 'insight' | null = null;

  if (percentile >= 95) {
    badgeMsg = `${formatPercentile(percentile)} percentile for this typology`;
    badgeType = 'warning';
  } else if (value > q3) {
    badgeMsg = `Value above the upper quartile`;
    badgeType = 'insight';
  } else if (value < q1) {
    badgeMsg = `Value below the lower quartile`;
    badgeType = 'warning';
  }

  const handleAsk = (prompt: string) => {
    setIsDropdownOpen(false);
    onAskAI(prompt);
  };

  return (
    <div className="mt-2 text-xs relative" data-testid="chart-ai-insights">
      {badgeMsg && (
        <button
          onClick={() => setIsDropdownOpen(true)}
          className={`mb-2 inline-flex items-center gap-1.5 px-2 py-1 rounded-md font-medium border text-left cursor-pointer transition-colors ${badgeType === 'warning'
            ? 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
            : 'bg-blue-50 text-blue-800 border-blue-200 hover:bg-blue-100'
            }`}
          data-testid="insight-badge"
        >
          {badgeType === 'warning' ? (
            <AlertTriangle className="w-3.5 h-3.5" />
          ) : (
            <Lightbulb className="w-3.5 h-3.5" />
          )}
          {badgeMsg}
        </button>
      )}

      <div className="relative mt-1">
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="text-gray-500 hover:text-gray-800 flex items-center gap-1 text-[11px] font-semibold tracking-wide uppercase transition-colors"
          data-testid="ask-ai-button"
        >
          Ask AI about this chart
          {isDropdownOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </button>

        {isDropdownOpen && (
          <div
            className="absolute top-full left-0 mt-1 w-64 bg-white rounded-md shadow-lg border border-gray-100 py-1 z-10 animate-in fade-in zoom-in-95 duration-100"
            data-testid="ask-ai-dropdown"
          >
            {presets.map((preset, i) => (
              <button
                key={i}
                onClick={() => handleAsk(preset)}
                className="block w-full text-left px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 hover:text-blue-600 transition-colors"
              >
                {preset}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
