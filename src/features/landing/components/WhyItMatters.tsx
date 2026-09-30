import { useId } from 'react';
import {
  WHY_IT_MATTERS_HEADING,
  WHY_IT_MATTERS_PARAGRAPHS,
  WHY_IT_MATTERS_SCALES,
} from '../config/whyItMatters';

/**
 * Why comparing like with like matters, then what that means locally and
 * globally for restoration work. The Local/Global pair sits side by side from
 * `sm` up and stacks on mobile.
 */
export function WhyItMatters() {
  const headingId = useId();

  return (
    <section
      aria-labelledby={headingId}
      className="bg-white px-6 py-8 md:px-16 md:py-12"
    >
      {/* A rounded green card, rather than another full-width band, sets
          this section apart from the white "How it works" above it. */}
      <div className="mx-auto max-w-4xl rounded-3xl bg-glowdex-green px-6 py-10 md:px-14 md:py-14">
        <h2 id={headingId} className="m-0 mb-6 text-3xl font-bold text-white">
          {WHY_IT_MATTERS_HEADING}
        </h2>
        {/* gap, not space-y: space-y's zero-specificity margin loses to the
            paragraphs' m-0 in Tailwind v4, which ran them together. */}
        <div className="flex flex-col gap-4">
          {WHY_IT_MATTERS_PARAGRAPHS.map((paragraph) => (
            <p
              key={paragraph}
              className="m-0 text-base leading-relaxed text-white/85"
            >
              {paragraph}
            </p>
          ))}
        </div>
        <div className="mt-8 flex flex-col gap-7 sm:flex-row">
          {WHY_IT_MATTERS_SCALES.map((scale) => (
            <div key={scale.label} className="flex-1">
              <h3 className="m-0 mb-2 text-[11px] font-bold tracking-wide text-white uppercase">
                {scale.label}
              </h3>
              <p className="m-0 text-[15px] leading-relaxed text-white/85">
                {scale.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
