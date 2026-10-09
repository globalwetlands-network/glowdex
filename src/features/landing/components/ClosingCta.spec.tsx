import { fireEvent, render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { preloadMapApp } from '../preloadMapApp';
import { ClosingCta } from './ClosingCta';

// Keep the real map chunk and dataset loads out of jsdom.
vi.mock('../preloadMapApp', () => ({ preloadMapApp: vi.fn() }));

describe('ClosingCta', () => {
  it('renders the heading and both buttons, routed to /map like the hero', () => {
    render(
      <MemoryRouter>
        <ClosingCta />
      </MemoryRouter>,
    );

    const section = within(
      screen.getByRole('region', { name: 'Ready to explore?' }),
    );
    for (const name of ['Local wildlife data', 'Global assessment']) {
      expect(section.getByRole('link', { name })).toHaveAttribute(
        'href',
        '/map',
      );
    }

    fireEvent.pointerEnter(
      section.getByRole('link', { name: 'Local wildlife data' }),
    );
    expect(preloadMapApp).toHaveBeenCalled();
  });
});
