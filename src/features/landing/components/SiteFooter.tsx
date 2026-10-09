import logo from '@/assets/globalwetlands.png';
import { useDatasetVersion } from '@/data/hooks/useDatasetVersion';
import { FOOTER_CREDIT, FOOTER_LINKS } from '../config/footer';

/**
 * Landing page footer: logo, nav, the builder credit and the live dataset
 * version.
 *
 * The version is the store manifest's `dataset_version`, the one place the
 * site shows it. Its line is omitted until the manifest resolves, and stays
 * omitted if the store can't be reached.
 */
export function SiteFooter() {
  const datasetVersion = useDatasetVersion();

  return (
    <footer className="border-t border-gray-100 bg-white px-6 py-12 md:px-16">
      <div className="mx-auto max-w-6xl">
        <div className="mb-5 flex items-center gap-2.5">
          {/* Decorative: the wordmark beside it names the site. */}
          <img src={logo} alt="" className="h-[22px] w-[22px]" />
          <span className="text-base font-bold text-glowdex-green">MBCAM</span>
        </div>
        <nav
          aria-label="Footer"
          className="mb-5 flex flex-wrap gap-x-6 gap-y-2 text-[13px] text-gray-600"
        >
          {FOOTER_LINKS.map((link) => (
            <a key={link.label} href={link.href} className="hover:underline">
              {link.label}
            </a>
          ))}
        </nav>
        <p className="m-0 mb-2 max-w-[600px] text-xs leading-relaxed text-gray-500">
          {FOOTER_CREDIT}
        </p>
        {datasetVersion && (
          <p className="m-0 flex items-center gap-2 text-xs text-gray-500">
            Dataset version
            {/* Pill + dot: reads as a live value, not static copy. */}
            <span
              className="inline-flex items-center gap-1.5 rounded-full border border-glowdex-teal/30 bg-glowdex-teal/10 px-2 py-0.5 text-[11px] font-semibold tracking-wide text-glowdex-green"
              title="Loaded live from the data store"
            >
              <span
                aria-hidden="true"
                className="h-1.5 w-1.5 rounded-full bg-glowdex-teal"
              />
              v{datasetVersion}
            </span>
          </p>
        )}
      </div>
    </footer>
  );
}
