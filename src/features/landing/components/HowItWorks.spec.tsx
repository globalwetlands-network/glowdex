import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { HowItWorks } from './HowItWorks';

describe('HowItWorks', () => {
  it('renders the four numbered steps in order with their copy', () => {
    render(<HowItWorks />);

    const section = screen.getByRole('region', { name: /how it works/i });
    const items = within(section).getAllByRole('listitem');
    expect(items).toHaveLength(4);

    for (const [index, [title, description]] of [
      ['Gather', /we bring together global data on every mangrove area/i],
      ['Group', /a statistical model sorts mangrove areas into typologies/i],
      ['Compare', /measured against places like it/i],
      ['Monitor', /partners monitor sites in the field/i],
    ].entries()) {
      const item = within(items[index]);
      expect(item.getByText(String(index + 1))).toBeVisible();
      expect(
        item.getByRole('heading', { level: 3, name: title }),
      ).toBeVisible();
      expect(item.getByText(description)).toBeVisible();
    }
  });

  it('links to the full methods', () => {
    render(<HowItWorks />);

    expect(
      screen.getByRole('link', { name: /read the full methods/i }),
    ).toBeVisible();
  });

  it('renders whatever steps the content supplies', () => {
    render(
      <HowItWorks
        steps={[
          { title: 'One', description: 'D1' },
          { title: 'Two', description: 'D2' },
        ]}
      />,
    );

    expect(
      screen.getAllByRole('heading', { level: 3 }).map((h) => h.textContent),
    ).toEqual(['One', 'Two']);
  });
});
