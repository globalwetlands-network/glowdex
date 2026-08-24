import { useState } from 'react';
import { BarChart2, ChevronDown, ChevronUp } from 'lucide-react';
import { usePostHog } from 'posthog-js/react';
import type {
  AIStatisticalContextV1,
  AIStatisticalIndicatorSummary,
} from '@/api/types';
import {
  CURRENT_PRESSURE_KEYS,
  RATE_PRESSURE_KEYS,
  INVERTED_ECOLOGICAL_KEYS,
  SIGNAL_LABELS,
  formatGroupingLabel,
  ordinalSuffix,
  getInterpretation,
} from '../utils/indicatorStats';

/**
 * Returns a Tailwind color class for the progress bar based on
 * indicator type and percentile.
 */
function barColor(key: string, percentile: number): string {
  if (CURRENT_PRESSURE_KEYS.has(key)) {
    if (percentile >= 75) return 'bg-red-500';
    if (percentile >= 40) return 'bg-amber-500';
    return 'bg-glowdex-teal';
  }
  if (RATE_PRESSURE_KEYS.has(key)) {
    return 'bg-amber-500';
  }
  // Inverted indicators — higher percentile = worse condition
  if (INVERTED_ECOLOGICAL_KEYS.has(key)) {
    if (percentile >= 75) return 'bg-red-500';
    if (percentile >= 25) return 'bg-amber-500';
    return 'bg-glowdex-green';
  }
  // Standard ecological indicators — higher percentile = better
  if (percentile >= 75) return 'bg-glowdex-green';
  if (percentile >= 25) return 'bg-amber-500';
  return 'bg-red-500';
}

function StatRow({ summary }: { summary: AIStatisticalIndicatorSummary }) {
  const label = SIGNAL_LABELS[summary.key] ?? summary.indicator;
  const interpretation = getInterpretation(
    summary.key,
    summary.percentile,
    summary.cellValue,
  );
  const color = barColor(summary.key, summary.percentile);

  return (
    <div className="border-b border-gray-100">
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr auto auto',
          gap: '8px',
          alignItems: 'center',
          padding: '9px 12px 4px',
        }}
      >
        <span className="text-xs text-gray-800">{label}</span>
        <span className="text-[11px] text-gray-500 text-right">
          {interpretation}
        </span>
        <span className="text-xs font-medium text-gray-500 whitespace-nowrap">
          {ordinalSuffix(summary.percentile)}
        </span>
      </div>
      <div className="mx-3 mb-2.5 h-[3px] bg-gray-100 rounded-full">
        <div
          className={color}
          style={{
            height: '3px',
            borderRadius: '2px',
            width: `${summary.percentile}%`,
            minWidth: '6px',
          }}
        />
      </div>
    </div>
  );
}

function Section({
  title,
  summaries,
}: {
  title: string;
  summaries: AIStatisticalIndicatorSummary[];
}) {
  if (!summaries.length) return null;
  return (
    <>
      <div className="px-3 py-1.5 bg-gray-50 border-b border-gray-100">
        <span className="text-[11px] font-medium text-gray-400 uppercase tracking-wider">
          {title}
        </span>
      </div>
      {summaries.map((s) => (
        <StatRow key={s.key} summary={s} />
      ))}
    </>
  );
}

interface StatisticalDetailToggleProps {
  statistics: AIStatisticalContextV1;
  selectedCellId?: number | null;
}

export function StatisticalDetailToggle({
  statistics,
  selectedCellId,
}: StatisticalDetailToggleProps) {
  const posthog = usePostHog();
  const [isOpen, setIsOpen] = useState(false);

  if (!statistics.summaries || statistics.summaries.length === 0) {
    return null;
  }

  const ecological = statistics.summaries.filter(
    (s) => !CURRENT_PRESSURE_KEYS.has(s.key) && !RATE_PRESSURE_KEYS.has(s.key),
  );
  const currentPressures = statistics.summaries.filter((s) =>
    CURRENT_PRESSURE_KEYS.has(s.key),
  );
  const ratePressures = statistics.summaries.filter((s) =>
    RATE_PRESSURE_KEYS.has(s.key),
  );

  const groupingLabel = formatGroupingLabel(
    statistics.summaries[0]?.groupingLabel ?? 'this typology',
  );

  return (
    <div data-testid="statistical-detail-toggle" className="mt-2">
      <button
        type="button"
        aria-expanded={isOpen}
        data-testid="toggle-button"
        onClick={() => {
          const next = !isOpen;
          setIsOpen(next);
          try {
            posthog?.capture('statistical_detail_toggled', {
              action: next ? 'expanded' : 'collapsed',
              expanded: next,
              cell_id:
                selectedCellId !== null && selectedCellId !== undefined
                  ? String(selectedCellId)
                  : null,
            });
          } catch (error) {
            console.error(
              'Failed to capture statistical_detail_toggled event:',
              error,
            );
          }
        }}
        className="flex items-center gap-1.5 text-xs font-medium text-[#0f6e56] hover:text-[#085041] transition-colors pt-2 border-t border-gray-100 w-full"
      >
        <BarChart2 size={13} />
        {isOpen ? 'Hide' : 'Show'} statistical detail
        {isOpen ? (
          <ChevronUp size={12} className="ml-auto" />
        ) : (
          <ChevronDown size={12} className="ml-auto" />
        )}
      </button>

      {isOpen && (
        <div
          data-testid="stats-panel"
          className="mt-2 border border-gray-100 rounded-lg overflow-hidden"
        >
          <Section title="Ecological indicators" summaries={ecological} />
          <Section title="Current pressures" summaries={currentPressures} />
          <Section title="Pressure trends" summaries={ratePressures} />

          <div className="px-3 py-2 bg-gray-50 border-t border-gray-100">
            <span className="text-[10px] text-gray-400">
              Percentile rank within {groupingLabel} · Sievers et al. (2021)
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
