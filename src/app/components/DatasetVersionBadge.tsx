import { useData } from '@/context/DataContext';

/**
 * Shows which dataset version the app is on. In store mode it renders the
 * loaded manifest version (e.g. `v2026.09.0`); in fallback mode (no store
 * manifest) it renders a static `local` label so users can tell they are
 * viewing bundled repo copies rather than the canonical store.
 *
 * Styled for the green TopBar.
 */
export function DatasetVersionBadge() {
  const { datasetVersion } = useData();
  const label = datasetVersion ? `v${datasetVersion}` : 'local';

  return (
    <span
      className="px-2 py-1 text-white/60 text-[11px] font-medium tracking-wide rounded bg-white/5"
      title={
        datasetVersion
          ? `Dataset version ${datasetVersion}`
          : 'Viewing local bundled data'
      }
    >
      {label}
    </span>
  );
}
