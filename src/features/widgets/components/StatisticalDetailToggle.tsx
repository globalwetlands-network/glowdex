import { useState } from 'react';
import { BarChart2, ChevronDown, ChevronUp } from 'lucide-react';
import { usePostHog } from 'posthog-js/react';
import type {
  AIStatisticalContextV1,
  AIStatisticalIndicatorSummary,
} from '@/api/types';

function formatGroupingLabel(raw: string): string {
  return raw.replace(/^(?:Cluster|Typology)_?(\d+)$/i, 'Typology $1');
}

const CURRENT_PRESSURE_KEYS = new Set([
  'pressure_mangrove_climate_current',
  'pressure_mangrove_land_current',
  'pressure_mangrove_marine_current',
]);

const RATE_PRESSURE_KEYS = new Set([
  'pressure_mangrove_climate_rate',
  'pressure_mangrove_land_rate',
  'pressure_mangrove_marine_rate',
]);

const INVERTED_ECOLOGICAL_KEYS = new Set([
  'mang_spec_score',
  // mang_frag_area_mn_rate removed — positive rate = habitat
  // consolidating (mean patch area increasing), not fragmenting.
  // Confirmed by science team review, June 2026.
  // barColor now uses standard green/amber/red for this indicator.
]);

const SIGNAL_LABELS: Record<string, string> = {
  mang_fish_dens: 'Fish density',
  mang_invert_dens: 'Invertebrate density',
  mang_mean_agb_mg_ha: 'Above-ground biomass',
  mang_mean_SOC: 'Soil organic carbon',
  mang_spec_score: 'Species threat score',
  // Renamed from 'Fragmentation rate' — a positive value means
  // mean patch area is increasing (habitat consolidating).
  // Confirmed by science team review, June 2026.
  mang_frag_area_mn_rate: 'Consolidation rate',
  mang_frag_area_mn: 'Fragment area',
  mang_mean_age: 'Mean canopy age',
  pressure_mangrove_climate_current: 'Climate pressure',
  pressure_mangrove_land_current: 'Land pressure',
  pressure_mangrove_marine_current: 'Marine pressure',
  pressure_mangrove_climate_rate: 'Climate trend',
  pressure_mangrove_land_rate: 'Land trend',
  pressure_mangrove_marine_rate: 'Marine trend',
};

/**
 * Returns the correct ordinal suffix for a percentile number.
 */
function ordinalSuffix(n: number): string {
  const rounded = Math.round(n);
  const mod100 = rounded % 100;
  if (mod100 >= 11 && mod100 <= 13) return `${rounded}th`;
  switch (rounded % 10) {
    case 1:
      return `${rounded}st`;
    case 2:
      return `${rounded}nd`;
    case 3:
      return `${rounded}rd`;
    default:
      return `${rounded}th`;
  }
}

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

function interpretEcologicalPercentile(percentile: number): string {
  if (percentile >= 90) return 'exceptionally high for this typology';
  if (percentile >= 75) return 'above typical range for this typology';
  if (percentile >= 60) return 'moderately above median for this typology';
  if (percentile >= 40) return 'near median for this typology';
  if (percentile >= 25) return 'moderately below median for this typology';
  if (percentile >= 10) return 'below typical range for this typology';
  return 'exceptionally low for this typology';
}

function interpretInvertedPercentile(percentile: number): string {
  if (percentile >= 90) return 'exceptionally high threat for this typology';
  if (percentile >= 75) return 'above typical threat level for this typology';
  if (percentile >= 60) return 'moderately elevated threat for this typology';
  if (percentile >= 40) return 'near median threat level for this typology';
  if (percentile >= 25) return 'moderately low threat for this typology';
  if (percentile >= 10) return 'below typical threat level for this typology';
  return 'exceptionally low threat for this typology';
}

function interpretPressurePercentile(percentile: number): string {
  if (percentile >= 90)
    return 'exceptionally elevated stress for this typology';
  if (percentile >= 75) return 'above typical stress level for this typology';
  if (percentile >= 60) return 'moderately elevated stress for this typology';
  if (percentile >= 40) return 'near median stress level for this typology';
  if (percentile >= 25) return 'moderately low stress for this typology';
  if (percentile >= 10) return 'below typical stress level for this typology';
  return 'exceptionally low stress for this typology';
}

function interpretRatePercentile(percentile: number, value: number): string {
  if (value === 0) return 'no net change';
  const direction = value < 0 ? 'declining' : 'increasing';
  if (percentile >= 90) return `rapidly ${direction} for this typology`;
  if (percentile >= 75)
    return `${direction} above typical rate for this typology`;
  if (percentile >= 25) return `${direction} at typical rate for this typology`;
  if (percentile >= 10)
    return `${direction} below typical rate for this typology`;
  return `rapidly ${direction} for this typology`;
}

function getInterpretation(
  key: string,
  percentile: number,
  value: number,
): string {
  if (RATE_PRESSURE_KEYS.has(key)) {
    return interpretRatePercentile(percentile, value);
  }
  if (CURRENT_PRESSURE_KEYS.has(key)) {
    return interpretPressurePercentile(percentile);
  }
  if (INVERTED_ECOLOGICAL_KEYS.has(key)) {
    return interpretInvertedPercentile(percentile);
  }
  return interpretEcologicalPercentile(percentile);
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
