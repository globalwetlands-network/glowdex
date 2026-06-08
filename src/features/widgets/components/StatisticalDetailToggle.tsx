import { useState } from 'react';
import { BarChart2, ChevronDown, ChevronUp } from 'lucide-react';
import type {
  AIStatisticalContextV1,
  AIStatisticalIndicatorSummary,
} from '@/api/types';

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

const SIGNAL_LABELS: Record<string, string> = {
  mang_fish_dens: 'Fish density',
  mang_invert_dens: 'Invertebrate density',
  mang_mean_agb_mg_ha: 'Above-ground biomass',
  mang_mean_SOC: 'Soil organic carbon',
  mang_spec_score: 'Species threat score',
  mang_frag_area_mn_rate: 'Fragmentation rate',
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
  const mod100 = n % 100;
  if (mod100 >= 11 && mod100 <= 13) return `${n}th`;
  switch (n % 10) {
    case 1:
      return `${n}st`;
    case 2:
      return `${n}nd`;
    case 3:
      return `${n}rd`;
    default:
      return `${n}th`;
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
  if (percentile >= 75) return 'bg-glowdex-green';
  if (percentile >= 25) return 'bg-amber-500';
  return 'bg-red-500';
}

const INVERTED_ECOLOGICAL_KEYS = new Set([
  'mang_spec_score',
  'mang_frag_area_mn_rate',
]);

function interpretEcologicalPercentile(percentile: number): string {
  if (percentile >= 90) return 'exceptionally high';
  if (percentile >= 75) return 'above typical range';
  if (percentile >= 60) return 'moderately above median';
  if (percentile >= 40) return 'near median';
  if (percentile >= 25) return 'moderately below median';
  if (percentile >= 10) return 'below typical range';
  return 'exceptionally low';
}

function interpretInvertedPercentile(percentile: number): string {
  if (percentile >= 90) return 'exceptionally high threat';
  if (percentile >= 75) return 'above typical threat level';
  if (percentile >= 60) return 'moderately elevated threat';
  if (percentile >= 40) return 'near median threat level';
  if (percentile >= 25) return 'moderately low threat';
  if (percentile >= 10) return 'below typical threat level';
  return 'exceptionally low threat';
}

function interpretPressurePercentile(percentile: number): string {
  if (percentile >= 90) return 'exceptionally elevated stress';
  if (percentile >= 75) return 'above typical stress level';
  if (percentile >= 60) return 'moderately elevated stress';
  if (percentile >= 40) return 'near median stress level';
  if (percentile >= 25) return 'moderately low stress';
  if (percentile >= 10) return 'below typical stress level';
  return 'exceptionally low stress';
}

function interpretRatePercentile(percentile: number, value: number): string {
  const direction = value < 0 ? 'declining' : 'increasing';
  if (percentile >= 90) return `rapidly ${direction}`;
  if (percentile >= 75) return `${direction} above typical rate`;
  if (percentile >= 25) return `${direction} at typical rate`;
  if (percentile >= 10) return `${direction} below typical rate`;
  return `rapidly ${direction}`;
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
    <div style={{ borderBottom: '0.5px solid var(--color-border-tertiary)' }}>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr auto auto',
          gap: '8px',
          alignItems: 'center',
          padding: '9px 12px 4px',
        }}
      >
        <span
          style={{
            fontSize: '12px',
            color: 'var(--color-text-primary)',
          }}
        >
          {label}
        </span>
        <span
          style={{
            fontSize: '11px',
            color: 'var(--color-text-secondary)',
            textAlign: 'right',
          }}
        >
          {interpretation}
        </span>
        <span
          style={{
            fontSize: '12px',
            fontWeight: 500,
            color: 'var(--color-text-secondary)',
            whiteSpace: 'nowrap',
          }}
        >
          {ordinalSuffix(summary.percentile)}
        </span>
      </div>
      <div
        style={{
          margin: '0 12px 10px',
          height: '3px',
          background: 'var(--color-border-tertiary)',
          borderRadius: '2px',
        }}
      >
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
      <div
        className="bg-gray-50"
        style={{
          padding: '6px 12px',
          borderBottom: '0.5px solid var(--color-border-tertiary)',
        }}
      >
        <span
          style={{
            fontSize: '11px',
            fontWeight: 500,
            color: 'var(--color-text-secondary)',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
          }}
        >
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
}

export function StatisticalDetailToggle({
  statistics,
}: StatisticalDetailToggleProps) {
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

  const groupingLabel =
    statistics.summaries[0]?.groupingLabel ?? 'this typology';

  return (
    <div className="mt-2">
      <button
        onClick={() => setIsOpen((prev) => !prev)}
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
        <div className="mt-2 border border-gray-100 dark:border-gray-800 rounded-lg overflow-hidden">
          <Section title="Ecological indicators" summaries={ecological} />
          <Section title="Current pressures" summaries={currentPressures} />
          <Section title="Pressure trends" summaries={ratePressures} />

          <div
            className="bg-gray-50"
            style={{
              padding: '8px 12px',
              borderTop: '0.5px solid var(--color-border-tertiary)',
            }}
          >
            <span
              style={{
                fontSize: '10px',
                color: 'var(--color-text-secondary)',
              }}
            >
              Percentile rank within {groupingLabel} · Sievers et al. (2021)
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
