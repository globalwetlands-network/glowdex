import logo from '@/assets/globalwetlands.png';
import {
  ACKNOWLEDGEMENT,
  DATASET_VERSION,
  FOOTER_CREDIT,
  FOOTER_LINKS,
} from '../config/footer';

/** Amber, dashed: marks copy that is still genuinely outstanding. */
const PLACEHOLDER_CLASS =
  'inline-block rounded border border-dashed border-amber-400 bg-amber-50 py-0.5 text-[11px] font-semibold text-amber-800';

interface SiteFooterProps {
  acknowledgement?: string | null;
  datasetVersion?: string | null;
}

/**
 * Landing page footer: logo, nav, the developer credit, and the two items
 * still outstanding, shown as labelled placeholders until they're supplied.
 */
export function SiteFooter({
  acknowledgement = ACKNOWLEDGEMENT,
  datasetVersion = DATASET_VERSION,
}: SiteFooterProps) {
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
        <p className="m-0 mb-2 text-xs leading-relaxed text-gray-500">
          {acknowledgement ?? (
            <span className={`${PLACEHOLDER_CLASS} px-2`}>
              Acknowledgement of support — wording to be agreed
            </span>
          )}
        </p>
        <p className="m-0 text-xs text-gray-500">
          Dataset version:{' '}
          {datasetVersion ?? (
            <span className={`${PLACEHOLDER_CLASS} px-1.5`}>
              v#.# — not yet supplied
            </span>
          )}
        </p>
      </div>
    </footer>
  );
}
