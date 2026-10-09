import { describe, it, expect, vi, afterEach } from 'vitest';
import { Suspense, lazy } from 'react';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { MapAppErrorBoundary } from './MapAppErrorBoundary';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe('MapAppErrorBoundary', () => {
  it('renders its children when nothing fails', () => {
    render(
      <MapAppErrorBoundary>
        <p>Map app</p>
      </MapAppErrorBoundary>,
    );

    expect(screen.getByText('Map app')).toBeInTheDocument();
  });

  it('shows a reload screen when the lazy map chunk fails to load', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const FailingApp = lazy(() =>
      Promise.reject(new Error('Failed to fetch dynamically imported module')),
    );

    render(
      <MapAppErrorBoundary>
        <Suspense fallback={<p>Loading</p>}>
          <FailingApp />
        </Suspense>
      </MapAppErrorBoundary>,
    );

    expect(
      await screen.findByText(/couldn't load the map/i),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /reload/i })).toBeInTheDocument();
  });

  it('calls onReload when the reload button is clicked', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const onReload = vi.fn();
    const Throws = () => {
      throw new Error('boom');
    };

    render(
      <MapAppErrorBoundary onReload={onReload}>
        <Throws />
      </MapAppErrorBoundary>,
    );

    fireEvent.click(await screen.findByRole('button', { name: /reload/i }));

    expect(onReload).toHaveBeenCalledTimes(1);
  });
});
