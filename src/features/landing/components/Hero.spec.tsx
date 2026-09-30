import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { preloadMapApp } from '../preloadMapApp';
import { Hero } from './Hero';

// Keep the real map chunk and dataset loads out of jsdom.
vi.mock('../preloadMapApp', () => ({ preloadMapApp: vi.fn() }));

function mockReducedMotion(matches: boolean) {
  vi.stubGlobal(
    'matchMedia',
    vi.fn().mockImplementation((query: string) => ({
      matches,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })),
  );
}

function renderHero(url = '/') {
  return render(
    <MemoryRouter initialEntries={[url]}>
      <Hero />
    </MemoryRouter>,
  );
}

describe('Hero', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.mocked(preloadMapApp).mockClear();
  });

  it('renders the headline, subhead, and both choices with their bylines visible', () => {
    renderHero();

    expect(
      screen.getByRole('heading', { name: /explore the world's mangroves/i }),
    ).toBeVisible();
    expect(
      screen.getByText(/brings together a global comparison/i),
    ).toBeVisible();
    expect(
      screen.getByRole('link', { name: 'Local animal data' }),
    ).toBeVisible();
    expect(
      screen.getByRole('link', { name: 'Global assessment' }),
    ).toBeVisible();
    expect(
      screen.getByText(/wildlife recorded by partners at monitoring sites/i),
    ).toBeVisible();
    expect(
      screen.getByText(/overall ecosystem condition for any mangrove area/i),
    ).toBeVisible();
    expect(screen.getByText(/14 sites, and growing/i)).toBeVisible();
    expect(screen.getByText(/free and open to everyone/i)).toBeVisible();
  });

  it('routes both choices to /map', () => {
    renderHero();

    for (const name of ['Local animal data', 'Global assessment']) {
      expect(screen.getByRole('link', { name })).toHaveAttribute(
        'href',
        '/map',
      );
    }
  });

  it('shows the photo by default', () => {
    const { container } = renderHero();

    expect(container.querySelector('video')).toBeNull();
    expect(
      screen.getByAltText(/roots visible underwater/i),
    ).toBeInTheDocument();
  });

  it('shows the crab video with ?hero=video', () => {
    mockReducedMotion(false);
    const { container } = renderHero('/?hero=video');

    expect(container.querySelector('video')).not.toBeNull();
  });

  it('falls back to the poster image for reduced motion', () => {
    mockReducedMotion(true);
    const { container } = renderHero('/?hero=video');

    expect(container.querySelector('video')).toBeNull();
    expect(
      screen.getByAltText(/crab walking among mangrove roots/i),
    ).toBeInTheDocument();
  });

  it('preloads the map app when the visitor shows intent to open it', () => {
    renderHero();

    fireEvent.pointerEnter(
      screen.getByRole('link', { name: 'Local animal data' }),
    );
    fireEvent.focus(screen.getByRole('link', { name: 'Global assessment' }));

    expect(preloadMapApp).toHaveBeenCalledTimes(2);
  });
});
