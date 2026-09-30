import { useLayoutEffect, useRef, useState, type ReactNode } from 'react';

interface FitToStageProps {
  children: ReactNode;
}

/**
 * Centres `children` at their natural size and scales them down (never up) to
 * fit the stage, so every carousel step shares one fixed frame. Scaling is a
 * transform, so the widgets lay out (and Plotly measures) at their real width.
 * Without ResizeObserver (e.g. jsdom) the content renders unscaled.
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
      // offset* sizes ignore the transform, so this is the natural size.
      const width = content.offsetWidth;
      const height = content.offsetHeight;
      if (!width || !height) return;
      setScale(
        Math.min(1, stage.clientWidth / width, stage.clientHeight / height),
      );
    };

    // Content can grow after mount (charts, async data), so keep observing.
    const observer = new ResizeObserver(update);
    observer.observe(stage);
    observer.observe(content);
    update();
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={stageRef}
      className="flex h-full w-full items-center justify-center overflow-hidden"
    >
      <div
        ref={contentRef}
        data-fit-scale={scale}
        className="shrink-0"
        // Runtime value: can't be expressed as a static utility class.
        style={{ transform: `scale(${scale})` }}
      >
        {children}
      </div>
    </div>
  );
}
