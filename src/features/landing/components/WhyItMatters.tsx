import { useId } from 'react';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  WHY_IT_MATTERS_HEADING,
  WHY_IT_MATTERS_PARAGRAPHS,
  WHY_IT_MATTERS_SCALES,
} from '../config/whyItMatters';
import { PRELOAD_ON_INTENT } from '../preloadOnIntent';

/**
 * Why comparing like with like matters, then what that means locally and
 * globally for restoration work. The Local/Global pair sits in white blocks
 * (side by side from `sm` up, stacked on mobile), each named by a green mode
 * capsule like the hero's choices and linking into that mode of the map.
 */
export function WhyItMatters() {
  const headingId = useId();

  return (
    <section
      aria-labelledby={headingId}
      className="bg-white px-6 pt-8 pb-12 md:px-16 md:pt-12 md:pb-16"
    >
      {/* A rounded green card, rather than another full-width band, sets
          this section apart from the white "How it works" above it. */}
      <div className="mx-auto max-w-4xl rounded-3xl bg-glowdex-green px-6 py-10 md:px-14 md:py-14">
        <h2
          id={headingId}
          className="m-0 mb-6 text-2xl font-bold text-white md:text-4xl"
        >
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
        {/* White blocks break up the all-green card and mark the pair as the
            section's takeaway; the green capsules break up the white. */}
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {WHY_IT_MATTERS_SCALES.map((scale) => (
            <div
              key={scale.mode}
              className="flex flex-col items-start gap-3 rounded-2xl bg-white p-5 md:p-6"
            >
              <h3 className="m-0 rounded-full bg-glowdex-green px-3 py-1 text-xs font-semibold text-white">
                {scale.label}
              </h3>
              <p className="m-0 text-[15px] leading-relaxed text-gray-700">
                {scale.description}
              </p>
              <Link
                to={`/map?mode=${scale.mode}`}
                {...PRELOAD_ON_INTENT}
                className="mt-auto inline-flex items-center gap-1 pt-1 text-sm font-semibold text-glowdex-green hover:underline"
              >
                {scale.linkLabel}
                <ArrowRight aria-hidden className="h-3.5 w-3.5" />
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
