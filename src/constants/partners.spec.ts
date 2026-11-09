import { describe, expect, it } from 'vitest';
import { RESEARCH_PARTNERS } from './partners';

describe('RESEARCH_PARTNERS', () => {
  it('lists the agreed partners in the agreed order', () => {
    expect(RESEARCH_PARTNERS.map((partner) => partner.name)).toEqual([
      'Griffith University',
      'University of the Western Cape',
      'Indian Institute of Science Education and Research Kolkata',
      'Universidad de Costa Rica',
      'University of Aveiro',
      'Bôndy International',
      'Katala Foundation',
      'Nelson Mandela University',
      'Universidade do Estado do Rio de Janeiro',
      'Universidade Eduardo Mondlane',
      'Universitas Gadjah Mada',
      'Université Cheikh Anta Diop',
      'Université Libre de Bruxelles',
      'University of Mauritius',
      'University of Tasmania',
      'University of Warwick',
      'Western Indian Ocean Mangrove Network (WIOMN)',
      'World Academy of Sustainable Development',
    ]);
  });

  it('gives every partner a region', () => {
    for (const partner of RESEARCH_PARTNERS) {
      expect(partner.region).not.toBe('');
    }
  });
});
