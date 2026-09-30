import { render, screen, waitFor, within } from '@testing-library/react';
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
    // Every section sits inside the one page-level main landmark.
    const main = screen.getByRole('main');
    expect(screen.getAllByRole('main')).toHaveLength(1);
    expect(
      within(main).getByRole('heading', {
        name: /explore the world's mangroves/i,
      }),
    ).toBeInTheDocument();
    expect(
      within(main).getByRole('region', { name: /at a glance/i }),
    ).toBeInTheDocument();
    expect(
      within(main).getByRole('region', { name: /who it's for/i }),
    ).toBeInTheDocument();
    expect(
      within(main).getByRole('region', { name: /how it works/i }),
    ).toBeInTheDocument();

    // The lower sections follow in order.
    const lower = [
      'Why it matters',
      'Built with research partners worldwide',
      'Frequently asked questions',
      'Ready to explore?',
    ].map((name) => within(main).getByRole('region', { name }));
    for (let i = 1; i < lower.length; i++) {
      expect(
        lower[i - 1].compareDocumentPosition(lower[i]) &
          Node.DOCUMENT_POSITION_FOLLOWING,
      ).toBeTruthy();
    }

    consoleError.mockRestore();
  });
});
