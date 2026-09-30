import { useId, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import {
  FAQS,
  FAQS_HEADING,
  FAQS_INITIALLY_VISIBLE,
  type Faq,
} from '../config/faqs';

interface FaqsProps {
  faqs?: readonly Faq[];
  initiallyVisible?: number;
}

/**
 * Flat accordion of FAQs; each question expands independently (native
 * `<details>`). Only the first few show until the visitor asks for the rest.
 * Answers not yet decided show a labelled placeholder.
 */
export function Faqs({
  faqs = FAQS,
  initiallyVisible = FAQS_INITIALLY_VISIBLE,
}: FaqsProps) {
  const headingId = useId();
  const listId = useId();
  const [showAll, setShowAll] = useState(false);
  const hiddenCount = Math.max(faqs.length - initiallyVisible, 0);
  const visibleFaqs = showAll ? faqs : faqs.slice(0, initiallyVisible);

  return (
    <section aria-labelledby={headingId} className="bg-white px-6 py-16">
      <div className="mx-auto max-w-3xl">
        <h2
          id={headingId}
          className="m-0 mb-6 text-2xl font-bold text-gray-900"
        >
          {FAQS_HEADING}
        </h2>
        <div
          id={listId}
          className="divide-y divide-gray-100 border-t border-b border-gray-100"
        >
          {visibleFaqs.map((faq) => (
            <details key={faq.question} className="group py-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold text-gray-900 [&::-webkit-details-marker]:hidden">
                {faq.question}
                <ChevronDown
                  aria-hidden
                  className="h-4 w-4 shrink-0 text-gray-400 transition-transform group-open:rotate-180"
                />
              </summary>
              {faq.answer ? (
                <p className="m-0 mt-2 text-sm leading-relaxed text-gray-600">
                  {faq.answer}
                </p>
              ) : (
                <p className="m-0 mt-2 text-sm text-gray-500 italic">
                  To be confirmed
                </p>
              )}
            </details>
          ))}
        </div>
        {hiddenCount > 0 && (
          <button
            type="button"
            aria-expanded={showAll}
            aria-controls={listId}
            onClick={() => setShowAll((prev) => !prev)}
            className="mt-6 inline-flex cursor-pointer items-center gap-1.5 text-sm font-semibold text-glowdex-green hover:underline"
          >
            {showAll
              ? 'Show fewer questions'
              : `Show ${hiddenCount} more question${hiddenCount === 1 ? '' : 's'}`}
            <ChevronDown
              aria-hidden
              className={`h-4 w-4 transition-transform ${showAll ? 'rotate-180' : ''}`}
            />
          </button>
        )}
      </div>
    </section>
  );
}
