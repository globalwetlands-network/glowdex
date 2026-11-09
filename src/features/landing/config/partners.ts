import glowLogo from '@/assets/partners/00-glow.webp';
import griffithLogo from '@/assets/partners/01-griffith-university.webp';
import uwcLogo from '@/assets/partners/02-university-of-the-western-cape.webp';
import iiserKolkataLogo from '@/assets/partners/03-indian-institute-of-science-education-and-research-kolkata.webp';
import ucrLogo from '@/assets/partners/04-universidad-de-costa-rica.webp';
import aveiroLogo from '@/assets/partners/05-university-of-aveiro.webp';
import bondyLogo from '@/assets/partners/07-bondy-international.webp';
import katalaLogo from '@/assets/partners/08-katala-foundation.webp';
import nmuLogo from '@/assets/partners/09-nelson-mandela-university.webp';
import uerjLogo from '@/assets/partners/10-universidade-do-estado-do-rio-de-janeiro.webp';
import ugmLogo from '@/assets/partners/12-universitas-gadjah-mada.webp';
import imasLogo from '@/assets/partners/14-university-of-tasmania.webp';
import warwickLogo from '@/assets/partners/15-university-of-warwick.webp';
import wasdLogo from '@/assets/partners/17-world-academy-of-sustainable-development.webp';
import type { SiteDestinationId } from '@/constants/comingSoon';

/**
 * Partners section (GLO-204), copy verbatim from the landing-page content
 * review.
 *
 * Open before final ship:
 * - This is the logo set currently on the canvas. It differs from the five
 *   originally approved for this slot (Katala Foundation, Western Indian Ocean
 *   Mangrove Network, WWF, alongside Griffith and UWC); confirm which is
 *   intended.
 * - A logo only shows when `listingConfirmed` is true (the partner has agreed
 *   to be listed) and `logoUrl` is set; otherwise the tile shows the name. Add
 *   new partners as unconfirmed until they agree.
 * - Order: the array order is the display order and the only source of truth
 *   for it. GLOW first, then the five hubs, then the partners already live in
 *   their original order (Bôndy International to University of Warwick), then
 *   newer partners alphabetically by display name.
 * - The asset file number (`NN-…`) is the partner's slot in the full list, not
 *   its display position, and does not control display order. Gaps are
 *   partners with no logo file yet.
 * - Logos in `src/assets/partners/` are web copies of the design originals:
 *   background removed, trimmed, scaled to 192px tall, and saved as WebP.
 *   `width`/`height` are the file's own pixel size, so the browser reserves
 *   the space before the image loads.
 * - The funder must never appear in this list; it is for research partners
 *   only.
 */
export interface Partner {
  /** Full organisation name; also the logo's alt text. */
  name: string;
  logoUrl?: string;
  /** The logo file's pixel size, set with `logoUrl`. */
  logoWidth?: number;
  logoHeight?: number;
  listingConfirmed: boolean;
}

export const PARTNERS_HEADING = 'Built with research partners worldwide';
export const PARTNERS_SUBHEAD =
  'Led by the Global Wetlands Project at Griffith University and the University of the Western Cape.';

export const FEATURED_PARTNERS: readonly Partner[] = [
  {
    name: 'Global Wetlands Project (GLOW)',
    logoUrl: glowLogo,
    logoWidth: 653,
    logoHeight: 192,
    listingConfirmed: true,
  },
  {
    name: 'Griffith University',
    logoUrl: griffithLogo,
    logoWidth: 205,
    logoHeight: 192,
    listingConfirmed: true,
  },
  {
    name: 'University of the Western Cape',
    logoUrl: uwcLogo,
    logoWidth: 161,
    logoHeight: 192,
    listingConfirmed: true,
  },
  {
    name: 'Indian Institute of Science Education and Research Kolkata (IISER Kolkata)',
    logoUrl: iiserKolkataLogo,
    logoWidth: 175,
    logoHeight: 192,
    listingConfirmed: true,
  },
  {
    name: 'Universidad de Costa Rica',
    logoUrl: ucrLogo,
    logoWidth: 221,
    logoHeight: 192,
    listingConfirmed: true,
  },
  {
    name: 'University of Aveiro',
    logoUrl: aveiroLogo,
    logoWidth: 547,
    logoHeight: 192,
    listingConfirmed: true,
  },
  {
    name: 'Bôndy International',
    logoUrl: bondyLogo,
    logoWidth: 143,
    logoHeight: 192,
    listingConfirmed: true,
  },
  {
    name: 'Nelson Mandela University',
    logoUrl: nmuLogo,
    logoWidth: 1041,
    logoHeight: 192,
    listingConfirmed: true,
  },
  {
    name: 'Institute for Marine and Antarctic Studies, University of Tasmania',
    logoUrl: imasLogo,
    logoWidth: 412,
    logoHeight: 192,
    listingConfirmed: true,
  },
  {
    name: 'University of Warwick',
    logoUrl: warwickLogo,
    logoWidth: 642,
    logoHeight: 192,
    listingConfirmed: true,
  },
  {
    name: 'Katala Foundation',
    logoUrl: katalaLogo,
    logoWidth: 245,
    logoHeight: 192,
    listingConfirmed: true,
  },
  {
    name: 'Universidade do Estado do Rio de Janeiro',
    logoUrl: uerjLogo,
    logoWidth: 172,
    logoHeight: 192,
    listingConfirmed: true,
  },
  {
    name: 'Universitas Gadjah Mada',
    logoUrl: ugmLogo,
    logoWidth: 185,
    logoHeight: 192,
    listingConfirmed: true,
  },
  {
    name: 'World Academy of Sustainable Development',
    logoUrl: wasdLogo,
    logoWidth: 190,
    logoHeight: 192,
    listingConfirmed: true,
  },
];

export const SEE_ALL_PARTNERS_LABEL = 'See all partners';

/** Rendered through SiteLink: "Coming soon" until the partners page exists. */
export const SEE_ALL_PARTNERS_DESTINATION =
  'partners-all' satisfies SiteDestinationId;
