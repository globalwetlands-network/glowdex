import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Partners } from './Partners';

describe('Partners', () => {
  it('renders the heading, subhead, partner tiles and closing link', () => {
    render(<Partners />);

    const section = within(
      screen.getByRole('region', {
        name: 'Built with research partners worldwide',
      }),
    );
    expect(
      section.getByText(
        'Led by the Global Wetlands Project at Griffith University and the University of the Western Cape.',
      ),
    ).toBeVisible();
    expect(section.getAllByRole('listitem')).toHaveLength(6);
    // Every featured partner has confirmed, so each tile shows its logo.
    expect(section.getAllByRole('img')).toHaveLength(6);
    expect(
      section.getByRole('img', { name: 'IISER Kolkata' }),
    ).toBeInTheDocument();
    expect(
      section.getByText(/and more partners across 17 countries/i),
    ).toBeVisible();
    expect(
      section.getByRole('link', { name: /see all partners/i }),
    ).toBeVisible();
  });

  it('shows a logo only for confirmed partners, and a name tile otherwise', () => {
    render(
      <Partners
        partners={[
          { name: 'Confirmed', logoUrl: '/c.png', listingConfirmed: true },
          { name: 'Unconfirmed', logoUrl: '/u.png', listingConfirmed: false },
          { name: 'No logo', listingConfirmed: true },
        ]}
      />,
    );

    const [confirmed, unconfirmed, noLogo] = screen.getAllByRole('listitem');
    expect(
      within(confirmed).getByRole('img', { name: 'Confirmed' }),
    ).toHaveAttribute('src', '/c.png');
    for (const [tile, name] of [
      [unconfirmed, 'Unconfirmed'],
      [noLogo, 'No logo'],
    ] as const) {
      expect(within(tile).queryByRole('img')).toBeNull();
      expect(within(tile).getByText(name)).toBeVisible();
    }
  });
});
