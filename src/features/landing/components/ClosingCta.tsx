import { useId } from 'react';
import { MapCtaLink } from './MapCtaLink';

/** Final prompt on the brand-green band, with the hero's two map buttons. */
export function ClosingCta() {
  const headingId = useId();

  return (
    <section
      aria-labelledby={headingId}
      className="bg-glowdex-green px-6 py-20 text-center"
    >
      <h2 id={headingId} className="m-0 text-3xl font-bold text-white">
        Ready to explore?
      </h2>
      <div className="mt-7 flex flex-wrap justify-center gap-4">
        <MapCtaLink className="w-full sm:w-[240px]">
          Local animal data
        </MapCtaLink>
        <MapCtaLink className="w-full sm:w-[240px]">
          Global assessment
        </MapCtaLink>
      </div>
    </section>
  );
}
