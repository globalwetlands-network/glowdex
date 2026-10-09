/**
 * Every MBCAM research partner organisation: the single list behind the map's
 * About drawer and the landing page's "See all partners" view. Edit it here
 * only. Organisations only — no people or contact details.
 *
 * University of Tasmania is left out until its affiliation is confirmed.
 */
export interface ResearchPartner {
  name: string;
  region: string;
}

export const RESEARCH_PARTNERS: readonly ResearchPartner[] = [
  { name: 'Griffith University', region: 'Australia' },
  { name: 'University of the Western Cape', region: 'South Africa' },
  { name: 'Nelson Mandela University', region: 'South Africa' },
  { name: 'Universidad de Costa Rica', region: 'Costa Rica' },
  { name: 'University of Aveiro', region: 'Portugal' },
  {
    name: 'Indian Institute of Science Education and Research (IISER) Kolkata',
    region: 'India',
  },
  { name: 'Katala Foundation', region: 'Philippines' },
  { name: 'World Academy of Sustainable Development', region: 'International' },
  { name: 'Universidade Eduardo Mondlane', region: 'Mozambique' },
  {
    name: 'Western Indian Ocean Mangrove Network (WIOMN)',
    region: 'Indian Ocean Region',
  },
  {
    name: 'National Environment Management Council (NEMC), Tanzania',
    region: 'Tanzania',
  },
  { name: 'Bôndy International', region: 'International' },
  { name: 'Universidade do Estado do Rio de Janeiro', region: 'Brazil' },
  { name: 'Universitas Gadjah Mada', region: 'Indonesia' },
  { name: 'University of Warwick', region: 'United Kingdom' },
  { name: 'WWF', region: 'International' },
  { name: 'University of Southern Denmark', region: 'Denmark' },
];
