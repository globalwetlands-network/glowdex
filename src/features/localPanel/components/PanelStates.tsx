/** Shown for a view (or a whole location) with no data. */
export function NotYetAvailable() {
  return (
    <div className="rounded-xl border border-dashed border-gray-300 bg-[#fafaf9] px-5 py-8 text-center">
      <p className="text-[13px] font-semibold text-gray-600">
        Not yet available
      </p>
    </div>
  );
}

/** Placeholder while the demo flag resolves, so the panel never flashes. */
export function PanelSkeleton() {
  return (
    <div
      role="status"
      aria-busy="true"
      data-testid="local-panel-skeleton"
      className="flex animate-pulse flex-col gap-4 motion-reduce:animate-none"
    >
      <span className="sr-only">Loading local animal data</span>
      <div className="h-3 w-32 rounded bg-gray-200" />
      <div className="grid grid-cols-1 gap-2.5 @lg:grid-cols-3">
        <div className="h-[38px] rounded-lg bg-gray-100" />
        <div className="h-[38px] rounded-lg bg-gray-100" />
        <div className="h-[38px] rounded-lg bg-gray-100" />
      </div>
      <div className="h-64 rounded-xl bg-gray-100" />
    </div>
  );
}

interface NoResultsCardProps {
  continent: string;
  /** Countries with results anywhere, for the body copy. */
  countriesWithResults: string[];
}

/** Formats ["A", "B", "C"] as "A, B and C". */
function listJoin(items: string[]): string {
  if (items.length <= 1) return items.join('');
  return `${items.slice(0, -1).join(', ')} and ${items.at(-1)}`;
}

/** A continent was chosen but none of its countries has results yet. */
export function NoResultsCard({
  continent,
  countriesWithResults,
}: NoResultsCardProps) {
  return (
    <div className="rounded-xl border border-dashed border-gray-300 bg-[#fafaf9] p-5">
      <p className="text-[14px] font-bold text-gray-900">
        No results to show for {continent} yet
      </p>
      <p className="mt-1 text-[12.5px] leading-[1.45] text-gray-600">
        Countries marked data to come cannot be opened yet.
        {countriesWithResults.length > 0 &&
          ` Results available: ${listJoin(countriesWithResults)}.`}
      </p>
    </div>
  );
}
