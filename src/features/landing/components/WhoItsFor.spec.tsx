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
  it('renders the three draft personas with their question and bullet points', () => {
    render(<WhoItsFor />);

    const personaCards = cards();
    expect(personaCards).toHaveLength(3);

    for (const [index, [audience, question, points]] of (
      [
        [
          'Conservation and coastal managers',
          'Where should we focus effort?',
          [
            'Find your area on the map and see which kind of mangrove it is.',
            "Compare it with similar places rather than a global average, so you can see what's unusual about it rather than only what's poor.",
            'Download a summary for a report or a funding proposal.',
          ],
        ],
        [
          'Researchers',
          'How does my site compare with others like it?',
          [
            'See how a place sits against others in its typology across every indicator, with the confidence behind the classification and which values are measured rather than estimated.',
            'Download the data and cite the method.',
          ],
        ],
        [
          'Monitoring partners',
          'How does what we record fit into the bigger picture?',
          [
            "See your site's wildlife records alongside the global picture for that area, and compare reference, degraded and rehabilitated sites.",
            'Your data becomes part of a global dataset others can use.',
          ],
        ],
      ] as const
    ).entries()) {
      const card = within(personaCards[index]);
      expect(
        card.getByRole('heading', { level: 3, name: audience }),
      ).toBeVisible();
      expect(card.getByText(question)).toBeVisible();
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
