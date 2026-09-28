import { useEffect, useRef } from 'react';
import { StatisticalDetailToggle } from 'glowdex';

// A summary per indicator group so the expanded panel shows all three
// section headers (Ecological indicators / Current pressures / Rate pressures)
// and their indicator rows — the pieces the side-panel redesign will rework.
const mk = (
  key: string,
  indicator: string,
  cellValue: number,
  percentile: number,
) => ({
  key,
  indicator,
  groupingLabel: 'Typology 5',
  cellValue,
  min: 0,
  q1: 20,
  median: 45,
  q3: 70,
  max: 100,
  percentile,
  sampledDistribution: [5, 12, 20, 28, 35, 45, 52, 60, 70, 82, 95],
});

const statistics = {
  summaries: [
    mk('mang_fish_dens', 'Fish density', 62, 74),
    mk('mang_mean_agb_mg_ha', 'Above-ground biomass', 48, 55),
    mk('mang_spec_score', 'Species threat score', 18, 22),
    mk(
      'pressure_mangrove_climate_current',
      'Climate pressure (current)',
      71,
      68,
    ),
    mk('pressure_mangrove_land_current', 'Land pressure (current)', 40, 44),
    mk('pressure_mangrove_climate_rate', 'Climate pressure (rate)', 33, 37),
  ],
};

export const Default = () => (
  <div style={{ maxWidth: 340 }}>
    <StatisticalDetailToggle statistics={statistics} selectedCellId={1234} />
  </div>
);

// The component keeps its open state internally and has no prop to start expanded, so this
// story clicks the toggle once on mount to show the indicator bars.
export const Expanded = () => {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    ref.current
      ?.querySelector<HTMLButtonElement>('button[aria-expanded="false"]')
      ?.click();
  }, []);
  return (
    <div ref={ref} style={{ maxWidth: 340 }}>
      <StatisticalDetailToggle statistics={statistics} selectedCellId={1234} />
    </div>
  );
};
