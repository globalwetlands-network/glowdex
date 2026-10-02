import { useLayoutEffect, useRef, useState, type ReactNode } from 'react';

/**
 * Tailwind's `md`. Below it the stage is narrower than a panel, and scaling a
 * panel down would shrink its text past readability (and defeat browser zoom),
 * so panels lay out at the stage width and the stage scrolls instead.
 */
const SCALE_QUERY = '(min-width: 768px)';

interface FitToStageProps {
  children: ReactNode;
}

/**
 * From `md` up, centres `children` at their natural size and scales them down
 * (never up) to fit the stage, so every carousel step shares one fixed frame.
 * Scaling is a transform, so the widgets lay out (and Plotly measures) at
 * their real width. Below `md` nothing is scaled: `children` take the stage
 * width and the stage scrolls vertically. Without ResizeObserver (e.g. jsdom)
 * the content renders unscaled.
 */
export function FitToStage({ children }: FitToStageProps) {
  const stageRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useLayoutEffect(() => {
    const stage = stageRef.current;
    const content = contentRef.current;
    if (!stage || !content || typeof ResizeObserver === 'undefined') return;

    const update = () => {
      if (window.matchMedia?.(SCALE_QUERY).matches === false) {
        setScale(1);
        return;
      }
      // offset* sizes ignore the transform, so this is the natural size.
      const width = content.offsetWidth;
      const height = content.offsetHeight;
      if (!width || !height) return;
      setScale(
        Math.min(1, stage.clientWidth / width, stage.clientHeight / height),
      );
    };

    // Content can grow after mount (charts, async data), and resizing across
    // the breakpoint resizes the stage, so keep observing both.
    const observer = new ResizeObserver(update);
    observer.observe(stage);
    observer.observe(content);
    update();
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={stageRef}
      className="flex h-full w-full items-start justify-center overflow-y-auto md:items-center md:overflow-hidden"
    >
      <div
        ref={contentRef}
        data-fit-scale={scale}
        className="w-full md:w-auto md:shrink-0"
        // Runtime value: can't be expressed as a static utility class.
        style={{ transform: `scale(${scale})` }}
      >
        {children}
      </div>
    </div>
  );
}
