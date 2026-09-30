import {
  Component,
  Suspense,
  lazy,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { FactSheet } from './FactSheet';
import { Hero } from './Hero';
import { WhoItsFor } from './WhoItsFor';

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

interface SectionErrorBoundaryProps {
  children: ReactNode;
}

interface SectionErrorBoundaryState {
  hasError: boolean;
}

/**
 * Contains a failure in an optional below-the-fold section (e.g. its lazy
 * chunk failing to load after a redeploy) so it can't take the hero — and the
 * way into the map — down with it. The section is simply omitted.
 */
class SectionErrorBoundary extends Component<
  SectionErrorBoundaryProps,
  SectionErrorBoundaryState
> {
  state: SectionErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): SectionErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    console.error('Landing page section failed to load:', error);
  }

  render() {
    return this.state.hasError ? null : this.props.children;
  }
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

/** Public landing page at `/`: the hero, the fact sheet, the worked example, then who it's for. */
export function LandingPage() {
  return (
    <main>
      <Hero />
      <FactSheet />
      <SectionErrorBoundary>
        <WhenNearViewport>
          <Suspense fallback={<SectionPlaceholder />}>
            <SeeItInAction />
          </Suspense>
        </WhenNearViewport>
      </SectionErrorBoundary>
      <WhoItsFor />
    </main>
  );
}
