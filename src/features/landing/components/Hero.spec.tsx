import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { HERO_MEDIA } from '../config/heroMedia';
import { preloadMapApp } from '../preloadMapApp';
import { Hero } from './Hero';

// Keep the real map chunk and dataset loads out of jsdom.
vi.mock('../preloadMapApp', () => ({ preloadMapApp: vi.fn() }));

function mockMediaQueries({
  reducedMotion = false,
  smallViewport = false,
}: {
  reducedMotion?: boolean;
  smallViewport?: boolean;
}) {
  vi.stubGlobal(
    'matchMedia',
    vi.fn().mockImplementation((query: string) => ({
      matches: query.includes('reduced-motion') ? reducedMotion : smallViewport,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })),
  );
}

function mockReducedMotion(matches: boolean) {
  mockMediaQueries({ reducedMotion: matches });
}

/** jsdom can't play media: make play()/pause() flip `paused` and fire the events. */
function mockMediaPlayback() {
  let paused = false;
  vi.spyOn(HTMLMediaElement.prototype, 'paused', 'get').mockImplementation(
    () => paused,
  );
  vi.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(function (
    this: HTMLMediaElement,
  ) {
    paused = true;
    this.dispatchEvent(new Event('pause'));
  });
  vi.spyOn(HTMLMediaElement.prototype, 'play').mockImplementation(function (
    this: HTMLMediaElement,
  ) {
    paused = false;
    this.dispatchEvent(new Event('play'));
    return Promise.resolve();
  });
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
    vi.restoreAllMocks();
    Reflect.deleteProperty(navigator, 'connection');
    vi.mocked(preloadMapApp).mockClear();
  });

  it('renders the headline, subhead, and both choices with their bylines visible', () => {
    renderHero();

    expect(
      screen.getByRole('heading', { name: /explore the world's mangroves/i }),
    ).toBeVisible();
    expect(
      screen.getByText(
        /^MBCAM brings together a global comparison of mangrove areas and wildlife monitoring by partners on the ground\.$/,
      ),
    ).toBeVisible();
    expect(
      screen.getByRole('link', { name: 'Local wildlife data' }),
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
    expect(screen.getByText(/^14 locations, and growing$/)).toBeVisible();
    expect(screen.getByText(/free and open to everyone/i)).toBeVisible();
  });

  it('opens each choice in its own map mode', () => {
    renderHero();

    for (const [name, href] of [
      ['Local wildlife data', '/map?mode=local'],
      ['Global assessment', '/map?mode=global'],
      ['See covered locations', '/map?mode=local'],
    ]) {
      expect(screen.getByRole('link', { name })).toHaveAttribute('href', href);
    }
  });

  it('shows the video by default', () => {
    mockReducedMotion(false);
    const { container } = renderHero();

    expect(container.querySelector('video')).not.toBeNull();
  });

  it('shows the photo with ?hero=photo', () => {
    const { container } = renderHero('/?hero=photo');

    expect(container.querySelector('video')).toBeNull();
    expect(
      screen.getByAltText(/roots visible underwater/i),
    ).toBeInTheDocument();
  });

  it('shows the video with ?hero=video', () => {
    mockReducedMotion(false);
    const { container } = renderHero('/?hero=video');

    expect(container.querySelector('video')).not.toBeNull();
  });

  it('falls back to the poster image for reduced motion', () => {
    mockReducedMotion(true);
    const { container } = renderHero('/?hero=video');

    expect(container.querySelector('video')).toBeNull();
    expect(
      screen.getByAltText(/moses perch swimming among mangrove roots/i),
    ).toBeInTheDocument();
  });

  it('plays the lighter mobile video on small viewports', () => {
    mockMediaQueries({ smallViewport: true });
    const { container } = renderHero();

    expect(container.querySelector('video')).toHaveAttribute(
      'src',
      HERO_MEDIA.video.srcMobile,
    );
  });

  it('plays the desktop video on larger viewports, sized to its poster', () => {
    mockMediaQueries({ smallViewport: false });
    const { container } = renderHero();

    const video = container.querySelector('video');
    expect(video).toHaveAttribute('src', HERO_MEDIA.video.src);
    expect(video).toHaveAttribute('width', '1280');
    expect(video).toHaveAttribute('height', '720');
  });

  it('has a focusable pause button whose label follows the playback state', () => {
    mockMediaQueries({});
    mockMediaPlayback();
    const { container } = renderHero();
    // Autoplay starts.
    fireEvent.play(container.querySelector('video')!);

    const button = screen.getByRole('button', {
      name: 'Pause background video',
    });
    button.focus();
    expect(button).toHaveFocus();
    expect(button).not.toHaveAttribute('aria-pressed');

    fireEvent.click(button);
    expect(
      screen.getByRole('button', { name: 'Play background video' }),
    ).toBeInTheDocument();

    fireEvent.click(button);
    expect(
      screen.getByRole('button', { name: 'Pause background video' }),
    ).toBeInTheDocument();
  });

  it('offers Play, not Pause, when the browser blocks autoplay', () => {
    mockMediaQueries({});
    mockMediaPlayback();
    vi.spyOn(HTMLMediaElement.prototype, 'paused', 'get').mockReturnValue(true);
    renderHero();

    // Blocked autoplay fires no event, so the video never reports playing.
    const button = screen.getByRole('button', {
      name: 'Play background video',
    });
    fireEvent.click(button);
    expect(HTMLMediaElement.prototype.play).toHaveBeenCalled();
  });

  it('has no pause button when the poster is shown instead of the video', () => {
    mockReducedMotion(true);
    renderHero();

    expect(
      screen.queryByRole('button', { name: /background video/i }),
    ).not.toBeInTheDocument();
  });

  it('falls back to the sized poster image on a slow connection', () => {
    mockMediaQueries({});
    Object.defineProperty(navigator, 'connection', {
      value: { effectiveType: '3g' },
      configurable: true,
    });
    const { container } = renderHero();

    expect(container.querySelector('video')).toBeNull();
    const poster = screen.getByAltText(
      /moses perch swimming among mangrove roots/i,
    );
    expect(poster).toHaveAttribute('src', HERO_MEDIA.video.poster);
    expect(poster).toHaveAttribute('width', '1280');
    expect(poster).toHaveAttribute('height', '720');
  });

  it('preloads the map app when the visitor shows intent to open it', () => {
    renderHero();

    fireEvent.pointerEnter(
      screen.getByRole('link', { name: 'Local wildlife data' }),
    );
    fireEvent.focus(screen.getByRole('link', { name: 'Global assessment' }));

    expect(preloadMapApp).toHaveBeenCalledTimes(2);
  });
});
