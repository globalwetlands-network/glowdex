import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { LandingPage } from './LandingPage';

// Keep the real map chunk and dataset loads out of jsdom.
vi.mock('../preloadMapApp', () => ({ preloadMapApp: vi.fn() }));

// Simulate the lazy section's chunk failing to load (e.g. a stale hash after a
// redeploy): importing the module rejects.
vi.mock('./SeeItInAction/SeeItInAction', () => {
  throw new Error('Failed to fetch dynamically imported module');
});

describe('LandingPage', () => {
  it('keeps the hero and its way into the map when the section fails to load', async () => {
    const consoleError = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    render(
      <MemoryRouter>
        <LandingPage />
      </MemoryRouter>,
    );

    await waitFor(() =>
      expect(consoleError).toHaveBeenCalledWith(
        'Landing page section failed to load:',
        expect.anything(),
      ),
    );
    expect(
      screen.getByRole('heading', { name: /explore the world's mangroves/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /open the map/i })).toHaveAttribute(
      'href',
      '/map',
    );

    consoleError.mockRestore();
  });
});
