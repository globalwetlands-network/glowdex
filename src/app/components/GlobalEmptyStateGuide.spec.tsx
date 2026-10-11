import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { GlobalEmptyStateGuide } from './GlobalEmptyStateGuide';
import { TILE_GUIDE_SEEN_KEY, markTileGuideSeen } from './tileGuideSeen';

function mockReducedMotion(matches: boolean) {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches,
    media: query,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }));
}

describe('GlobalEmptyStateGuide', () => {
  beforeEach(() => {
    localStorage.clear();
    mockReducedMotion(false);
  });
  afterEach(() => vi.useRealTimers());

  it('keeps the existing prompt copy', () => {
    render(<GlobalEmptyStateGuide />);
    expect(
      screen.getByText('Select a colored tile on the map to get started'),
    ).toBeInTheDocument();
    expect(
      screen.getByText('Use the search box to navigate to a specific location'),
    ).toBeInTheDocument();
  });

  it('shows the two steps and no replay button on first visit', () => {
    render(<GlobalEmptyStateGuide />);
    expect(
      screen.getByText('Click a tile anywhere on the map'),
    ).toBeInTheDocument();
    expect(
      screen.getByText('See its typology, from satellite-derived estimates'),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /Replay guide/ }),
    ).not.toBeInTheDocument();
  });

  it('highlights step 2 once the loop reaches the card phase', () => {
    vi.useFakeTimers();
    render(<GlobalEmptyStateGuide />);
    const step2 = screen
      .getByText('See its typology, from satellite-derived estimates')
      .closest('li')!;
    expect(step2).not.toHaveAttribute('aria-current');
    act(() => vi.advanceTimersByTime(4000));
    expect(step2).toHaveAttribute('aria-current', 'step');
  });

  it('shows static steps and a replay button after a tile has been selected', () => {
    markTileGuideSeen();
    expect(localStorage.getItem(TILE_GUIDE_SEEN_KEY)).toBe('true');
    render(<GlobalEmptyStateGuide />);
    const replay = screen.getByRole('button', { name: /Replay guide/ });
    fireEvent.click(replay);
    expect(
      screen.queryByRole('button', { name: /Replay guide/ }),
    ).not.toBeInTheDocument();
  });

  it('shows the final frame without a pointer for reduced motion', () => {
    mockReducedMotion(true);
    render(<GlobalEmptyStateGuide />);
    expect(screen.getByText('Bayhead, South Africa')).toBeInTheDocument();
    const step2 = screen
      .getByText('See its typology, from satellite-derived estimates')
      .closest('li')!;
    expect(step2).not.toHaveAttribute('aria-current');
  });
});
