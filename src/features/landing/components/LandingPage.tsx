import {
  Suspense,
  lazy,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { Hero } from './Hero';

// Lazy: the worked example reuses the app's widgets (plotly, react-markdown,
// …), which must not weigh down the hero's first paint.
const SeeItInAction = lazy(() =>
  import('./SeeItInAction/SeeItInAction').then((m) => ({
    default: m.SeeItInAction,
  })),
);

/** Reserves the section's space until its chunk has loaded. */
function SectionPlaceholder() {
  return <div aria-hidden="true" className="min-h-[900px] bg-[#f7f8f6]" />;
}

/** Mounts `children` once the placeholder scrolls within ~one viewport. */
function WhenNearViewport({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [isNear, setIsNear] = useState(
    () => typeof IntersectionObserver === 'undefined',
  );

  useEffect(() => {
    if (isNear || !ref.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) setIsNear(true);
      },
      { rootMargin: '100% 0px' },
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [isNear]);

  return isNear ? (
    children
  ) : (
    <div ref={ref}>
      <SectionPlaceholder />
    </div>
  );
}

/** Public landing page at `/`: the hero, then the worked example. */
export function LandingPage() {
  return (
    <>
      <Hero />
      <WhenNearViewport>
        <Suspense fallback={<SectionPlaceholder />}>
          <SeeItInAction />
        </Suspense>
      </WhenNearViewport>
    </>
  );
}
