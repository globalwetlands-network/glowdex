import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
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

    // One h1 (the hero); the shared header and the footer sit outside main.
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
    const header = screen.getByRole('banner');
    const footer = screen.getByRole('contentinfo');
    expect(main).not.toContainElement(header);
    expect(main).not.toContainElement(footer);

    consoleError.mockRestore();
  });
});

describe('LandingPage header treatment', () => {
  // jsdom has no IntersectionObserver, so these exercise the geometry seed
  // and the scroll fallback. The hero is the first child of <main>.
  let heroBottom = 0;

  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(
      function (this: HTMLElement) {
        const isHero =
          this.parentElement?.tagName === 'MAIN' &&
          this.parentElement.firstElementChild === this;
        return { bottom: isHero ? heroBottom : 0 } as DOMRect;
      },
    );
  });
  afterEach(() => vi.restoreAllMocks());

  const renderPage = () =>
    render(
      <MemoryRouter>
        <LandingPage />
      </MemoryRouter>,
    );

  it('starts transparent over the hero', () => {
    heroBottom = 800;
    renderPage();

    expect(screen.getByRole('banner')).toHaveClass('bg-transparent');
  });

  it('starts solid when the page loads scrolled below the hero', () => {
    heroBottom = -400;
    renderPage();

    expect(screen.getByRole('banner')).not.toHaveClass('bg-transparent');
  });

  it('switches to solid on scroll without IntersectionObserver', () => {
    heroBottom = 800;
    renderPage();
    expect(screen.getByRole('banner')).toHaveClass('bg-transparent');

    heroBottom = 40;
    act(() => {
      fireEvent.scroll(window);
    });
    expect(screen.getByRole('banner')).not.toHaveClass('bg-transparent');
  });

  it('scopes its scroll behaviour to the page while mounted', () => {
    heroBottom = 800;
    const { unmount } = renderPage();
    expect(document.documentElement).toHaveClass('landing-page');

    unmount();
    expect(document.documentElement).not.toHaveClass('landing-page');
  });
});
