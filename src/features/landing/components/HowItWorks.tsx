import { ArrowRight } from 'lucide-react';
import {
  HOW_IT_WORKS_HEADING,
  HOW_IT_WORKS_STEPS,
  METHODS_HREF,
  METHODS_LINK_LABEL,
  type HowItWorksStep,
} from '../config/howItWorks';

interface HowItWorksProps {
  steps?: readonly HowItWorksStep[];
}

/**
 * Plain-language walk through the typology pipeline as numbered steps, with a
 * link to the full methods. Four columns on desktop, stacked on mobile.
 */
export function HowItWorks({ steps = HOW_IT_WORKS_STEPS }: HowItWorksProps) {
  return (
    <section
      aria-labelledby="how-it-works-heading"
      className="bg-white px-6 py-20 md:px-16"
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-10">
        <h2
          id="how-it-works-heading"
          className="m-0 text-3xl font-bold text-gray-900 md:text-5xl"
        >
          {HOW_IT_WORKS_HEADING}
        </h2>
        {/* role="list" keeps list semantics in Safari despite list-none. */}
        <ol
          role="list"
          className="m-0 grid list-none grid-cols-1 gap-8 p-0 sm:grid-cols-2 lg:grid-cols-4"
        >
          {steps.map((step, index) => (
            <li key={step.title} className="flex flex-col gap-3">
              <div className="flex items-center gap-3">
                {/* Decorative: the <ol> already announces each step's number. */}
                <span
                  aria-hidden="true"
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-glowdex-green text-sm font-bold text-white"
                >
                  {index + 1}
                </span>
                <h3 className="m-0 text-xl font-bold text-gray-900">
                  {step.title}
                </h3>
              </div>
              <p className="m-0 text-base leading-relaxed text-gray-600">
                {step.description}
              </p>
            </li>
          ))}
        </ol>
        <a
          href={METHODS_HREF}
          className="inline-flex items-center gap-1.5 self-start text-base font-semibold text-glowdex-green hover:underline"
        >
          {METHODS_LINK_LABEL}
          <ArrowRight className="h-4 w-4" strokeWidth={2.4} aria-hidden />
        </a>
      </div>
    </section>
  );
}
