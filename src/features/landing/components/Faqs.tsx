import { Fragment, useId, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import {
  FAQ_GROUPS,
  FAQS_HEADING,
  FAQS_INITIALLY_VISIBLE,
  type Faq,
  type FaqGroup,
} from '../config/faqs';

interface FaqsProps {
  groups?: readonly FaqGroup[];
  initiallyVisible?: number;
}

/**
 * Grouped accordion of FAQs; each question expands independently (native
 * `<details>`). Only the first few questions (counted across groups) show
 * until the visitor asks for the rest, and a group's heading appears once any
 * of its questions does. Questions marked `hidden` are never shown. Answers not
 * yet decided show a labelled placeholder.
 */
export function Faqs({
  groups = FAQ_GROUPS,
  initiallyVisible = FAQS_INITIALLY_VISIBLE,
}: FaqsProps) {
  const headingId = useId();
  const listId = useId();
  const [showAll, setShowAll] = useState(false);
  const { visibleGroups, total } = takeQuestions(
    groups,
    showAll ? Infinity : initiallyVisible,
  );
  const hiddenCount = Math.max(total - initiallyVisible, 0);

  return (
    <section
      id="faq"
      aria-labelledby={headingId}
      className="bg-white px-6 pt-16 pb-20 md:px-16"
    >
      <div className="mx-auto max-w-3xl">
        <h2
          id={headingId}
          className="m-0 mb-6 text-2xl font-bold text-gray-900 md:text-4xl"
        >
          {FAQS_HEADING}
        </h2>
        <div id={listId} className="flex flex-col gap-10">
          {visibleGroups.map((group) => (
            <div key={group.heading}>
              <h3 className="m-0 mb-2 text-sm font-semibold tracking-wide text-glowdex-green uppercase">
                {group.heading}
              </h3>
              <div className="divide-y divide-gray-100 border-t border-b border-gray-100">
                {group.faqs.map((faq) => (
                  <FaqItem key={faq.question} faq={faq} />
                ))}
              </div>
            </div>
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

/**
 * Drops `hidden` questions, then keeps the first `limit` of the rest across
 * groups, in reading order, leaving out groups with none left. `total` counts
 * every shown question, before the limit.
 */
function takeQuestions(
  groups: readonly FaqGroup[],
  limit: number,
): { visibleGroups: FaqGroup[]; total: number } {
  const visibleGroups: FaqGroup[] = [];
  let total = 0;
  for (const group of groups) {
    const shown = group.faqs.filter((faq) => !faq.hidden);
    const faqs = shown.slice(0, Math.max(limit - total, 0));
    total += shown.length;
    if (faqs.length > 0) visibleGroups.push({ ...group, faqs });
  }
  return { visibleGroups, total };
}

interface FaqItemProps {
  faq: Faq;
}

function FaqItem({ faq }: FaqItemProps) {
  return (
    <details className="group py-5">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold text-gray-900 [&::-webkit-details-marker]:hidden">
        {faq.question}
        <ChevronDown
          aria-hidden
          className="h-4 w-4 shrink-0 text-gray-400 transition-transform group-open:rotate-180"
        />
      </summary>
      {faq.answer ? (
        <p className="m-0 mt-2 text-sm leading-relaxed text-gray-600">
          <AnswerText text={faq.answer} />
        </p>
      ) : (
        <p className="m-0 mt-2 text-sm text-gray-500 italic">To be confirmed</p>
      )}
    </details>
  );
}

interface AnswerTextProps {
  text: string;
}

/** Renders an answer, turning each `[bracketed]` gap into a placeholder. */
function AnswerText({ text }: AnswerTextProps) {
  return text.split(/(\[[^\]]+\])/).map((part, index) => {
    const placeholder = part.match(/^\[(.+)\]$/);
    return placeholder ? (
      <ComingSoonPlaceholder key={index}>
        {placeholder[1]}
      </ComingSoonPlaceholder>
    ) : (
      <Fragment key={index}>{part}</Fragment>
    );
  });
}

interface ComingSoonPlaceholderProps {
  children: string;
}

/**
 * Amber, dashed marker for copy that's still outstanding, with a "Coming soon"
 * tooltip on hover or keyboard focus. The tooltip is `display: none` until
 * then, so it isn't read inline or copied with the answer; screen readers get
 * it once, as the marker's description.
 */
function ComingSoonPlaceholder({ children }: ComingSoonPlaceholderProps) {
  const tooltipId = useId();

  return (
    <span className="group/placeholder relative inline-block">
      <span
        tabIndex={0}
        aria-describedby={tooltipId}
        className="cursor-help rounded border border-dashed border-amber-400 bg-amber-50 px-1.5 font-medium text-amber-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
      >
        {children}
      </span>
      <span
        id={tooltipId}
        role="tooltip"
        className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-1.5 hidden -translate-x-1/2 rounded bg-gray-900 px-2 py-1 text-xs whitespace-nowrap text-white group-focus-within/placeholder:block group-hover/placeholder:block"
      >
        Coming soon
      </span>
    </span>
  );
}
