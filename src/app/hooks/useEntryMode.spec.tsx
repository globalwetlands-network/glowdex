import { act, renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import {
  BrowserRouter,
  MemoryRouter,
  useLocation,
  useNavigate,
  useNavigationType,
} from 'react-router-dom';
import { afterEach, describe, expect, it } from 'vitest';
import { useEntryMode } from './useEntryMode';

/**
 * Renders the hook inside a router at `url`, alongside what the router sees
 * (location, PUSH/REPLACE) and a navigate for Back.
 */
function renderEntryMode(url: string) {
  const wrapper = ({ children }: { children: ReactNode }) => (
    <MemoryRouter initialEntries={[url]}>{children}</MemoryRouter>
  );
  return renderHook(
    () => ({
      ...useEntryMode(),
      location: useLocation(),
      navigationType: useNavigationType(),
      navigate: useNavigate(),
    }),
    { wrapper },
  );
}

describe('useEntryMode', () => {
  it('defaults to global when there is no mode param', () => {
    const { result } = renderEntryMode('/map');
    expect(result.current.entryMode).toBe('global');
    expect(result.current.siteParam).toBeNull();
  });

  it('reads local mode and the site param', () => {
    const { result } = renderEntryMode('/map?mode=local&site=za-bayhead');
    expect(result.current.entryMode).toBe('local');
    expect(result.current.siteParam).toBe('za-bayhead');
  });

  it('reads explicit global mode', () => {
    const { result } = renderEntryMode('/map?mode=global');
    expect(result.current.entryMode).toBe('global');
  });

  it('treats an unknown mode as global', () => {
    const { result } = renderEntryMode('/map?mode=both');
    expect(result.current.entryMode).toBe('global');
  });

  it('enterLocalSite pushes a history entry and keeps the path', () => {
    const { result } = renderEntryMode('/map?mode=global');

    act(() => result.current.enterLocalSite('za-bayhead'));

    expect(result.current.navigationType).toBe('PUSH');
    expect(result.current.location.pathname).toBe('/map');
    expect(result.current.location.search).toBe('?mode=local&site=za-bayhead');
    expect(result.current.entryMode).toBe('local');
    expect(result.current.siteParam).toBe('za-bayhead');
  });

  it('replaceSiteParam updates site in place without adding history', () => {
    const { result } = renderEntryMode('/map?mode=local&site=za-bayhead');

    act(() => result.current.replaceSiteParam('ke-gazi'));

    expect(result.current.navigationType).toBe('REPLACE');
    expect(result.current.location.pathname).toBe('/map');
    expect(result.current.location.search).toBe('?mode=local&site=ke-gazi');
    expect(result.current.siteParam).toBe('ke-gazi');
    expect(result.current.entryMode).toBe('local');
  });

  it('replaceSiteParam(null) removes the site param', () => {
    const { result } = renderEntryMode('/map?mode=local&site=za-bayhead');

    act(() => result.current.replaceSiteParam(null));

    expect(result.current.location.search).toBe('?mode=local');
    expect(result.current.siteParam).toBeNull();
  });

  it('enterLocalSite keeps unrelated params and the hash', () => {
    const { result } = renderEntryMode(
      '/map?mode=global&utm_source=newsletter#about',
    );

    act(() => result.current.enterLocalSite('za-bayhead'));

    const params = new URLSearchParams(result.current.location.search);
    expect(params.get('mode')).toBe('local');
    expect(params.get('site')).toBe('za-bayhead');
    expect(params.get('utm_source')).toBe('newsletter');
    expect(result.current.location.hash).toBe('#about');
    expect(result.current.location.pathname).toBe('/map');
  });

  it('replaceSiteParam keeps unrelated params and the hash', () => {
    const { result } = renderEntryMode(
      '/map?mode=local&site=za-bayhead&utm_source=newsletter#about',
    );

    act(() => result.current.replaceSiteParam(null));

    expect(result.current.location.search).toBe(
      '?mode=local&utm_source=newsletter',
    );
    expect(result.current.location.hash).toBe('#about');
  });

  it('follows Back after a cross-link', () => {
    const { result } = renderEntryMode('/map?mode=global');
    act(() => result.current.enterLocalSite('za-bayhead'));

    act(() => {
      void result.current.navigate(-1);
    });

    expect(result.current.entryMode).toBe('global');
    expect(result.current.siteParam).toBeNull();
  });

  it('keeps the helpers stable across URL changes', () => {
    const { result } = renderEntryMode('/map?mode=global');
    const { enterLocalSite, replaceSiteParam } = result.current;

    act(() => result.current.enterLocalSite('za-bayhead'));
    act(() => result.current.replaceSiteParam('ke-gazi'));

    expect(result.current.enterLocalSite).toBe(enterLocalSite);
    expect(result.current.replaceSiteParam).toBe(replaceSiteParam);
  });

  describe('in the browser, under the /glowdex basename', () => {
    afterEach(() => window.history.replaceState(null, '', '/'));

    it('writes the real URL with the basename and the /map path', () => {
      window.history.replaceState(null, '', '/glowdex/map?mode=global');
      const wrapper = ({ children }: { children: ReactNode }) => (
        <BrowserRouter basename="/glowdex">{children}</BrowserRouter>
      );
      const { result } = renderHook(() => useEntryMode(), { wrapper });

      act(() => result.current.enterLocalSite('za-bayhead'));

      expect(window.location.pathname).toBe('/glowdex/map');
      expect(window.location.search).toBe('?mode=local&site=za-bayhead');
      expect(result.current.entryMode).toBe('local');
    });
  });
});
