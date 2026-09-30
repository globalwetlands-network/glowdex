import { fireEvent, render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { preloadMapApp } from '../preloadMapApp';
import { SiteHeader } from './SiteHeader';

// Keep the real map chunk and dataset loads out of jsdom.
vi.mock('../preloadMapApp', () => ({ preloadMapApp: vi.fn() }));

function renderHeader(transparent?: boolean) {
  return render(
    <MemoryRouter>
      <SiteHeader transparent={transparent} />
    </MemoryRouter>,
  );
}

describe('SiteHeader', () => {
  afterEach(() => vi.mocked(preloadMapApp).mockClear());

  it('renders the wordmark, the three nav links and the map CTA', () => {
    renderHeader();

    expect(screen.getByText('MBCAM')).toBeInTheDocument();
    const nav = within(screen.getByRole('navigation', { name: 'Main' }));
    expect(nav.getAllByRole('link').map((link) => link.textContent)).toEqual([
      'About',
      'Methods',
      'FAQ',
    ]);
    expect(nav.getByRole('link', { name: 'FAQ' })).toHaveAttribute(
      'href',
      '#faq',
    );
    expect(screen.getByRole('link', { name: /open the map/i })).toHaveAttribute(
      'href',
      '/map',
    );
  });

  it('is one header with a transparent treatment over the hero and a solid bar elsewhere', () => {
    const { rerender } = renderHeader(true);
    const header = screen.getByRole('banner');
    expect(header).toHaveClass('bg-transparent');
    expect(screen.getByText('MBCAM')).toHaveClass('text-white');

    rerender(
      <MemoryRouter>
        <SiteHeader />
      </MemoryRouter>,
    );
    expect(screen.getByRole('banner')).toBe(header);
    expect(header).toHaveClass('bg-white/95');
    expect(screen.getByText('MBCAM')).toHaveClass('text-glowdex-green');
  });

  it('shows its contrast scrim only while transparent', () => {
    const { container, rerender } = renderHeader(true);
    const scrim = container.querySelector('header > [aria-hidden="true"]');
    expect(scrim).toHaveClass('opacity-100');

    rerender(
      <MemoryRouter>
        <SiteHeader />
      </MemoryRouter>,
    );
    expect(scrim).toHaveClass('opacity-0');
  });

  it('preloads the map app when the visitor shows intent to open it', () => {
    renderHeader(true);

    fireEvent.pointerEnter(screen.getByRole('link', { name: /open the map/i }));

    expect(preloadMapApp).toHaveBeenCalledTimes(1);
  });
});
