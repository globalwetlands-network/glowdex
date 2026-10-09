import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { WhoItsFor } from './WhoItsFor';

/** The persona cards, found via their audience headings. */
function cards() {
  return within(screen.getByRole('region', { name: /who it's for/i }))
    .getAllByRole('heading', { level: 3 })
    .map((heading) => heading.closest('li') as HTMLElement);
}

describe('WhoItsFor', () => {
  it('renders the four personas, with a question line only where one is given', () => {
    render(<WhoItsFor />);

    const personaCards = cards();
    expect(personaCards).toHaveLength(4);

    for (const [index, [audience, question, points]] of (
      [
        [
          'Conservation Managers',
          null,
          [
            'Find your area on the map and see which kind of mangrove it is.',
            'Compare it with similar places rather than a global average.',
            'Download a summary for a report or a funding proposal.',
          ],
        ],
        [
          'Researchers and Students',
          'How does my site compare with others like it?',
          [
            'See how a site sits against others in its typology across every indicator, with the confidence behind the classification and which values are measured rather than estimated.',
            'Download the data and cite the method.',
          ],
        ],
        [
          'Monitoring Partners',
          'How does what we record fit into the bigger picture?',
          [
            "See your site's wildlife records alongside the global picture for that area, and compare reference, degraded and rehabilitated sites.",
            'Your data becomes part of a global dataset others can use.',
          ],
        ],
        [
          'Curious Explorers',
          null,
          [
            'Free and open to everyone.',
            "Learn about the world's mangroves and local wildlife.",
          ],
        ],
      ] as const
    ).entries()) {
      const card = within(personaCards[index]);
      expect(
        card.getByRole('heading', { level: 3, name: audience }),
      ).toBeVisible();
      if (question) expect(card.getByText(question)).toBeVisible();
      else expect(personaCards[index].querySelector('p')).toBeNull();
      expect(
        within(card.getByRole('list'))
          .getAllByRole('listitem')
          .map((item) => item.textContent),
      ).toEqual(points);
    }
  });

  it('renders whatever personas the content supplies', () => {
    render(
      <WhoItsFor
        personas={[
          { audience: 'Students', question: 'Q1?', points: ['P1'] },
          { audience: 'Managers', question: 'Q2?', points: ['P2'] },
          { audience: 'Researchers', question: 'Q3?', points: ['P3'] },
          { audience: 'Partners', question: 'Q4?', points: ['P4a', 'P4b'] },
        ]}
      />,
    );

    expect(
      cards().map((card) => within(card).getByRole('heading').textContent),
    ).toEqual(['Students', 'Managers', 'Researchers', 'Partners']);
  });
});
