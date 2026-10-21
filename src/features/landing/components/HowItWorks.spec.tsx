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
      [
        'Gather',
        'We bring together global data on every mangrove area: its extent, its structure, the wildlife it supports and the pressures it faces.',
      ],
      [
        'Group',
        'A statistical model sorts mangrove areas into condition profiles: groups of places with similar characteristics and pressures.',
      ],
      [
        'Compare',
        'We compare each area with others in its profile: measuring it against places like it, not against a global average.',
      ],
      [
        'Monitor',
        'Partners monitor sites in the field, recording wildlife such as crabs at reference, degraded and restored sites. Their data joins the global dataset, feeding back into future rounds of comparison.',
      ],
    ].entries()) {
      const item = within(items[index]);
      expect(item.getByText(String(index + 1))).toBeVisible();
      expect(
        item.getByRole('heading', { level: 3, name: title }),
      ).toBeVisible();
      expect(item.getByText(description)).toBeVisible();
    }
  });

  it('shows the full-methods link as coming soon until the page exists', () => {
    render(<HowItWorks />);

    const methods = screen.getByRole('button', {
      name: /read the full methods/i,
    });
    expect(methods).toBeVisible();
    expect(methods).toHaveAttribute('aria-disabled', 'true');
    expect(methods).toHaveAccessibleDescription('Coming soon');
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
