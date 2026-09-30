import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import logo from '@/assets/globalwetlands.png';
import { PRELOAD_ON_INTENT } from '../preloadOnIntent';

const NAV_LINKS = [
  // TODO: point About / Methods at real pages once they exist.
  { label: 'About', href: '#' },
  { label: 'Methods', href: '#' },
  { label: 'FAQ', href: '#faq' },
] as const;

interface SiteHeaderProps {
  /** Overlaid on the hero media: no background, white text. */
  transparent?: boolean;
}

/**
 * The landing page's fixed, 72px header: logo, nav and "Open the map" (the FAQ
 * section's scroll margin matches the height). One markup for both
 * treatments: `transparent` over the hero, the solid bar everywhere else. The
 * in-app TopBar is separate and unaffected.
 */
export function SiteHeader({ transparent = false }: SiteHeaderProps) {
  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 flex h-[72px] items-center justify-between px-6 transition-colors duration-200 md:px-12 ${
        transparent
          ? 'border-b border-transparent bg-transparent'
          : 'border-b border-gray-100 bg-white/95 backdrop-blur'
      }`}
    >
      <div className="flex items-center gap-2.5">
        {/* Decorative: the wordmark beside it names the site. */}
        <img src={logo} alt="" className="h-7 w-7" />
        <span
          className={`text-xl leading-none font-bold ${
            transparent ? 'text-white' : 'text-glowdex-green'
          }`}
        >
          MBCAM
        </span>
      </div>
      <nav
        aria-label="Main"
        className={`hidden gap-8 text-sm md:flex ${
          transparent ? 'text-white' : 'text-gray-700'
        }`}
      >
        {NAV_LINKS.map((link) => (
          <a key={link.label} href={link.href} className="hover:underline">
            {link.label}
          </a>
        ))}
      </nav>
      <Link
        to="/map"
        {...PRELOAD_ON_INTENT}
        className={`inline-flex items-center gap-1.5 text-sm font-semibold hover:underline ${
          transparent ? 'text-white' : 'text-glowdex-green'
        }`}
      >
        Open the map
        <ArrowRight className="h-3.5 w-3.5" strokeWidth={2.4} />
      </Link>
    </header>
  );
}
