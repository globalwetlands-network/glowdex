import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { WhoItsFor } from './WhoItsFor';

describe('WhoItsFor', () => {
  it('renders the three draft personas with their question and paragraph', () => {
    render(<WhoItsFor />);

    const items = within(
      screen.getByRole('region', { name: /who it's for/i }),
    ).getAllByRole('listitem');
    expect(items).toHaveLength(3);

    for (const [index, [audience, question, paragraph]] of [
      [
        'Conservation and coastal managers',
        'Where should we focus effort?',
        /find your area on the map/i,
      ],
      [
        'Researchers',
        'How does my site compare with others like it?',
        /download the data and cite the method/i,
      ],
      [
        'Monitoring partners',
        'How does what we record fit into the bigger picture?',
        /your data becomes part of a global dataset/i,
      ],
    ].entries()) {
      const item = within(items[index]);
      expect(
        item.getByRole('heading', { level: 3, name: audience }),
      ).toBeVisible();
      expect(item.getByText(question)).toBeVisible();
      expect(item.getByText(paragraph)).toBeVisible();
    }
  });

  it('renders whatever personas the content supplies', () => {
    render(
      <WhoItsFor
        personas={[
          { audience: 'Students', question: 'Q1?', description: 'D1' },
          { audience: 'Managers', question: 'Q2?', description: 'D2' },
          { audience: 'Researchers', question: 'Q3?', description: 'D3' },
          { audience: 'Partners', question: 'Q4?', description: 'D4' },
        ]}
      />,
    );

    expect(
      screen.getAllByRole('heading', { level: 3 }).map((h) => h.textContent),
    ).toEqual(['Students', 'Managers', 'Researchers', 'Partners']);
  });
});
