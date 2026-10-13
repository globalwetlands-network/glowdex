import { PARTNER_COUNTRIES_COUNT } from './factSheet';

/**
 * FAQs (GLO-204), verbatim from the landing-page content review, in four
 * groups.
 *
 * `answer: null` marks an answer still waiting on a decision; it renders as a
 * labelled "To be confirmed" placeholder, never invented copy. Bracketed text
 * inside an answer (e.g. "[licence to be confirmed]") renders as an inline
 * placeholder with a "Coming soon" tooltip until the real copy is supplied.
 * `hidden: true` keeps an approved question and answer here but off the page. Note that the
 * citation answer ("How do I cite MBCAM?") is MBCAM's own citation, not the
 * Sievers et al. (2021) method reference cited under "Where does the data come
 * from?"; don't fill one with the other.
 */
export interface Faq {
  question: string;
  answer: string | null;
  /** Kept in the content but not rendered, e.g. until a feature ships. */
  hidden?: boolean;
}

export interface FaqGroup {
  heading: string;
  faqs: readonly Faq[];
}

export const FAQS_HEADING = 'Frequently asked questions';

/**
 * Questions shown before "Show more", counted across groups in reading order;
 * the rest are revealed on request.
 */
export const FAQS_INITIALLY_VISIBLE = 5;

export const FAQ_GROUPS: readonly FaqGroup[] = [
  {
    heading: 'About MBCAM',
    faqs: [
      {
        question: 'What is MBCAM?',
        answer:
          "The Mangrove Biodiversity & Condition Action Map, or MBCAM, is a free, public tool for exploring the world's mangroves. It combines a global assessment of mangrove condition with local wildlife monitoring from research partners in the field.",
      },
      {
        question: 'Who is behind MBCAM?',
        answer: `MBCAM is built by the Global Wetlands Project at Griffith University and the University of the Western Cape, working with research partners in ${PARTNER_COUNTRIES_COUNT} countries.`,
      },
    ],
  },
  {
    heading: 'How it works',
    faqs: [
      {
        question: 'What is a typology?',
        answer:
          'A group of mangrove areas that share similar characteristics and pressures. Placing an area in a typology is what lets it be compared with places like it, rather than with the whole world.',
      },
      {
        question: 'Does MBCAM show how healthy a mangrove is?',
        answer:
          "No. MBCAM doesn't score or rate any place. It compares each area with similar mangroves, showing what's typical for that kind of place and what stands out.",
      },
      {
        question:
          "What's the difference between the Global assessments and Local wildlife data?",
        answer:
          'The global assessments cover mangrove areas worldwide, using global datasets and a statistical model. Local wildlife data covers specific field sites, where partners record wildlife directly.',
        // Hidden until the answer's accuracy is confirmed.
        hidden: true,
      },
    ],
  },
  {
    heading: 'Data & methods',
    faqs: [
      {
        question: 'Where does the data come from?',
        answer:
          "The global assessments use Global Mangrove Watch and other global datasets, analysed with a method published by Sievers and colleagues in 2021. Local wildlife data comes from partners' field surveys.",
      },
      {
        question: 'How up to date is it?',
        answer:
          'Global assessment data is updated periodically, most recently with data to 2025. Local wildlife data is updated monthly.',
      },
      {
        question: 'How confident is the classification?',
        answer:
          'Each place shows a confidence score for its typology, plus the next-closest typology it could belong to. Confidence drops where data is sparse. The model also flags which values it estimated rather than measured directly.',
        // Hidden until confidence scores ship in the map.
        hidden: true,
      },
      {
        question: "Why doesn't the species count match GBIF?",
        answer:
          "MBCAM only counts wild observations with verified coordinates from the last ten years. GBIF's totals also include older and unverified records, which is why the numbers differ.",
      },
      {
        question: 'Is the AI assistant always right?',
        answer:
          'No. It explains the data in plain language, drawing on published research, but it can make mistakes. Check anything important with an expert.',
      },
    ],
  },
  {
    heading: 'Download, cite & contribute',
    faqs: [
      {
        question: 'Can I download the data?',
        answer:
          "Yes — most of MBCAM's data is free to download for non-commercial and research use, under [licence to be confirmed].",
      },
      {
        question: 'How do I cite MBCAM?',
        answer:
          "We're finalising the formal citation for MBCAM — check back here, or get in touch if you need one now.",
      },
      {
        question: 'Can my organisation contribute monitoring data?',
        answer:
          "Yes — we're setting up a formal route for new monitoring partners. [Contact method to be confirmed] in the meantime, and we'll point you straight to it once it's live.",
      },
    ],
  },
];
