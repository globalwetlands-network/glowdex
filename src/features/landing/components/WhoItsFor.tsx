import {
  PERSONAS,
  WHO_ITS_FOR_HEADING,
  type Persona,
} from '../config/whoItsFor';

interface WhoItsForProps {
  personas?: readonly Persona[];
}

/**
 * Persona blocks, each with the question that audience brings and how MBCAM
 * answers it. The grid auto-fits its columns, so three or four personas lay
 * out without a code change.
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
        <ul className="m-0 grid list-none grid-cols-[repeat(auto-fit,minmax(min(16rem,100%),1fr))] gap-6 p-0">
          {personas.map((persona) => (
            <li
              key={persona.audience}
              className="flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-6"
            >
              <h3 className="m-0 text-sm font-semibold tracking-wide text-glowdex-green uppercase">
                {persona.audience}
              </h3>
              <p className="m-0 text-xl leading-snug font-bold text-gray-900">
                {persona.question}
              </p>
              <p className="m-0 text-base leading-relaxed text-gray-600">
                {persona.description}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
