import { ExternalLink } from 'lucide-react';
import logo from '@/assets/globalwetlands.png';
import { SiteLink } from '@/components/shared/SiteLink';
import { useDatasetVersion } from '@/data/hooks/useDatasetVersion';
import {
  FOOTER_CREDIT,
  FOOTER_LINKS,
  FOOTER_SOURCE_LINK_LABEL,
  FOOTER_SOURCES,
  FOOTER_SOURCES_HEADING,
} from '../config/footer';

/**
 * Landing page footer: logo, nav, the builder credit, the method reference
 * and the live dataset version.
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
          {FOOTER_LINKS.map((link) =>
            'destination' in link ? (
              <SiteLink
                key={link.label}
                id={link.destination}
                location="footer"
                className="hover:underline"
              >
                {link.label}
              </SiteLink>
            ) : (
              <a key={link.label} href={link.href} className="hover:underline">
                {link.label}
              </a>
            ),
          )}
        </nav>
        <p className="m-0 mb-2 max-w-[600px] text-xs leading-relaxed text-gray-500">
          {FOOTER_CREDIT}
        </p>
        <section
          aria-labelledby="footer-sources-heading"
          className="mb-4 max-w-[720px] border-t border-gray-100 pt-4"
        >
          <h2
            id="footer-sources-heading"
            className="m-0 mb-2 text-[11px] font-bold tracking-widest text-gray-500 uppercase"
          >
            {FOOTER_SOURCES_HEADING}
          </h2>
          <ul className="m-0 list-none space-y-2 p-0 text-xs leading-relaxed text-gray-600">
            {FOOTER_SOURCES.map((source) => (
              <li key={source.url}>
                {source.authors} ({source.year}) &lsquo;{source.title}&rsquo;,{' '}
                <i>{source.journal}</i>, {source.details}.{' '}
                <a
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${FOOTER_SOURCE_LINK_LABEL}: ${source.title} (opens in a new tab)`}
                  title={source.url}
                  className="inline-flex items-center gap-1 font-semibold whitespace-nowrap text-glowdex-green underline underline-offset-2 hover:text-glowdex-teal"
                >
                  {FOOTER_SOURCE_LINK_LABEL}
                  <ExternalLink aria-hidden="true" className="h-3 w-3" />
                </a>
              </li>
            ))}
          </ul>
        </section>
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
