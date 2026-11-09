/**
 * Every MBCAM research partner organisation: the single list behind the map's
 * About drawer and the landing page's "See all partners" view. Edit it here
 * only. Organisations only — no people or contact details.
 *
 * Order: the five hubs first, then the other partners alphabetically by
 * name. Only list an organisation once it has agreed to be listed.
 */
export interface ResearchPartner {
  name: string;
  region: string;
}

export const RESEARCH_PARTNERS: readonly ResearchPartner[] = [
  { name: 'Griffith University', region: 'Australia' },
  { name: 'University of the Western Cape', region: 'South Africa' },
  {
    name: 'Indian Institute of Science Education and Research Kolkata',
    region: 'India',
  },
  { name: 'Universidad de Costa Rica', region: 'Costa Rica' },
  { name: 'University of Aveiro', region: 'Portugal' },
  { name: 'Bôndy International', region: 'International' },
  { name: 'Katala Foundation', region: 'Philippines' },
  { name: 'Nelson Mandela University', region: 'South Africa' },
  { name: 'Universidade do Estado do Rio de Janeiro', region: 'Brazil' },
  { name: 'Universidade Eduardo Mondlane', region: 'Mozambique' },
  { name: 'Universitas Gadjah Mada', region: 'Indonesia' },
  { name: 'Université Cheikh Anta Diop', region: 'Senegal' },
  { name: 'Université Libre de Bruxelles', region: 'Belgium' },
  { name: 'University of Mauritius', region: 'Mauritius' },
  { name: 'University of Tasmania', region: 'Australia' },
  { name: 'University of Warwick', region: 'United Kingdom' },
  {
    name: 'Western Indian Ocean Mangrove Network (WIOMN)',
    region: 'Indian Ocean Region',
  },
  { name: 'World Academy of Sustainable Development', region: 'International' },
];
