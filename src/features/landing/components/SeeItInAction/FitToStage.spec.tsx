import { act, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { FitToStage } from './FitToStage';

function renderFitted() {
  render(
    <FitToStage>
      <div>content</div>
    </FitToStage>,
  );
  const content = screen.getByText('content').parentElement!;
  return { content, stage: content.parentElement! };
}

/** Gives an element fixed layout sizes (jsdom does no layout). */
function setSize(el: HTMLElement, width: number, height: number) {
  for (const [prop, value] of [
    ['offsetWidth', width],
    ['offsetHeight', height],
    ['clientWidth', width],
    ['clientHeight', height],
  ] as const) {
    Object.defineProperty(el, prop, { configurable: true, value });
  }
}

describe('FitToStage', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('renders unscaled without ResizeObserver', () => {
    vi.stubGlobal('ResizeObserver', undefined);
    const { content } = renderFitted();

    expect(content.dataset.fitScale).toBe('1');
  });

  it('scales content down to fit the stage, and never up', () => {
    let notify = () => {};
    vi.stubGlobal(
      'ResizeObserver',
      class {
        constructor(callback: () => void) {
          notify = callback;
        }
        observe() {}
        disconnect() {}
      },
    );
    const { content, stage } = renderFitted();

    // A 448×650 panel in a 400×520 stage: height is the tighter fit (0.8).
    setSize(stage, 400, 520);
    setSize(content, 448, 650);
    act(() => notify());
    expect(Number(content.dataset.fitScale)).toBeCloseTo(0.8);
    expect(content.style.transform).toBe('scale(0.8)');

    // Content smaller than the stage stays at its natural size.
    setSize(content, 200, 100);
    act(() => notify());
    expect(content.dataset.fitScale).toBe('1');
  });

  it('never scales below md, where the stage scrolls instead', () => {
    let notify = () => {};
    vi.stubGlobal(
      'ResizeObserver',
      class {
        constructor(callback: () => void) {
          notify = callback;
        }
        observe() {}
        disconnect() {}
      },
    );
    vi.stubGlobal('matchMedia', (query: string) => ({
      matches: false,
      media: query,
    }));
    const { content, stage } = renderFitted();

    // Content that would need 0.8 on desktop stays full size on a phone.
    setSize(stage, 400, 520);
    setSize(content, 448, 650);
    act(() => notify());
    expect(content.dataset.fitScale).toBe('1');
    expect(stage).toHaveClass('overflow-y-auto');
  });
});
