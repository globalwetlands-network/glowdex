import { useId } from 'react';
import { PARTNER_COUNTRIES_COUNT } from '../config/factSheet';
import {
  FEATURED_PARTNERS,
  PARTNERS_HEADING,
  PARTNERS_SUBHEAD,
  SEE_ALL_PARTNERS_HREF,
  SEE_ALL_PARTNERS_LABEL,
  type Partner,
} from '../config/partners';

interface PartnersProps {
  partners?: readonly Partner[];
}

/**
 * A wrapping row of partner tiles. A tile shows the logo only once the partner
 * has confirmed they're happy to be listed; otherwise it shows their name in
 * the same tile, never an empty box.
 */
export function Partners({ partners = FEATURED_PARTNERS }: PartnersProps) {
  const headingId = useId();

  return (
    <section
      aria-labelledby={headingId}
      className="bg-white px-6 py-16 md:px-16"
    >
      <div className="mx-auto max-w-6xl">
        <h2
          id={headingId}
          className="m-0 text-2xl font-bold text-gray-900 md:text-4xl"
        >
          {PARTNERS_HEADING}
        </h2>
        <p className="m-0 mt-2 text-sm text-gray-500">{PARTNERS_SUBHEAD}</p>
        <ul className="m-0 mt-8 flex list-none flex-wrap gap-4 p-0">
          {partners.map((partner) => (
            <li
              key={partner.name}
              className="flex min-h-[84px] min-w-[150px] flex-1 items-center justify-center rounded-lg border border-gray-100 bg-[#f6f6f3] p-4"
            >
              {partner.listingConfirmed && partner.logoUrl ? (
                <img
                  src={partner.logoUrl}
                  alt={partner.name}
                  className="max-h-12 max-w-full object-contain"
                />
              ) : (
                <span className="text-center text-sm font-medium text-gray-600">
                  {partner.name}
                </span>
              )}
            </li>
          ))}
        </ul>
        <p className="m-0 mt-6 text-sm text-gray-600">
          And more partners across {PARTNER_COUNTRIES_COUNT} countries.{' '}
          <a
            href={SEE_ALL_PARTNERS_HREF}
            className="font-semibold text-glowdex-green hover:underline"
          >
            {SEE_ALL_PARTNERS_LABEL} →
          </a>
        </p>
      </div>
    </section>
  );
}
