import { useData } from '@/context/DataContext';

/**
 * Shows which dataset version the app is on: the manifest's `dataset_version`
 * loaded from the canonical store (e.g. `v2026.09.0`). Renders nothing until the
 * manifest resolves — there are no bundled repo copies to fall back to, so a
 * failed resolve is surfaced by the app's error state, not this badge.
 *
 * Styled for the green TopBar.
 */
export function DatasetVersionBadge() {
  const { datasetVersion } = useData();
  if (!datasetVersion) return null;

  return (
    <span
      className="px-2 py-1 text-white/60 text-[11px] font-medium tracking-wide rounded bg-white/5"
      title={`Dataset version ${datasetVersion}`}
    >
      v{datasetVersion}
    </span>
  );
}
