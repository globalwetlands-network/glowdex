import { FACT_SHEET_FIGURES, type FactSheetFigure } from '../config/factSheet';

interface FactSheetProps {
  figures?: readonly FactSheetFigure[];
}

/**
 * Early-validation band directly under the hero: four headline figures. One
 * row with vertical dividers on desktop; a 2×2 grid with no dividers on mobile.
 */
export function FactSheet({ figures = FACT_SHEET_FIGURES }: FactSheetProps) {
  return (
    <section aria-label="MBCAM at a glance" className="w-full bg-glowdex-green">
      <ul className="mx-auto grid max-w-6xl grid-cols-2 gap-x-4 gap-y-6 px-6 py-8 md:grid-cols-4 md:gap-x-0 md:gap-y-0 md:divide-x md:divide-white/25 md:px-12 md:py-10">
        {figures.map((figure) => (
          <li key={figure.label} className="flex flex-col items-start md:px-8">
            <div className="flex items-center gap-1.5">
              <span className="text-3xl leading-none font-bold text-white md:text-5xl">
                {figure.value}
              </span>
              {figure.provisional && (
                <span className="rounded-full border border-white/30 bg-white/15 px-1.5 py-0.5 text-[9px] font-semibold tracking-wide text-white uppercase md:text-[10px]">
                  Provisional
                </span>
              )}
            </div>
            <p className="m-0 mt-2 max-w-[240px] text-xs leading-snug text-white/80 md:text-sm">
              {figure.label}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
