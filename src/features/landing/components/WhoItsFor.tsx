import {
  PERSONAS,
  WHO_ITS_FOR_HEADING,
  type Persona,
} from '../config/whoItsFor';

interface WhoItsForProps {
  personas?: readonly Persona[];
}

/**
 * Persona cards, two to a row from `md` up so lines stay a comfortable
 * length. Every card opens the same way (icon and audience name), then the
 * question that audience brings (if any) and how MBCAM answers it as short
 * bullet points.
 */
export function WhoItsFor({ personas = PERSONAS }: WhoItsForProps) {
  return (
    <section
      aria-labelledby="who-its-for-heading"
      className="bg-glowdex-green px-6 py-20 md:px-16"
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-10">
        <h2
          id="who-its-for-heading"
          className="m-0 text-3xl font-bold text-white md:text-5xl"
        >
          {WHO_ITS_FOR_HEADING}
        </h2>
        <ul className="m-0 grid list-none grid-cols-1 gap-6 p-0 md:grid-cols-2">
          {personas.map(({ audience, icon: Icon, question, points }) => (
            <li
              key={audience}
              className="flex flex-col gap-4 rounded-2xl bg-white p-6 md:p-8"
            >
              <div className="flex items-center gap-3">
                <span
                  aria-hidden="true"
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-glowdex-teal/10 text-glowdex-green"
                >
                  <Icon className="h-5 w-5" />
                </span>
                <h3 className="m-0 text-xl font-bold text-gray-900">
                  {audience}
                </h3>
              </div>
              {question && (
                <p className="m-0 text-base font-medium text-glowdex-green">
                  {question}
                </p>
              )}
              <ul className="m-0 list-disc space-y-2 pl-5 text-base leading-relaxed text-gray-600 marker:text-glowdex-teal">
                {points.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
