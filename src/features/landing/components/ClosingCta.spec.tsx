import { fireEvent, render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { preloadMapApp } from '../preloadMapApp';
import { ClosingCta } from './ClosingCta';

// Keep the real map chunk and dataset loads out of jsdom.
vi.mock('../preloadMapApp', () => ({ preloadMapApp: vi.fn() }));

describe('ClosingCta', () => {
  it('renders the heading and both buttons, each opening its own map mode', () => {
    render(
      <MemoryRouter>
        <ClosingCta />
      </MemoryRouter>,
    );

    const section = within(
      screen.getByRole('region', { name: 'Ready to explore?' }),
    );
    for (const [name, href] of [
      ['Local wildlife data', '/map?mode=local'],
      ['Global assessment', '/map?mode=global'],
    ]) {
      expect(section.getByRole('link', { name })).toHaveAttribute('href', href);
    }

    fireEvent.pointerEnter(
      section.getByRole('link', { name: 'Local wildlife data' }),
    );
    expect(preloadMapApp).toHaveBeenCalled();
  });
});
