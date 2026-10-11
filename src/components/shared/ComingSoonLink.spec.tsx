import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ComingSoonLink, TOUCH_TOOLTIP_MS } from './ComingSoonLink';

const capture = vi.hoisted(() => vi.fn());
vi.mock('posthog-js/react', () => ({ usePostHog: () => ({ capture }) }));

function renderLink() {
  render(
    <ComingSoonLink
      targetId="methods"
      location="footer"
      className="hover:underline"
    >
      Methods
    </ComingSoonLink>,
  );
  const button = screen.getByRole('button', { name: 'Methods' });
  const tooltip = document.getElementById(
    button.getAttribute('aria-describedby')!,
  )!;
  return { button, tooltip };
}

beforeEach(() => capture.mockClear());
afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe('ComingSoonLink', () => {
  it('is a disabled-looking button described as "Coming soon", not a link', () => {
    const { button, tooltip } = renderLink();

    expect(button).toHaveAttribute('type', 'button');
    expect(button).toHaveAttribute('aria-disabled', 'true');
    expect(button).not.toHaveAttribute('href');
    expect(button).toHaveClass('hover:underline', 'decoration-dotted');
    expect(button).toHaveAccessibleDescription('Coming soon');
    expect(tooltip).toHaveAttribute('role', 'tooltip');
    expect(tooltip).toHaveTextContent(/^Coming soon$/);
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });

  it('shows the tooltip on mouse hover and hides it on leave', () => {
    const { button, tooltip } = renderLink();
    expect(tooltip).toHaveClass('hidden');

    fireEvent.pointerEnter(button, { pointerType: 'mouse' });
    expect(tooltip).toHaveClass('block');
    fireEvent.pointerLeave(button, { pointerType: 'mouse' });
    expect(tooltip).toHaveClass('hidden');
  });

  it('shows the tooltip on keyboard focus, and Esc and blur close it', () => {
    const { button, tooltip } = renderLink();

    act(() => button.focus());
    expect(tooltip).toHaveClass('block');
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(tooltip).toHaveClass('hidden');

    act(() => button.blur());
    act(() => button.focus());
    expect(tooltip).toHaveClass('block');
    act(() => button.blur());
    expect(tooltip).toHaveClass('hidden');
  });

  it('keeps the tooltip open while focused when the mouse moves away', () => {
    const { button, tooltip } = renderLink();

    act(() => button.focus());
    fireEvent.pointerEnter(button, { pointerType: 'mouse' });
    fireEvent.pointerLeave(button, { pointerType: 'mouse' });
    expect(tooltip).toHaveClass('block');
  });

  it('does not pin the tooltip open on focus from a click or tap', () => {
    const { button, tooltip } = renderLink();

    fireEvent.pointerDown(button, { pointerType: 'mouse' });
    act(() => button.focus());
    expect(tooltip).toHaveClass('hidden');
  });

  it('closes a hover-opened tooltip with Esc, without focus', () => {
    const { button, tooltip } = renderLink();

    fireEvent.pointerEnter(button, { pointerType: 'mouse' });
    expect(tooltip).toHaveClass('block');
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(tooltip).toHaveClass('hidden');
    // The next hover shows it again.
    fireEvent.pointerLeave(button, { pointerType: 'mouse' });
    fireEvent.pointerEnter(button, { pointerType: 'mouse' });
    expect(tooltip).toHaveClass('block');
  });

  it.each(['touch', 'pen'])(
    'shows the tooltip for about two seconds after a %s tap',
    (pointerType) => {
      vi.useFakeTimers();
      const { button, tooltip } = renderLink();

      fireEvent.pointerDown(button, { pointerType });
      expect(tooltip).toHaveClass('block');
      act(() => vi.advanceTimersByTime(TOUCH_TOOLTIP_MS - 1));
      expect(tooltip).toHaveClass('block');
      act(() => vi.advanceTimersByTime(1));
      expect(tooltip).toHaveClass('hidden');
    },
  );

  it('does not navigate or change the URL when clicked', () => {
    window.history.replaceState(null, '', '/glowdex/?x=1');
    const before = window.location.href;
    const { button } = renderLink();

    fireEvent.click(button);

    expect(window.location.href).toBe(before);
  });

  it('captures coming_soon_clicked once per click', () => {
    const { button } = renderLink();

    fireEvent.click(button);
    expect(capture).toHaveBeenCalledTimes(1);
    expect(capture).toHaveBeenCalledWith('coming_soon_clicked', {
      target_id: 'methods',
      location: 'footer',
      mode: null,
    });

    fireEvent.click(button);
    expect(capture).toHaveBeenCalledTimes(2);
  });
});
