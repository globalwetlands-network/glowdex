import aveiroLogo from '@/assets/partners/aveiro.png';
import glowLogo from '@/assets/partners/glow.png';
import griffithLogo from '@/assets/partners/griffith.png';
import iiserKolkataLogo from '@/assets/partners/iiser-kolkata.png';
import ucrLogo from '@/assets/partners/ucr.png';
import uwcLogo from '@/assets/partners/uwc.png';

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
 * - Logos in `src/assets/partners/` are web copies of the design originals:
 *   background removed, trimmed, and scaled to 192px tall.
 * - The funder must never appear in this list; it is for research partners
 *   only.
 */
export interface Partner {
  name: string;
  logoUrl?: string;
  listingConfirmed: boolean;
}

export const PARTNERS_HEADING = 'Built with research partners worldwide';
export const PARTNERS_SUBHEAD =
  'Led by the Global Wetlands Project at Griffith University and the University of the Western Cape.';

export const FEATURED_PARTNERS: readonly Partner[] = [
  {
    name: 'Global Wetlands Project (GLOW)',
    logoUrl: glowLogo,
    listingConfirmed: true,
  },
  {
    name: 'Griffith University',
    logoUrl: griffithLogo,
    listingConfirmed: true,
  },
  {
    name: 'University of the Western Cape',
    logoUrl: uwcLogo,
    listingConfirmed: true,
  },
  {
    name: 'Universidad de Costa Rica',
    logoUrl: ucrLogo,
    listingConfirmed: true,
  },
  {
    name: 'Universidade de Aveiro',
    logoUrl: aveiroLogo,
    listingConfirmed: true,
  },
  {
    name: 'IISER Kolkata',
    logoUrl: iiserKolkataLogo,
    listingConfirmed: true,
  },
];

export const SEE_ALL_PARTNERS_LABEL = 'See all partners';

// TODO: point at the partners page once it exists.
export const SEE_ALL_PARTNERS_HREF = '#';
