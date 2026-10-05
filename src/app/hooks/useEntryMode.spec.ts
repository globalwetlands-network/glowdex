import { act, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { useEntryMode } from './useEntryMode';

const setUrl = (url: string) => window.history.replaceState(null, '', url);

describe('useEntryMode', () => {
  afterEach(() => setUrl('/'));

  it('defaults to global when there is no mode param', () => {
    setUrl('/');
    const { result } = renderHook(() => useEntryMode());
    expect(result.current.entryMode).toBe('global');
    expect(result.current.siteParam).toBeNull();
  });

  it('reads local mode and the site param', () => {
    setUrl('/?mode=local&site=za-bayhead');
    const { result } = renderHook(() => useEntryMode());
    expect(result.current.entryMode).toBe('local');
    expect(result.current.siteParam).toBe('za-bayhead');
  });

  it('reads explicit global mode', () => {
    setUrl('/?mode=global');
    const { result } = renderHook(() => useEntryMode());
    expect(result.current.entryMode).toBe('global');
  });

  it('treats an unknown mode as global', () => {
    setUrl('/?mode=both');
    const { result } = renderHook(() => useEntryMode());
    expect(result.current.entryMode).toBe('global');
  });

  it('enterLocalSite pushes a query-only URL and keeps the pathname', () => {
    setUrl('/glowdex/?mode=global');
    const { result } = renderHook(() => useEntryMode());

    act(() => result.current.enterLocalSite('za-bayhead'));

    expect(window.location.pathname).toBe('/glowdex/');
    expect(window.location.search).toBe('?mode=local&site=za-bayhead');
    expect(result.current.entryMode).toBe('local');
    expect(result.current.siteParam).toBe('za-bayhead');
  });

  it('replaceSiteParam updates site in place without adding history', () => {
    setUrl('/glowdex/?mode=local&site=za-bayhead');
    const { result } = renderHook(() => useEntryMode());
    const historyLength = window.history.length;

    act(() => result.current.replaceSiteParam('ke-gazi'));

    expect(window.location.pathname).toBe('/glowdex/');
    expect(window.location.search).toBe('?mode=local&site=ke-gazi');
    expect(window.history.length).toBe(historyLength);
    expect(result.current.siteParam).toBe('ke-gazi');
    expect(result.current.entryMode).toBe('local');
  });

  it('replaceSiteParam(null) removes the site param', () => {
    setUrl('/?mode=local&site=za-bayhead');
    const { result } = renderHook(() => useEntryMode());

    act(() => result.current.replaceSiteParam(null));

    expect(window.location.search).toBe('?mode=local');
    expect(result.current.siteParam).toBeNull();
  });

  it('enterLocalSite keeps unrelated params and the hash', () => {
    setUrl('/glowdex/?mode=global&utm_source=newsletter#about');
    const { result } = renderHook(() => useEntryMode());

    act(() => result.current.enterLocalSite('za-bayhead'));

    const params = new URLSearchParams(window.location.search);
    expect(params.get('mode')).toBe('local');
    expect(params.get('site')).toBe('za-bayhead');
    expect(params.get('utm_source')).toBe('newsletter');
    expect(window.location.hash).toBe('#about');
    expect(window.location.pathname).toBe('/glowdex/');
  });

  it('replaceSiteParam keeps unrelated params and the hash', () => {
    setUrl('/?mode=local&site=za-bayhead&utm_source=newsletter#about');
    const { result } = renderHook(() => useEntryMode());

    act(() => result.current.replaceSiteParam(null));

    expect(window.location.search).toBe('?mode=local&utm_source=newsletter');
    expect(window.location.hash).toBe('#about');
  });

  it('follows browser back/forward via popstate', () => {
    setUrl('/?mode=global');
    const { result } = renderHook(() => useEntryMode());
    act(() => result.current.enterLocalSite('za-bayhead'));

    act(() => {
      setUrl('/?mode=global');
      window.dispatchEvent(new PopStateEvent('popstate'));
    });

    expect(result.current.entryMode).toBe('global');
    expect(result.current.siteParam).toBeNull();
  });
});
