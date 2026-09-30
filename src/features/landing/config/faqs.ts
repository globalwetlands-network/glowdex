import { PARTNER_COUNTRIES_COUNT } from './factSheet';

/**
 * FAQs (GLO-204), verbatim from the landing-page content review.
 *
 * `answer: null` marks an answer still waiting on a decision; it renders as a
 * labelled "To be confirmed" placeholder, never invented copy. Note that the
 * citation answer ("How do I cite MBCAM?") is MBCAM's own citation, not the
 * Sievers et al. (2021) method reference cited under "Where does the data come
 * from?"; don't fill one with the other.
 *
 * Ships flat. A grouped version merged with globalwetlandsbudget.org's FAQs is
 * expected; restructure here when it lands.
 */
export interface Faq {
  question: string;
  answer: string | null;
}

export const FAQS_HEADING = 'Frequently asked questions';

/** Questions shown before "Show more"; the rest are revealed on request. */
export const FAQS_INITIALLY_VISIBLE = 5;

export const FAQS: readonly Faq[] = [
  {
    question: 'What is MBCAM?',
    answer:
      "A free public map of the world's mangroves. It combines a global comparison of mangrove areas with wildlife monitoring from partners in the field.",
  },
  {
    question: 'What is a typology?',
    answer:
      'A group of mangrove areas with similar characteristics and pressures. Placing each area in a typology means it can be compared with places like it.',
  },
  {
    question: 'Does MBCAM show how healthy a mangrove is?',
    answer:
      "No. MBCAM doesn't give any place a score or rating. It compares each place with similar mangroves, showing what's typical for that kind of place and what stands out.",
  },
  {
    question:
      "What's the difference between global comparison and local monitoring?",
    answer:
      'Global comparison covers mangrove areas worldwide, using global datasets and a statistical model. Local monitoring covers specific field sites, where partners record wildlife directly.',
  },
  {
    question: 'Where does the data come from?',
    answer:
      "The global comparison uses Global Mangrove Watch and other global datasets, analysed with a method published by Sievers and colleagues in 2021. Local monitoring data comes from partners' field surveys.",
  },
  {
    question: 'How up to date is it?',
    answer:
      'The global comparison is updated periodically, most recently with data to 2025. Local monitoring data is updated monthly.',
  },
  {
    question: 'How confident is the classification?',
    answer:
      'Each place shows how confident the model is in its typology, and the next closest typology. Confidence is lower where data is missing, and values estimated by the model rather than measured are marked.',
  },
  {
    question: "Why doesn't the species count match GBIF?",
    answer:
      "MBCAM shows wild observations with verified coordinates from the last ten years. GBIF's full totals also include older and unverified records, so the numbers differ.",
  },
  {
    question: 'Is the AI assistant always right?',
    answer:
      'No. It explains the data in plain language, drawing on published research, but it can make mistakes. Check anything important with an expert.',
  },
  // Pending: licence terms.
  { question: 'Can I download the data?', answer: null },
  // Pending: MBCAM's formal citation (not the Sievers et al. method reference).
  { question: 'How do I cite MBCAM?', answer: null },
  // Pending: data submission form or contact route.
  {
    question: 'Can my organisation contribute monitoring data?',
    answer: null,
  },
  {
    question: 'Who is behind MBCAM?',
    answer: `The Global Wetlands Project at Griffith University and the University of the Western Cape, working with research partners in ${PARTNER_COUNTRIES_COUNT} countries.`,
  },
];
